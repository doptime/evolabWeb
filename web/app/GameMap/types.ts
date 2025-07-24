export interface MapInfo {
  id: string;
  name: string;
  x: number; // 初始中心点 X
  y: number; // 初始中心点 Y
}

export interface BuildingData {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  emoji: string; // 新增 emoji 属性
}

// 定义地形类型
export type TerrainType = 'water' | 'sand' | 'grass' | 'forest';
