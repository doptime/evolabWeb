"use client";
// src/components/GestureCaptureProvider.tsx

import { useEffect, useRef, useState, ReactNode } from 'react'; // Import ReactNode
import { gestureService } from './gestureService';
import { gestureProcessor } from './gestureProcessor'; // Corrected import
import { useGestureStore } from './gestureStore';
import { Gesture } from './types';

// Define the props for the component, including children

interface GestureCaptureProviderProps {
  children?: ReactNode; // Optional children to render alongside the video
  videoWidth?: string; // CSS width property for the video (e.g., '240px', '50%')
  videoHeight?: string; // CSS height property for the video (e.g., '180px', 'auto')
  videoTop?: string; // CSS top position for the video (e.g., '0px', '10%')
  videoLeft?: string; // CSS left position for the video (e.g., '0px', '20px')
  videoOpacity?: number; // Opacity of the video (0.0 to 1.0)
}


export const GestureCaptureProvider = ({
  children,
  videoWidth = '240px', // Default width
  videoHeight = '180px', // Default height
  videoTop = '10px',    // Default top position
  videoLeft = '10px',   // Default left position
  videoOpacity = 0.8,   // Default opacity (80%)
}: GestureCaptureProviderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameId = useRef<number>();
  const setGesture = useGestureStore((state) => state.setGesture); 
  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCameraAndService() {
      try {
        await gestureService.initialize();
        console.log("Gesture service initialized.");

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => {
                  console.error("Error playing video:", e);
                  setCameraError("无法播放视频流，请检查摄像头权限。请确保摄像头未被其他应用占用。");
                });
                setIsReady(true);
                console.log("Camera stream loaded and ready.");
              }
            };
          } else {
             setCameraError("视频元素未准备好。");
          }
        }
      } catch (error: any) {
        console.error("Error during setup:", error);
        const errorMessage = error.name === 'NotAllowedError' 
          ? '摄像头权限被拒绝。请在浏览器设置中允许访问。' 
          : `设置失败: ${error.message || '未知错误'}`;
        setCameraError(errorMessage);
      }
    }
    setupCameraAndService();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      console.log("Cleanup: Camera tracks stopped and prediction loop canceled.");
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let lastProcessedGesture: Gesture | null = null;
    
    const predictGesture = () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 3) {
        animationFrameId.current = requestAnimationFrame(predictGesture);
        return;
      }

      const startTimeMs = performance.now();
      let detectionResult = null;
      try {
        detectionResult = gestureService.detect(videoRef.current, startTimeMs);
      } catch (e) {
        console.warn("Gesture detection skipped due to service not ready or error:", e);
        animationFrameId.current = requestAnimationFrame(predictGesture);
        return;
      }

      let finalGesture: Gesture | null = null;
      if (detectionResult && detectionResult.landmarks && detectionResult.landmarks.length > 0) {
        const processedGesture = gestureProcessor.process(detectionResult); 
        if (processedGesture) {
          // Add targetId for both click and dragstart events
          if ((processedGesture.type === 'click' || processedGesture.type === 'dragstart') && processedGesture.payload && 'x' in processedGesture.payload && 'y' in processedGesture.payload) {
            const { x, y } = processedGesture.payload;
            // MediaPipe 坐标是归一化的 (0-1)，需要转换为屏幕像素坐标
            // 镜像 X 坐标是因为视频流通常是镜像的，而用户期望光标在真实世界的位置
            const screenX = (1 - x) * window.innerWidth;
            const screenY = y * window.innerHeight;
            
            // 使用 document.elementFromPoint 获取最顶层的元素
            // 遍历父元素直到找到一个有 ID 的元素，或者直到根部
            let targetElement: Element | null = document.elementFromPoint(screenX, screenY);
            let targetId: string | null = null;

            while (targetElement && !targetElement.id && targetElement !== document.body) {
                targetElement = targetElement.parentElement;
            }
            if (targetElement) {
                targetId = targetElement.id;
            }

            // 调试信息：打印被点击的元素及其ID
            if (targetElement) {
                console.log(`Click/DragStart detected at (${screenX.toFixed(2)}, ${screenY.toFixed(2)}). Target element:`, targetElement, `ID: ${targetId}`);
                // 不再直接dispatchEvent模拟鼠标点击，而是将targetId传递给GestureStore
                // 让React组件根据GestureStore的变化来响应
            } else {
                console.log(`Click/DragStart detected, no identifiable element at (${screenX.toFixed(2)}, ${screenY.toFixed(2)}).`);
            }

            finalGesture = { ...processedGesture, payload: { ...processedGesture.payload, targetId } };
          } else {
            finalGesture = processedGesture;
          }
        }
      } else {
        // 如果没有检测到手部，则发出 idle 手势
        finalGesture = { type: 'idle', payload: null, timestamp: startTimeMs };
      }
      
      // 只有当新手势与上次发出的手势显著不同时才更新 Zustand store
      if (finalGesture && !areGesturesDeepEqual(lastProcessedGesture, finalGesture)) {
          setGesture(finalGesture);
          lastProcessedGesture = finalGesture;
      }

      animationFrameId.current = requestAnimationFrame(predictGesture);
    };
    
    const areGesturesDeepEqual = (g1: Gesture | null, g2: Gesture | null): boolean => {
      if (!g1 && !g2) return true; // 都为null或undefined视为相同
      if (!g1 || !g2) return false; // 一个为null，另一个不为null视为不同
      if (g1.type !== g2.type) return false; // 类型不同视为不同

      const tolerance = 0.008; // 定义一个较小的容忍度，用于浮点数比较

      switch (g1.type) {
        case 'point':
        case 'dragend':
            // 比较 x 和 y 坐标，允许微小浮点误差
            return g1.payload && g2.payload &&
                   Math.abs(g1.payload.x - (g2.payload as any).x) < tolerance && 
                   Math.abs(g1.payload.y - (g2.payload as any).y) < tolerance;
        case 'click':
        case 'dragstart':
            // 对于 click 和 dragstart，主要依赖 targetId。如果 targetId 相同，即使坐标略有变化也认为是相同的事件
            // 避免在同一元素上微小的手势抖动触发多次点击/拖拽开始
            return g1.payload.targetId === (g2.payload as any).targetId;
            // 如果需要更严格的坐标比较，可以加上：
            // && Math.abs((g1.payload as any).x - (g2.payload as any).x) < tolerance && 
            // Math.abs((g1.payload as any).y - (g2.payload as any).y) < tolerance;
        case 'drag':
            // 对于 drag，比较 x, y, dx, dy，允许微小浮点误差
            return g1.payload && g2.payload &&
                   Math.abs(g1.payload.x - (g2.payload as any).x) < tolerance && 
                   Math.abs(g1.payload.y - (g2.payload as any).y) < tolerance &&
                   Math.abs(g1.payload.dx - (g2.payload as any).dx) < tolerance &&
                   Math.abs(g1.payload.dy - (g2.payload as any).dy) < tolerance; // 增加 dx, dy 比较
        case 'idle':
          return true; // idle 状态总是相同的
        default:
          // 对于其他未知类型，进行严格的 JSON 比较，或根据需要自定义
          return JSON.stringify(g1.payload) === JSON.stringify(g2.payload);
      }
    };

    console.log("Starting gesture prediction loop...");
    animationFrameId.current = requestAnimationFrame(predictGesture);

    return () => {
      if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isReady, setGesture]);

  return (
    <>
      {children && children} {/* Render children if provided */}

      {cameraError && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-4 rounded-lg shadow-lg z-[10000]">
          <p className="font-bold">摄像头错误:</p>
          <p>{cameraError}</p>
          <p className="text-sm mt-2">请检查浏览器权限或设备连接。</p>
        </div>
      )}

      {/* The video element for displaying the camera feed and gesture detection */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Mute the video to avoid audio feedback
        style={{
          position: 'fixed', // Use 'fixed' to position relative to the viewport
          top: videoTop,
          left: videoLeft,
          width: videoWidth,
          height: videoHeight,
          transform: 'scaleX(-1)', // Mirror horizontally for a more intuitive view
          zIndex: 9999, // Ensure the video is on top of other content
          opacity: videoOpacity, // Control opacity via prop
          borderRadius: '8px', // Slightly rounded corners for aesthetics
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Subtle shadow
        }}
      />
    </>
  );
};