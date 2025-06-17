// src/logic/gestureProcessor.ts
// gestureProcessor.ts: 核心算法模块。负责接收 MediaPipe 输出的原始坐标点，并根据你定义的规则，将其“翻译”成如 { type: 'click', ... } 这样的结构化手势对象。这是最需要创造力和调试的部分。
import { HandLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { Gesture } from './types'; // 引入你定义的 Gesture 类型

// 计算两点之间的距离
const getDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

class GestureProcessor {
  // --- 状态存储 ---
  private lastGesture: Gesture['type'] = 'idle';
  private isPinching = false;
  private pinchStartTime = 0;
  
  // --- 可调参数 ---
  private pinchThreshold = 0.04; // 拇指和食指捏合的距离阈值
  private clickTimeout = 200; // ms, 捏合多长时间内释放算作点击

  // 主处理函数
  process(result: HandLandmarkerResult): Gesture {
    if (result.handedness.length === 0) {
      // 没有检测到手，重置状态并返回 idle
      this.resetState();
      return { type: 'idle', payload: null, timestamp: Date.now() };
    }

    // 我们只处理检测到的第一只手
    const landmarks = result.landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = getDistance(thumbTip, indexTip);
    
    const wasPinching = this.isPinching;
    this.isPinching = distance < this.pinchThreshold;

    // --- 逻辑判断 ---
    
    // 1. 判断 Click
    if (wasPinching && !this.isPinching) {
      // 从捏合状态变为非捏合状态 -> 释放
      const duration = Date.now() - this.pinchStartTime;
      if (duration < this.clickTimeout) {
        this.resetState();
        return { type: 'click', payload: { x: indexTip.x, y: indexTip.y, targetId: null }, timestamp: Date.now() };
      }
    }
    
    // 2. 判断 Drag Start
    if (!wasPinching && this.isPinching) {
      // 刚开始捏合
      this.pinchStartTime = Date.now();
      // 这里可以返回 'dragstart'，但为了简化，我们让它在下一帧变成 'drag'
    }

    // 3. 判断 Dragging
    if (this.isPinching) {
      const duration = Date.now() - this.pinchStartTime;
      if (duration >= this.clickTimeout) { // 长时间捏合认为是拖拽
         // 在实际应用中，你还需要计算 dx, dy
         return { type: 'drag', payload: { x: indexTip.x, y: indexTip.y, dx: 0, dy: 0 }, timestamp: Date.now() };
      }
    }

    // 4. 判断 Pointing (默认)
    // 如果没有触发其他手势，就默认是'point'
    return { type: 'point', payload: { x: indexTip.x, y: indexTip.y }, timestamp: Date.now() };
  }
  
  private resetState() {
    this.isPinching = false;
    this.pinchStartTime = 0;
  }
}

export const gestureProcessor = new GestureProcessor();