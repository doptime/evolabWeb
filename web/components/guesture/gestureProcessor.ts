// src/logic/gestureProcessor.ts
// gestureProcessor.ts: 核心算法模块。负责接收 MediaPipe 输���的原始坐标点，并根据你定义的规则，将其“翻译”成如 { type: 'click', ... } 这样的结构化手势对象。
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
  private dragStartThreshold = 400; // ms, 捏合持续超过此时间算作拖拽开始
  private pointTolerance = 0.008; // point 手势的移动容忍度，增加容忍度以减少频繁更新
  private dragTolerance = 0.01; // drag 手势的移动容忍度，增加容忍度以减少频繁更新

  // Helper to compare gestures for equality (ignoring timestamp)
  // 用于内部判断是否需要更新 lastEmittedGesture
  private areGesturesDeepEqualInternal(g1: Gesture | null, g2: Gesture | null): boolean {
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
        // 对于点击和拖拽开始，如果 targetId 相同，则认为是相同点击/拖拽。
        // 如果 targetId 不同，或者两者都为 null 但坐标显著不同，则视为不同。
        if (g1.payload.targetId === g2.payload.targetId) {
            // 如果 targetId 相同，进一步比较坐标以处理无 targetId 的情况或微小差异
            // 这里的容忍度应该与 pointTolerance 保持一致，避免因微小坐标变化而重复触发
            return Math.abs((g1.payload as any).x - (g2.payload as any).x) < this.pointTolerance && 
                   Math.abs((g1.payload as any).y - (g2.payload as any).y) < this.pointTolerance;
        } else {
            return false; // targetId 不同，直接视为不同
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

    let newGesture: Gesture | null = null;

    // 如果没有检测到手部，或者 landmarks 数组为空，直接发出 idle
    if (!result.landmarks || result.landmarks.length === 0) {
      if (this.lastEmittedGesture?.type !== 'idle') {
        newGesture = { type: 'idle', payload: null, timestamp: currentTime };
      }
      this.resetPinchState(); // 即使没有手，也要重置捏合状态
    } else {
      // 我们只处理检测到的第一只手
      const landmarks = result.landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];

      // 确保食指和拇指尖端被检测到
      if (!thumbTip || !indexTip) {
        // 如果关键地标丢失，也视为无手部，发出 idle
        if (this.lastEmittedGesture?.type !== 'idle') {
          newGesture = { type: 'idle', payload: null, timestamp: currentTime };
        }
        this.resetPinchState();
      } else {
        const distance = getDistance(thumbTip, indexTip);
        
        const wasPinching = this.isPinching;
        this.isPinching = distance < this.pinchThreshold;

        let currentX = indexTip.x;
        let currentY = indexTip.y;
        let dx = 0;
        let dy = 0;

        if (this.lastIndexTip) {
            dx = currentX - this.lastIndexTip.x; // 计算当前帧与上一帧的X位移
            dy = currentY - this.lastIndexTip.y; // 计算当前帧与上一帧的Y位移
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

            // 只有当捏合持续时间超过 dragStartThreshold 时，才开始触发 'drag' 事件
            // 否则，在捏合过程中但未达到阈值时，仍然视为 'point'
            if (duration >= this.dragStartThreshold) { 
                newGesture = { type: 'drag', payload: { x: currentX, y: currentY, dx, dy }, timestamp: currentTime };
            } else { 
                newGesture = { type: 'point', payload: { x: currentX, y: currentY }, timestamp: currentTime };
            }
        }
        // 3. 判断 Pointing (default if no other gesture and not pinching)
        else { // 不捏合状态
            newGesture = { type: 'point', payload: { x: currentX, y: currentY }, timestamp: currentTime };
        }
      }
    }

    // 只有当新手势与上次发出的手势显著不同时才更新
    if (newGesture && !this.areGesturesDeepEqualInternal(this.lastEmittedGesture, newGesture)) {
        this.lastEmittedGesture = newGesture;
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
  }

  private resetPinchState() {
      this.isPinching = false;
      this.pinchStartTime = 0;
      // lastIndexTip 不重置，因为拖拽结束后光标可能还在移动
  }
}
// 导出一个单例，方便在应用中各处使用
export const gestureProcessor = new GestureProcessor();