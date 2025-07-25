import React, { memo } from 'react';
import { BuildingData } from './types';

interface BuildingProps {
  building: BuildingData;
}

const Building: React.FC<BuildingProps> = memo(({ building }) => {
  return (
    <div
      className="absolute w-16 h-16 flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-pointer group rounded-lg shadow-xl border-2 border-black/20"
      style={{
        left: `${building.x}px`,
        top: `${building.y}px`,
        transform: 'translate(-50%, -50%) translate3d(0,0,0)', // 启用硬件加速
        backgroundColor: building.color,
        willChange: 'transform', // 优化动画性能
      }}
      title={building.name}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-3xl drop-shadow-lg">{building.emoji}</span>
        <span className="text-xs font-bold text-white mt-1 truncate px-1">
          {building.name}
        </span>
      </div>
      
      {/* 悬浮提示 */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {building.name}
      </div>
    </div>
  );
});

Building.displayName = 'Building';

export default Building;