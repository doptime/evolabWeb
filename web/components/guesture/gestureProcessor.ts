// src/logic/gestureProcessor.ts
// gestureProcessor.ts: 核心算法模块。负责接收 MediaPipe 输���的原始坐标点，并根据你定义的规则，将其“翻译”成如 { type: 'click', ... } 这样的结构化手势对象。这是最需要创造力和调试的部分。
import { HandLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { Gesture } from './types'; // 引入你定义的 Gesture 类型

// 计算两点之间的距离
const getDistance = (p1: NormalizedLandmark, p2: NormalizedLandmark) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

class GestureProcessor {
  // --- 状态存储 ---
  private lastEmittedGesture: Gesture | null = null; // Store the last emitted gesture from this processor
  private isPinching = false;
  private pinchStartTime = 0;
  private lastIndexTip: NormalizedLandmark | null = null; // 用于计算 drag 的 dx, dy
  
  // --- 可调参数 ---
  private pinchThreshold = 0.04; // 拇指和食指捏合的距离阈值
  private clickTimeout = 200; // ms, 捏合多长时间内释放算作点击
  private pointTolerance = 0.005; // point 手势的移动容忍度
  private dragTolerance = 0.01; // drag 手势的移动容忍度

  // Helper to compare gestures for equality (ignoring timestamp)
  private areGesturesDeepEqual(g1: Gesture | null, g2: Gesture | null): boolean {
    if (!g1 && !g2) return true;
    if (!g1 || !g2) return false;
    if (g1.type !== g2.type) return false;

    // Compare payloads based on type
    switch (g1.type) {
      case 'point':
        return Math.abs(g1.payload.x - g2.payload.x) < this.pointTolerance && 
               Math.abs(g1.payload.y - g2.payload.y) < this.pointTolerance;
      case 'click':
      case 'dragstart':
        return g1.payload.targetId === g2.payload.targetId;
      case 'drag':
          return Math.abs(g1.payload.x - g2.payload.x) < this.dragTolerance && 
                 Math.abs(g1.payload.y - g2.payload.y) < this.dragTolerance &&
                 g1.payload.dx === g2.payload.dx && 
                 g1.payload.dy === g2.payload.dy;
      case 'dragend':
          return Math.abs(g1.payload.x - g2.payload.x) < this.pointTolerance && 
                 Math.abs(g1.payload.y - g2.payload.y) < this.pointTolerance;
      case 'idle':
        return true; 
      default:
        return true; 
    }
  };

  // 主处理函数
  process(result: HandLandmarkerResult): Gesture | null { 
    let newGesture: Gesture | null = null;

    if (result.handedness.length === 0) {
      // 没有检测到手，重置状态并返回 idle
      this.resetState();
      newGesture = { type: 'idle', payload: null, timestamp: Date.now() };
    } else {
      // 我们只处理检测到的第一只手
      const landmarks = result.landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const distance = getDistance(thumbTip, indexTip);
      
      const wasPinching = this.isPinching;
      this.isPinching = distance < this.pinchThreshold;

      let currentX = indexTip.x;
      let currentY = indexTip.y;
      let dx = 0;
      let dy = 0;

      if (this.lastIndexTip) {
          dx = currentX - this.lastIndexTip.x;
          dy = currentY - this.lastIndexTip.y;
      }
      this.lastIndexTip = indexTip; // 更新上一帧食指尖位置

      // --- 逻辑判断 ---
      // 1. 判断 Click (release after short pinch)
      if (wasPinching && !this.isPinching) {
        const duration = Date.now() - this.pinchStartTime;
        if (duration < this.clickTimeout) {
          newGesture = { type: 'click', payload: { x: currentX, y: currentY, targetId: null }, timestamp: Date.now() };
        } else { 
            newGesture = { type: 'dragend', payload: { x: currentX, y: currentY }, timestamp: Date.now() };
        }
        this.resetStateExceptLastEmitted(); // 释放捏合后重置状态
      } 
      // 2. 判断 Drag Start (pinch for long duration) 或 Dragging
      else if (this.isPinching) {
          if (!wasPinching) { // Just started pinching
              this.pinchStartTime = Date.now();
          }
          const duration = Date.now() - this.pinchStartTime;
          if (duration >= this.clickTimeout) { // Long pinch, consider it a drag
              if (this.lastEmittedGesture?.type !== 'drag' || Math.abs(dx) > this.dragTolerance || Math.abs(dy) > this.dragTolerance) {
                  newGesture = { type: 'drag', payload: { x: currentX, y: currentY, dx, dy }, timestamp: Date.now() };
              }
          } else { // Short pinch, still in potential click phase, act as point
              if (this.lastEmittedGesture?.type !== 'point' || Math.abs(dx) > this.pointTolerance || Math.abs(dy) > this.pointTolerance) {
                  newGesture = { type: 'point', payload: { x: currentX, y: currentY }, timestamp: Date.now() };
              }
          }
      }
      // 3. 判断 Pointing (default if no other gesture and not pinching)
      else {
        if (this.lastEmittedGesture?.type !== 'point' || Math.abs(dx) > this.pointTolerance || Math.abs(dy) > this.pointTolerance) {
            newGesture = { type: 'point', payload: { x: currentX, y: currentY }, timestamp: Date.now() };
        }
      }
    }

    // Only emit a new gesture if it's significantly different from the last one
    if (newGesture && !this.areGesturesDeepEqual(this.lastEmittedGesture, newGesture)) {
        this.lastEmittedGesture = newGesture;
        return newGesture;
    } else {
        return null; // No significant change, don't update
    }
  }
  
  private resetState() {
    this.isPinching = false;
    this.pinchStartTime = 0;
    this.lastIndexTip = null;
    this.lastEmittedGesture = null; // Full reset
  }

  private resetStateExceptLastEmitted() {
      this.isPinching = false;
      this.pinchStartTime = 0;
      this.lastIndexTip = null;
  }
}

export const gestureProcessor = new GestureProcessor();