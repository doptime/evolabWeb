"use client";
// src/components/GestureCaptureProvider.tsx

import { useEffect, useRef, useState, ReactNode } from 'react'; // Import ReactNode
import { gestureService } from './gestureService';
import { gestureProcessor } from './gestureProcessor';
import { useGestureStore } from './gestureStore';

// Define the props for the component, including children
interface GestureCaptureProviderProps {
  children?: ReactNode; // Make children optional
}

export const GestureCaptureProvider = ({ children }: GestureCaptureProviderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameId = useRef<number>();
  const setGesture = useGestureStore((state) => state.setGesture);
  const [isReady, setIsReady] = useState(false);

  // 步骤1：初始化服务和摄像头
  useEffect(() => {
    async function setup() {
      // Only initialize camera if children are NOT provided
      if (!children) {
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
      } else {
        // If children are present, we don't need the camera for this component
        setIsReady(true); // Still set isReady to true to potentially run prediction if needed by children
      }
    }
    setup();
    
    // 清理函数
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // Only stop tracks if the video stream was active
      if (!children) {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      }
    }
  }, [children]); // Add children to dependency array

  // 步骤2：启动预测循环
  useEffect(() => {
    const predict = () => {
      // Only run prediction if there are no children and video is ready
      if (!children && (!videoRef.current || videoRef.current.paused || videoRef.current.ended)) {
        animationFrameId.current = requestAnimationFrame(predict);
        return;
      }

      // If children are present, prediction might be handled elsewhere or not needed here.
      // If you still need gesture detection *when children are present*,
      // you might need to pass the videoRef or a different element for detection.
      // For now, assuming detection is only needed when video is displayed.
      if (!children && videoRef.current) { 
        const startTimeMs = performance.now();
        const results = gestureService.detect(videoRef.current, startTimeMs);

        if (results && results.landmarks) {
          // 将原始数据交给处理器
          const newGesture = gestureProcessor.process(results);
          
          // ⭐ 更新 Zustand Store！
          setGesture(newGesture);
        }
      }
      
      animationFrameId.current = requestAnimationFrame(predict);
    };

    if (isReady) {
      predict();
    }
    
  }, [isReady, setGesture, children]); // Add children to dependency array

  return (
    <>
      {children ? (
        // If children are provided, render them
        children
      ) : (
        // Otherwise, render the video
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
      )}
    </>
  );
};