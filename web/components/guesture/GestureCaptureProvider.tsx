"use client";
// src/components/GestureCaptureProvider.tsx

import { useEffect, useRef, useState, ReactNode } from 'react'; // Import ReactNode
import { gestureService } from './gestureService';
import { gestureProcessor } from './gestureProcessor';
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
  const currentGesture = useGestureStore((state) => state.gesture); // 获取当前手势状态
  const [isReady, setIsReady] = useState(false);

  // Initialize service and camera regardless of children presence
  useEffect(() => {
    async function setupCameraAndService() {
      // Initialize gesture service (using placeholder)
      await gestureService.initialize();

      // Attempt to access the webcam
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => { // Use onloadedmetadata for better reliability
              if (videoRef.current) {
                videoRef.current.play().catch(e => console.error("Error playing video:", e));
                setIsReady(true);
                console.log("Camera stream loaded and ready, starting prediction loop.");
              }
            };
          }
        } catch (error) {
          console.error("Error accessing webcam:", error);
          setIsReady(true); // Treat as ready if no media devices are available
        }
      } else {
        console.warn("getUserMedia not supported in this browser.");
        setIsReady(true); // Treat as ready if no media devices are available
      }
    }
    setupCameraAndService();

    // Cleanup function: stop camera tracks and cancel animation frame
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      console.log("Cleanup: Camera tracks stopped and prediction loop canceled.");
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Start the prediction loop once the video is ready
  useEffect(() => {
    const predictGesture = () => {
      // Ensure video element exists, is not paused, and is not ended
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        animationFrameId.current = requestAnimationFrame(predictGesture);
        return;
      }

      const startTimeMs = performance.now();
      // Perform gesture detection using the video feed
      const processedGesture = gestureProcessor.process(gestureService.detect(videoRef.current, startTimeMs));

      if (processedGesture) {
        let finalGesture: Gesture = processedGesture; // Default to processed gesture

        // For click, dragstart, dragend, we need to determine the targetId
        if (processedGesture.type === 'click' || processedGesture.type === 'dragstart') {
          const { x, y } = processedGesture.payload; // Normalized coordinates
          // Convert normalized coordinates to screen coordinates
          const screenX = x * window.innerWidth;
          const screenY = y * window.innerHeight;
          const targetElement = document.elementFromPoint(screenX, screenY);
          const targetId = targetElement?.id || null; // Get the ID of the element under the cursor
          
          // Create a new gesture object with targetId
          finalGesture = { ...processedGesture, payload: { ...processedGesture.payload, targetId } };
        } else if (processedGesture.type === 'point' || processedGesture.type === 'drag' || processedGesture.type === 'dragend') {
          // For point, drag, dragend, we don't need targetId initially, but we can ensure payload has x, y
          // No change needed for payload structure for these types from gestureProcessor
        }

        // Only update Zustand store if finalGesture is significantly different from currentGesture
        // This prevents excessive re-renders due to minor coordinate changes in 'point' or 'drag'
        if (!areGesturesDeepEqual(currentGesture, finalGesture)) {
            setGesture(finalGesture);
        }
      }

      // Continue the prediction loop
      animationFrameId.current = requestAnimationFrame(predictGesture);
    };

    // Helper to compare gestures for equality (ignoring timestamp)
    const areGesturesDeepEqual = (g1: Gesture, g2: Gesture): boolean => {
      if (g1.type !== g2.type) return false;

      // Compare payloads based on type
      switch (g1.type) {
        case 'point':
        case 'dragend':
          // For point and dragend, compare coordinates with a tolerance
          const pointTolerance = 0.005; // Adjust as needed
          return Math.abs(g1.payload.x - g2.payload.x) < pointTolerance && 
                 Math.abs(g1.payload.y - g2.payload.y) < pointTolerance;
        case 'click':
        case 'dragstart':
          // For click and dragstart, targetId is important, but if it's null, compare coordinates
          if (g1.payload.targetId && g2.payload.targetId) {
              return g1.payload.targetId === g2.payload.targetId;
          } else {
              // Fallback to coordinate comparison if targetId is null for both (e.g., background click)
              const clickTolerance = 0.005;
              return Math.abs(g1.payload.x - g2.payload.x) < clickTolerance && 
                     Math.abs(g1.payload.y - g2.payload.y) < clickTolerance;
          }
        case 'drag':
            // For drag, compare dx, dy with a tolerance
            const dragTolerance = 0.01; // Adjust as needed
            return Math.abs(g1.payload.dx - g2.payload.dx) < dragTolerance && 
                   Math.abs(g1.payload.dy - g2.payload.dy) < dragTolerance;
        case 'idle':
          return true; 
        default:
          return true; 
      }
    };

    // Only start prediction if the camera is ready
    if (isReady) {
      console.log("Starting gesture prediction loop...");
      predictGesture();
    }

  }, [isReady, setGesture, currentGesture]); // Added currentGesture to dependencies

  return (
    <>
      {children && children} {/* Render children if provided */}

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