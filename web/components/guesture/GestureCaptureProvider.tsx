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
      const newGesture = gestureProcessor.process(gestureService.detect(videoRef.current, startTimeMs));

      // Only update Zustand store if gestureProcessor returned a new, significant gesture
      if (newGesture) {
        setGesture(newGesture);
      }

      // Continue the prediction loop
      animationFrameId.current = requestAnimationFrame(predictGesture);
    };

    // Only start prediction if the camera is ready
    if (isReady) {
      console.log("Starting gesture prediction loop...");
      predictGesture();
    }

  }, [isReady, setGesture]); // Removed currentGesture from dependencies to prevent infinite loop

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