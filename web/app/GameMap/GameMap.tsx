'use client';
import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Loader2 } from 'lucide-react';

import { MapInfo, BuildingData } from './types';
import { getTerrainType, drawRealisticTerrain } from './terrainGenerator';
import Building from './Building';
import Minimap from './Minimap';

// --- 常量定义 ---
const MAP_WIDTH = 4096;
const MAP_HEIGHT = 4096;

// --- 内部子组件：道路 ---
// 这个组件足够简单，可以直接定义在主文件内
const Road: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number } }> = ({ from, to }) => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
  const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));

  return (
    <div
      className="absolute h-1.5 bg-amber-800/50 rounded-full"
      style={{
        left: `${from.x}px`,
        top: `${from.y}px`,
        width: `${distance}px`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
        boxShadow: '0 0 5px rgba(46, 26, 3, 0.3)',
      }}
    />
  );
};


// --- 主地图组件 ---
interface GameMapProps {
  mapInfo: MapInfo;
  buildings: BuildingData[];
}

const GameMap: React.FC<GameMapProps> = ({ mapInfo, buildings }) => {
  // --- State 和 Refs ---
  const [viewPort, setViewPort] = useState({ x: 0, y: 0, scale: 1 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isTerrainLoading, setIsTerrainLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Effects ---

  // Effect 1: 异步生成地形纹理
  // 这个 effect 只在组件首次挂载时运行一次。
  useEffect(() => {
    const generateMap = async () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          setIsTerrainLoading(true);
          console.log("Starting realistic terrain generation...");
          await drawRealisticTerrain(ctx);
          console.log("Terrain generation complete.");
          setIsTerrainLoading(false);
        }
      }
    };
    generateMap();
  }, []); // 空依赖数组确保只运行一次

  // Effect 2: 设置初始地图位置
  // 在布局计算完成后运行，以获取准确的容器尺寸。
  useLayoutEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });

      // 将地图中心定位到 mapInfo 指定的坐标
      if (transformRef.current) {
        const initialScale = 0.5; // 初始缩放级别，可以调整
        transformRef.current.setTransform(
          -mapInfo.x * initialScale + width / 2,
          -mapInfo.y * initialScale + height / 2,
          initialScale,
          100, // 动画时长 (ms)
          'easeOut'
        );
      }
    }
  }, [mapInfo.x, mapInfo.y]); // 依赖于初始坐标

  // --- 渲染逻辑 ---

  // 1. 过滤出可以放置的建筑
  // 使用 useMemo 可以在 buildings 列表不变时避免重复计算
  const placeableBuildings = React.useMemo(() => {
    console.log("Filtering placeable buildings...");
    return buildings.filter(b => {
      const terrain = getTerrainType(b.x, b.y);
      // 建筑物只能在草地和沙地上
      return terrain === 'grass' || terrain === 'sand';
    });
  }, [buildings]);

  // 2. 生成道路
  // 使用 useMemo 可以在可放置建筑列表不变时避免重复计算
  const roadsToRender = React.useMemo(() => {
    console.log("Generating roads...");
    const roads = [];
    const connected = new Set<string>();
    const DISTANCE_THRESHOLD = 400; // 只连接此距离内的建筑

    // 辅助函数：检查道路路径是否穿过水域
    const isPathValid = (from: {x: number, y: number}, to: {x: number, y: number}): boolean => {
      const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
      const steps = Math.floor(distance / 50); // 每50px检查一次地形
      if (steps < 2) return true; // 短距离直接视为有效

      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const checkX = from.x + t * (to.x - from.x);
        const checkY = from.y + t * (to.y - from.y);
        if (getTerrainType(checkX, checkY) === 'water') {
          return false; // 道路穿过水域，无效
        }
      }
      return true;
    };

    for (let i = 0; i < placeableBuildings.length; i++) {
      for (let j = i + 1; j < placeableBuildings.length; j++) {
        const b1 = placeableBuildings[i];
        const b2 = placeableBuildings[j];
        const distance = Math.sqrt(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2));

        if (distance < DISTANCE_THRESHOLD) {
          if (isPathValid(b1, b2)) {
            const roadKey = [b1.id, b2.id].sort().join('-');
            if (!connected.has(roadKey)) {
              roads.push(<Road key={roadKey} from={b1} to={b2} />);
              connected.add(roadKey);
            }
          }
        }
      }
    }
    return roads;
  }, [placeableBuildings]);


  // --- JSX 输出 ---
  return (
    <div ref={containerRef} className="w-full h-screen bg-gray-900 relative overflow-hidden select-none">
      {/* 加载指示器 */}
      {isTerrainLoading && (
        <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white transition-opacity duration-300">
          <Loader2 className="w-16 h-16 animate-spin mb-4" />
          <p className="text-xl font-semibold">正在生成逼真地形...</p>
        </div>
      )}

      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        initialPositionX={0}
        initialPositionY={0}
        minScale={0.1}
        maxScale={3}
        limitToBounds={false} // 允许地图移出视口边界
        onTransformed={(_, state) => setViewPort({ x: state.positionX, y: state.positionY, scale: state.scale })}
        wheel={{ step: 0.1 }}
        panning={{ velocityDisabled: true }} // 禁用滑动惯性，手感更稳定
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%', visibility: isTerrainLoading ? 'hidden' : 'visible' }}
          contentStyle={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
        >
          <div className="relative bg-blue-900" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
            {/* 地形 Canvas 背景 */}
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              className="absolute top-0 left-0"
            />
            
            {/* 游戏元素渲染层 */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {/* 道路层 */}
              <div className="pointer-events-auto">{roadsToRender}</div>
              {/* 建筑层 */}
              <div className="pointer-events-auto">
                {placeableBuildings.map((building) => (
                  <Building key={building.id} building={building} />
                ))}
              </div>
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* 静态 UI 元素 */}
      <div className="absolute top-4 left-4 bg-black/60 text-white p-3 rounded-lg shadow-lg pointer-events-none backdrop-blur-sm">
        <h1 className="text-xl font-bold">{mapInfo.name}</h1>
        <p className="text-sm text-gray-300">ID: {mapInfo.id}</p>
      </div>

      {/* 缩略图 (仅在地形加载完毕后显示) */}
      {!isTerrainLoading && containerSize.width > 0 && (
        <Minimap
          buildings={placeableBuildings}
          mapWidth={MAP_WIDTH}
          mapHeight={MAP_HEIGHT}
          viewPort={viewPort}
          containerSize={containerSize}
        />
      )}
    </div>
  );
};

export default GameMap;
