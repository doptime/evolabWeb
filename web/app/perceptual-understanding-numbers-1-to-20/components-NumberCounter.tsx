// ...原有内容...

interface GameStore {
  // ...原有字段...
  counterZIndex: number;
  setCounterZIndex: (zIndex: number) => void;
  // ...其他新增字段...
}

// ...初始化状态...
  counterZIndex: 5,

// ...新增方法...
  setCounterZIndex: (zIndex) => set({ counterZIndex: zIndex }),

// ...物理惯性模拟逻辑...
  applyInertia: (velocity) => {
    set(state => ({
      currentValue: Math.round(state.currentValue + velocity * 0.1),
    }));
  },

// ...防抖处理...
  useDebouncedValue: (value) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebounced(value), 150);
      return () => clearTimeout(timer);
    }, [value]);
    return debounced;
  },

// ...原有内容...