import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

import { MapInfo, BuildingData, TerrainType } from './types';
import { getTerrainType, drawTerrain } from './terrainGenerator';
import Building from './Building';
import Minimap from './Minimap'; // Minimap 组件无需修改

const MAP_WIDTH = 4096;
const MAP_HEIGHT = 4096;

// 道路组件 (简单修改样式)
const Road: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number } }> = ({ from, to }) => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
  const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));

  return (
    <div
      className="absolute h-1.5 bg-amber-700/60 rounded-full"
      style={{
        left: `${from.x}px`,
        top: `${from.y}px`,
        width: `${distance}px`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
        boxShadow: '0 0 5px rgba(0,0,0,0.2)',
      }}
    />
  );
};

const GameMap: React.FC<GameMapProps> = ({ mapInfo, buildings }) => {
  const [viewPort, setViewPort] = useState({ x: 0, y: 0, scale: 1 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 仅在组件挂载时绘制一次地形
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        drawTerrain(ctx);
      }
    }
  }, []);

  // 初始定位
  useLayoutEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setContainerSize({ width, height });
      if (transformRef.current) {
        const initialScale = 0.5;
        transformRef.current.setTransform(
          -mapInfo.x * initialScale + width / 2,
          -mapInfo.y * initialScale + height / 2,
          initialScale,
          100,
          'easeOut'
        );
      }
    }
  }, [mapInfo.x, mapInfo.y]);

  // --- 新增地形判断逻辑 ---

  // 1. 过滤掉不能建造的建筑
  const placeableBuildings = buildings.filter(b => {
    const terrain = getTerrainType(b.x, b.y);
    // 建筑物只能在草地和沙地上
    return terrain === 'grass' || terrain === 'sand';
  });

  // 2. 检查道路是否穿过水域
  const isPathValid = (from: {x: number, y: number}, to: {x: number, y: number}): boolean => {
    const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    const steps = Math.floor(distance / 50); // 每50px检查一次
    if (steps < 1) return true;

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

  // 3. 生成道路，并应用地形规则
  const generateRoads = () => {
    const roads = [];
    const connected = new Set<string>();
    const DISTANCE_THRESHOLD = 400;

    // 注意：这里要用 placeableBuildings，而不是原始的 buildings 列表
    for (let i = 0; i < placeableBuildings.length; i++) {
      for (let j = i + 1; j < placeableBuildings.length; j++) {
        const b1 = placeableBuildings[i];
        const b2 = placeableBuildings[j];
        const distance = Math.sqrt(Math.pow(b1.x - b2.x, 2) + Math.pow(b1.y - b2.y, 2));

        if (distance < DISTANCE_THRESHOLD) {
          // 检查道路路径是否有效
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
  };

  return (
    <div ref={containerRef} className="w-full h-screen bg-gray-900 relative overflow-hidden">
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.1}
        maxScale={3}
        limitToBounds={false}
        onTransformed={(_, state) => setViewPort({ x: state.positionX, y: state.positionY, scale: state.scale })}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
        >
          <div className="relative" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
            {/* 地形 Canvas 背景 */}
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              className="absolute top-0 left-0"
            />
            
            {/* 渲染层 */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {/* 道路 */}
              <div className="pointer-events-auto">{generateRoads()}</div>
              {/* 建筑 */}
              <div className="pointer-events-auto">
                {placeableBuildings.map((building) => (
                  <Building key={building.id} building={building} />
                ))}
              </div>
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* UI 元素 */}
      <div className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-lg shadow-lg pointer-events-none">
        <h1 className="text-xl font-bold">{mapInfo.name}</h1>
        <p className="text-sm text-gray-300">ID: {mapInfo.id}</p>
      </div>

      {containerSize.width > 0 && (
        <Minimap
          buildings={placeableBuildings} // 传递过滤后的建筑列表
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
