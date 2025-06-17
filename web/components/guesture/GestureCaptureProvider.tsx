"use client";
// src/components/GestureCaptureProvider.tsx

import { useEffect, useRef, useState } from 'react';
import { gestureService } from './gestureService';
import { gestureProcessor } from './gestureProcessor';
import { useGestureStore } from './gestureStore';

export const GestureCaptureProvider = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameId = useRef<number>();
  const setGesture = useGestureStore((state) => state.setGesture);
  const [isReady, setIsReady] = useState(false);

  // 步骤1：初始化服务和摄像头
  useEffect(() => {
    async function setup() {
      await gestureService.initialize();
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', () => {
              setIsReady(true);
              console.log("Camera ready, starting prediction loop.");
            });
          }
        } catch (error) {
          console.error("Error accessing webcam:", error);
        }
      }
    }
    setup();
    
    // 清理函数
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  }, []);

  // 步骤2：启动预测循环
  useEffect(() => {
    const predict = () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        animationFrameId.current = requestAnimationFrame(predict);
        return;
      }

      const startTimeMs = performance.now();
      const results = gestureService.detect(videoRef.current, startTimeMs);

      if (results && results.landmarks) {
        // 将原始数据交给处理器
        const newGesture = gestureProcessor.process(results);
        
        // ⭐ 更新 Zustand Store！
        setGesture(newGesture);
      }
      
      animationFrameId.current = requestAnimationFrame(predict);
    };

    if (isReady) {
      predict();
    }
    
  }, [isReady, setGesture]);

  return (
    // 在开发时显示视频以方便调试，在生产环境中可以隐藏
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '240px',
        height: '180px',
        transform: 'scaleX(-1)', // 镜像翻转，更符合直觉
        zIndex: 9999,
        opacity: 0.5, // 半透明
      }}
    />
  );
};