import React from 'react';
import { BuildingData } from './types';

interface MinimapProps {
  buildings: BuildingData[];
  mapWidth: number;
  mapHeight: number;
  viewPort: {
    x: number;
    y: number;
    scale: number;
  };
  containerSize: {
    width: number;
    height: number;
  };
}

const MINIMAP_SIZE = 256; // 256px

const Minimap: React.FC<MinimapProps> = ({
  buildings,
  mapWidth,
  mapHeight,
  viewPort,
  containerSize,
}) => {
  const scaleX = MINIMAP_SIZE / mapWidth;
  const scaleY = MINIMAP_SIZE / mapHeight;

  // 计算视口矩形在缩略图上的位置和大小
  const viewRectWidth = (containerSize.width / viewPort.scale) * scaleX;
  const viewRectHeight = (containerSize.height / viewPort.scale) * scaleY;
  const viewRectX = (-viewPort.x / viewPort.scale) * scaleX;
  const viewRectY = (-viewPort.y / viewPort.scale) * scaleY;

  return (
    <div
      className="absolute bottom-4 left-4 w-64 h-64 bg-green-800/70 border-2 border-yellow-300 rounded-md overflow-hidden backdrop-blur-sm"
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
    >
      {/* 渲染建筑物的红点 */}
      {buildings.map((building) => (
        <div
          key={building.id}
          className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
          style={{
            left: `${building.x * scaleX}px`,
            top: `${building.y * scaleY}px`,
            transform: 'translate(-50%, -50%)',
          }}
          title={building.name}
        />
      ))}

      {/* 渲染当前视口的红色矩形 */}
      <div
        className="absolute border-2 border-red-500"
        style={{
          width: `${viewRectWidth}px`,
          height: `${viewRectHeight}px`,
          transform: `translate(${viewRectX}px, ${viewRectY}px)`,
          transition: 'transform 0.1s ease-out, width 0.1s ease-out, height 0.1s ease-out',
        }}
      />
    </div>
  );
};

export default Minimap;