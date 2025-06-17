// src/services/gestureService.ts
// gestureService.ts: 一个独立的、与 React 无关的模块，专门负责初始化和运行 MediaPipe Hand Landmarker。

import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

class GestureService {
  private handLandmarker?: HandLandmarker;

  // 初始化模型，这是一个异步操作
  async initialize() {
    if (this.handLandmarker) return this;

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        // 修复：更新为正确的模型文件路径
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO", // 关键：使用视频模式
      numHands: 2
    });
    
    console.log("HandLandmarker model loaded.");
    return this;
  }

  // 核心：处理单帧视频并返回结果
  detect(videoElement: HTMLVideoElement, timestamp: number) {
    if (!this.handLandmarker) {
      throw new Error("HandLandmarker not initialized!");
    }
    // 返回检测结果，包含坐标点
    return this.handLandmarker.detectForVideo(videoElement, timestamp);
  }
}

// 导出一个单例，方便在应用中各处使用
export const gestureService = new GestureService();
