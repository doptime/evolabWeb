// 定义每个手势的负载类型
interface PointPayload { x: number; y: number; }
interface ClickPayload { x: number; y: number; targetId: string | null; }
interface DragPayload { x: number; y: number; dx: number; dy: number; }
// ... 其他手势的 payload

// 使用可辨识联合类型 (Discriminated Union) 来精确定义手pegasus势
export type Gesture =
  | { type: 'point'; payload: PointPayload; timestamp: number }
  | { type: 'click'; payload: ClickPayload; timestamp: number }
  | { type: 'drag'; payload: DragPayload; timestamp: number }
  | { type: 'dragstart'; payload: ClickPayload; timestamp: number }
  | { type: 'dragend'; payload: PointPayload; timestamp: number }
  | { type: 'idle'; payload: null; timestamp: number }; // 空闲状态

// 定义 Zustand store 的完整状态和 action
export interface GestureStore {
  gesture: Gesture;
  setGesture: (gesture: Gesture) => void;
}