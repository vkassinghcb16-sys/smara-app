import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

interface Options {
  onCommit: () => void;
  threshold?: number;
  disabled?: boolean;
}

export function useSwipeToBuy({ onCommit, threshold = 96, disabled = false }: Options) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const dxRef = useRef(0);
  const activeRef = useRef(false);
  const startXRef = useRef(0);

  const setDelta = (v: number) => {
    dxRef.current = v;
    setDx(v);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (disabled || leaving) return;
    activeRef.current = true;
    startXRef.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!activeRef.current) return;
    const delta = e.clientX - startXRef.current;
    setDelta(Math.max(0, Math.min(delta, 260)));
  };

  const finishDrag = () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setDragging(false);
    if (dxRef.current > threshold) {
      setLeaving(true);
      setDelta(320);
      window.setTimeout(onCommit, 180);
    } else {
      setDelta(0);
    }
  };

  return {
    dx,
    dragging,
    leaving,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
    },
  };
}
