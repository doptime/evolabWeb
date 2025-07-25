'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BuildingData, MapInfo } from './types';

interface GameMapProps {
  mapInfo: MapInfo;
  buildings: BuildingData[];
}

// 修复 Leaflet 默认图标问题
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// 创建自定义建筑图标
const createBuildingIcon = (building: BuildingData) => {
  return L.divIcon({
    html: `
      <div class="w-8 h-8 rounded-lg border-2 border-white shadow-lg flex items-center justify-center text-base cursor-pointer transition-transform hover:scale-110" 
           style="background: ${building.color};" 
           title="${building.name}">
        ${building.emoji}
        <div style="font-size: 0.7em; margin-top: 2px; font-weight: bold; white-space: nowrap;">${building.name}</div>
      </div>
    `,
    className: 'bg-transparent border-none',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// 地图中心控制组件
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);

  return null;
};

// 简化的小地图组件
const SimpleMinimap: React.FC<{
  buildings: BuildingData[];
  mapInfo: MapInfo;
}> = ({ buildings, mapInfo }) => {
  return (
    <div className="absolute bottom-4 left-4 w-64 h-64 bg-white/90 backdrop-blur-sm border-2 border-gray-300 rounded-lg overflow-hidden z-[1000]">
      <div className="h-full relative bg-gradient-to-br from-green-200 to-blue-200">
        {/* 渲染建筑物红点 */}
        {buildings.map((building) => {
          const x = (building.x / 4096) * 256;
          const y = (building.y / 4096) * 256;
          return (
            <div
              key={building.id}
              className="absolute w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}px`,
                top: `${y}px`,
              }}
              title={building.name}
            />
          );
        })}

        {/* 当前中心点 */}
        <div
          className="absolute w-3 h-3 bg-blue-600 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(mapInfo.x / 4096) * 256}px`,
            top: `${(mapInfo.y / 4096) * 256}px`,
          }}
        />

        <div className="absolute bottom-1 left-1 text-xs text-gray-600 bg-white/70 px-1 rounded">
          缩略图
        </div>
      </div>
    </div>
  );
};

const GameMap: React.FC<GameMapProps> = ({ mapInfo, buildings }) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // 将游戏坐标转换为地理坐标
  const gameToLatLng = (x: number, y: number): [number, number] => {
    // 简单的坐标转换：将4096x4096的游戏坐标映射到合理的经纬度范围
    const lat = 50 - (y / 4096) * 20; // 纬度范围：30-50
    const lng = -10 + (x / 4096) * 20; // 经度范围：-10到10
    return [lat, lng];
  };

  const mapCenter = gameToLatLng(mapInfo.x, mapInfo.y);


  return (
    <div className="w-full h-screen relative">
      <MapContainer
        center={mapCenter}
        zoom={10}
        className="h-full w-full"
        whenCreated={setMapInstance}
      >
        {/* 使用 OpenStreetMap 瓦片 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} />

        {/* 渲染建筑物 */}
        {buildings.map((building) => {
          const position = gameToLatLng(building.x, building.y);
          return (
            <Marker
              key={building.id}
              position={position}
              icon={createBuildingIcon(building)}
            >
              <Popup>
                <div className="text-center p-2">
                  <div className="text-2xl mb-1">{building.emoji}</div>
                  <div className="font-bold text-lg">{building.name}</div>
                  <div className="text-sm text-gray-600">
                    坐标: ({building.x}, {building.y})
                  </div>
                  <div
                    className="w-4 h-4 rounded mx-auto mt-2"
                    style={{ backgroundColor: building.color }}
                  />
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* 地图信息面板 */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[1000] pointer-events-auto">
        <h1 className="text-xl font-bold mb-1 text-gray-800">{mapInfo.name}</h1>
        <p className="text-sm text-gray-600">ID: {mapInfo.id}</p>
        <p className="text-sm text-gray-600">建筑数量: {buildings.length}</p>
        <p className="text-xs text-gray-500 mt-2">
          中心坐标: ({mapInfo.x}, {mapInfo.y})
        </p>
      </div>

      {/* 简化版小地图 */}
      {mapInstance && (
        <SimpleMinimap
          buildings={buildings}
          mapInfo={mapInfo}
        />
      )}

      {/* 控制说明 */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000] pointer-events-none">
        <p className="text-sm text-gray-700">🖱️ 拖拽移动 | 🔍 滚轮缩放 | 📍 点击建筑查看详情</p>
      </div>
    </div>
  );
};

export default GameMap;