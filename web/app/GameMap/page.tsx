import React from 'react';
import GameMap from './GameMap';
import { MapInfo, BuildingData } from './types';

const sampleMapInfo: MapInfo = {
  id: 'map_02_procedural',
  name: '低语群岛',
  x: 2048,
  y: 2048,
};

// 示例建筑列表，注意它们的坐标
const sampleBuildings: BuildingData[] = [
  // 部落1 (可能会在一个大的草地区)
  { id: 'b01', name: '主城', x: 1800, y: 1800, color: '#8B4513', emoji: '🏰' },
  { id: 'b02', name: '兵营', x: 1880, y: 1750, color: '#B22222', emoji: '⚔️' },
  { id: 'b03', name: '农场', x: 1720, y: 1750, color: '#228B22', emoji: '🌾' },
  { id: 'b04', name: '伐木场', x: 1850, y: 1880, color: '#A0522D', emoji: '🌲' },
  
  // 部落2 (可能会在一个沙滩或小岛上)
  { id: 'b05', name: '港口', x: 3000, y: 1000, color: '#4682B4', emoji: '⚓' },
  { id: 'b06', name: '灯塔', x: 3080, y: 950, color: '#556B2F', emoji: '💡' },
  { id: 'b07', name: '市场', x: 2950, y: 1080, color: '#696969', emoji: '⚖️' },

  // 偏远的建筑
  { id: 'b08', name: '魔法塔', x: 500, y: 3500, color: '#4B0082', emoji: '🧙' },
  
  // --- 以下建筑用于测试地形限制 ---
  // 这个坐标很可能在水里，所以它不会被渲染出来
  { id: 'b09_water', name: '沉没的遗迹', x: 1000, y: 1000, color: '#00008B', emoji: '🏺' },
  // 这个坐标很可能在森林里，也不会被渲染
  { id: 'b10_forest', name: '猎人小屋', x: 3500, y: 3500, color: '#2F4F4F', emoji: '🏹' },
];

function GameMapPage() {
  return (
    <div className="w-full h-screen">
      <GameMap mapInfo={sampleMapInfo} buildings={sampleBuildings} />
    </div>
  );
}

export default GameMapPage;