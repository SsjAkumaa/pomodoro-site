import { useDrag } from 'react-dnd';
import { X, GripVertical } from 'lucide-react';

interface WidgetContainerProps {
  id: string;
  title: string;
  children: React.ReactNode;
  position: { x: number; y: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onRemove: (id: string) => void;
  width?: number;
  height?: number;
}

export function WidgetContainer({
  id,
  title,
  children,
  position,
  onPositionChange,
  onRemove,
  width = 400,
  height = 'auto',
}: WidgetContainerProps) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'WIDGET',
    item: { id, position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newPosition = {
          x: Math.max(0, position.x + delta.x),
          y: Math.max(0, position.y + delta.y),
        };
        onPositionChange(id, newPosition);
      }
    },
  }), [id, position, onPositionChange]);

  return (
    <div
      ref={preview}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width,
        height: height === 'auto' ? 'auto' : height,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 10,
      }}
      className="bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10"
    >
      {/* Header */}
      <div
        ref={drag}
        className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 cursor-move"
      >
        <div className="flex items-center gap-2 text-white">
          <GripVertical size={16} className="text-white/40" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="w-6 h-6 rounded-full bg-white/10 text-white/70 hover:bg-red-500/50 hover:text-white transition-all flex items-center justify-center"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}