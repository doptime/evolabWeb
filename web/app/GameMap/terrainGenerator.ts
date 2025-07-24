'use client';
import { createNoise2D } from 'simplex-noise';
import { TerrainType } from '../types';

const MAP_WIDTH = 4096;
const MAP_HEIGHT = 4096;

// 1. 定义纹理图片路径
const TEXTURE_PATHS: Record<TerrainType, string> = {
  water: '/textures/water.jpg',
  sand: '/textures/sand.jpg',
  grass: '/textures/grass.jpg',
  forest: '/textures/forest.jpg',
};

// 2. 创建多个噪声函数，用于生成更复杂的地形
const baseNoise = createNoise2D(() => 0.1); // 主地形噪声
const detailNoise = createNoise2D(() => 0.2); // 细节噪声 (如草地斑块)
const foamNoise = createNoise2D(() => 0.3); // 海岸线泡沫噪声

// 3. 定义地形阈值
const WATER_LEVEL = -0.3;
const SAND_LEVEL = -0.2;
const GRASS_LEVEL = 0.4;
// 高于 GRASS_LEVEL 的是 forest

// 辅助函数：加载图片并创建纹理图案
async function createTexturePattern(src: string, ctx: CanvasRenderingContext2D): Promise<CanvasPattern> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(ctx.createPattern(img, 'repeat')!);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 根据坐标获取地形的海拔值（由噪声生成）
 * @param x 
 * @param y 
 * @returns number - 海拔值 (-1 to 1)
 */
function getElevation(x: number, y: number): number {
  // 叠加不同频率的噪声来创建更自然的地形
  const baseFreq = 0.0008; // 基础频率，决定大陆和海洋
  const mediumFreq = 0.004; // 中等频率，决定山丘和湖泊
  const smallFreq = 0.01;  // 高频，决定小土丘

  let value = 0;
  value += baseNoise(x * baseFreq, y * baseFreq) * 0.6;       // 60% 权重
  value += baseNoise(x * mediumFreq, y * mediumFreq) * 0.3;   // 30% 权重
  value += baseNoise(x * smallFreq, y * smallFreq) * 0.1;     // 10% 权重
  
  return value;
}

/**
 * 根据坐标获取地形类型
 * @param x 
 * @param y 
 * @returns TerrainType
 */
export function getTerrainType(x: number, y: number): TerrainType {
  const elevation = getElevation(x, y);
  if (elevation < WATER_LEVEL) return 'water';
  if (elevation < SAND_LEVEL) return 'sand';
  if (elevation < GRASS_LEVEL) return 'grass';
  return 'forest';
}

/**
 * 核心：在 Canvas 上绘制逼真的、平滑过渡的地形
 * @param ctx - Canvas 2D 渲染上下文
 */
export async function drawRealisticTerrain(ctx: CanvasRenderingContext2D) {
  console.time('Terrain Generation');

  // 1. 加载所有纹理并创建图案
  const patterns = {
    water: await createTexturePattern(TEXTURE_PATHS.water, ctx),
    sand: await createTexturePattern(TEXTURE_PATHS.sand, ctx),
    grass: await createTexturePattern(TEXTURE_PATHS.grass, ctx),
    forest: await createTexturePattern(TEXTURE_PATHS.forest, ctx),
  };

  // 2. 绘制基础水体层
  ctx.fillStyle = patterns.water;
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 3. 逐像素（或逐单元格）进行纹理混合
  const resolution = 8; // 单元格大小，值越小越精细，但越慢
  const transitionWidth = 0.1; // 过渡带的宽度 (噪声值的范围)

  for (let y = 0; y < MAP_HEIGHT; y += resolution) {
    for (let x = 0; x < MAP_WIDTH; x += resolution) {
      const elevation = getElevation(x, y);

      // --- 绘制沙滩并与水体平滑过渡 ---
      if (elevation >= WATER_LEVEL && elevation < SAND_LEVEL + transitionWidth) {
        let alpha = 1.0;
        if (elevation < WATER_LEVEL + transitionWidth) {
          // 在过渡带内，计算透明度
          alpha = (elevation - WATER_LEVEL) / transitionWidth;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = patterns.sand;
        ctx.fillRect(x, y, resolution, resolution);
      }

      // --- 绘制草地并与沙滩平滑过渡 ---
      if (elevation >= SAND_LEVEL && elevation < GRASS_LEVEL + transitionWidth) {
        let alpha = 1.0;
        if (elevation < SAND_LEVEL + transitionWidth) {
          alpha = (elevation - SAND_LEVEL) / transitionWidth;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = patterns.grass;
        ctx.fillRect(x, y, resolution, resolution);
      }
      
      // --- 绘制森林并与草地平滑过渡 ---
      if (elevation >= GRASS_LEVEL) {
        let alpha = 1.0;
        if (elevation < GRASS_LEVEL + transitionWidth) {
          alpha = (elevation - GRASS_LEVEL) / transitionWidth;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = patterns.forest;
        ctx.fillRect(x, y, resolution, resolution);
      }
      
      // --- 增加细节：海岸线泡沫 ---
      const foamValue = foamNoise(x * 0.05, y * 0.05);
      if (elevation > WATER_LEVEL - 0.02 && elevation < WATER_LEVEL + 0.02 && foamValue > 0.5) {
        ctx.globalAlpha = foamValue - 0.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(x, y, resolution, resolution);
      }
    }
  }

  // 恢复默认透明度
  ctx.globalAlpha = 1.0;
  console.timeEnd('Terrain Generation');
}
