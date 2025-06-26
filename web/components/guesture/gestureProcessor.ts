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
  private lastGestureTimestamp: number = 0; // 用于限制手势更新频率

  // --- 可调参数 ---
  private pinchThreshold = 0.04; // 拇指和食指捏合的距离阈值
  private clickTimeout = 200; // ms, 捏合多长时间内释放算作点击
  private dragStartThreshold = 400; // ms, 捏合持续超过此时间算作拖拽开始
  private pointTolerance = 0.005; // point 手势的移动容忍度
  private dragTolerance = 0.01; // drag 手势的移动容忍度
  private minGestureInterval = 50; // ms, 最小手势更新间隔，避免过于频繁的更新

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
        // For click and dragstart, targetId is important, but if it's null, compare coordinates
        if (g1.payload.targetId && g2.payload.targetId) {
            return g1.payload.targetId === g2.payload.targetId;
        } else {
            return Math.abs(g1.payload.x - g2.payload.x) < this.pointTolerance && 
                   Math.abs(g1.payload.y - g2.payload.y) < this.pointTolerance;
        }
      case 'drag':
          return Math.abs(g1.payload.x - g2.payload.x) < this.dragTolerance && 
                 Math.abs(g1.payload.y - g2.payload.y) < this.dragTolerance;
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
    const currentTime = Date.now();

    // 限制手势更新频率
    if (currentTime - this.lastGestureTimestamp < this.minGestureInterval && this.lastEmittedGesture?.type !== 'drag') {
        // 对于拖拽手势，我们希望更实时，所以不在此处限制
        // 对于其他手势，如果更新过于频繁，则不处理
        return null;
    }

    let newGesture: Gesture | null = null;

    if (result.handedness.length === 0 || !result.landmarks || result.landmarks.length === 0) {
      // 没有检测到手，重置状态并返回 idle
      this.resetState();
      newGesture = { type: 'idle', payload: null, timestamp: currentTime };
    } else {
      // 我们只处理检测到的第一只手
      const landmarks = result.landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];

      // 确保食指和拇指尖端被检测到
      if (!thumbTip || !indexTip) {
        this.resetState();
        newGesture = { type: 'idle', payload: null, timestamp: currentTime };
        return newGesture;
      }

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
      // 1. 判断 Click 或 Drag End (release after pinch)
      if (wasPinching && !this.isPinching) { // 从捏合状态变为非捏合状态 (释放)
        const duration = currentTime - this.pinchStartTime;
        if (duration < this.clickTimeout) { // 短暂捏合后释放 -> Click
          newGesture = { type: 'click', payload: { x: currentX, y: currentY, targetId: null }, timestamp: currentTime };
        } else { // 长时间捏合后释放 -> Drag End
            newGesture = { type: 'dragend', payload: { x: currentX, y: currentY }, timestamp: currentTime };
        }
        this.resetPinchState(); // 释放捏合后重置捏合相关状态
      } 
      // 2. 判断 Drag Start (pinch for long duration) 或 Dragging
      else if (this.isPinching) { // 处于捏合状态
          if (!wasPinching) { // 刚刚开始捏合
              this.pinchStartTime = currentTime;
          }
          const duration = currentTime - this.pinchStartTime;

          if (duration >= this.dragStartThreshold) { // 捏合时间足够长，进入拖拽状态
              // 如果上一个手势不是 drag 或 dragstart，或者位置有显著变化，则发出 drag
              if (this.lastEmittedGesture?.type !== 'drag' || Math.abs(dx) > this.dragTolerance || Math.abs(dy) > this.dragTolerance) {
                  newGesture = { type: 'drag', payload: { x: currentX, y: currentY, dx, dy }, timestamp: currentTime };
              }
          } else { // 捏合时间不足以触发拖拽，仍视为 Point (可能转为 Click)
              if (this.lastEmittedGesture?.type !== 'point' || Math.abs(dx) > this.pointTolerance || Math.abs(dy) > this.pointTolerance) {
                  newGesture = { type: 'point', payload: { x: currentX, y: currentY }, timestamp: currentTime };
              }
          }
      }
      // 3. 判断 Pointing (default if no other gesture and not pinching)
      else { // 不捏合状态
        if (this.lastEmittedGesture?.type !== 'point' || Math.abs(dx) > this.pointTolerance || Math.abs(dy) > this.pointTolerance) {
            newGesture = { type: 'point', payload: { x: currentX, y: currentY }, timestamp: currentTime };
        }
      }
    }

    // 只有当新手势与上次发出的手势显著不同时才更新
    if (newGesture && !this.areGesturesDeepEqual(this.lastEmittedGesture, newGesture)) {
        this.lastEmittedGesture = newGesture;
        this.lastGestureTimestamp = currentTime; // 更新最后发出手势的时间戳
        return newGesture;
    } else {
        return null; // 没有显著变化，不更新
    }
  }
  
  private resetState() {
    this.isPinching = false;
    this.pinchStartTime = 0;
    this.lastIndexTip = null;
    this.lastEmittedGesture = null; // Full reset
    this.lastGestureTimestamp = 0;
  }

  private resetPinchState() {
      this.isPinching = false;
      this.pinchStartTime = 0;
      // lastIndexTip 不重置，因为拖拽结束后光标可能还在移动
  }
}

export const gestureProcessor = new GestureProcessor();