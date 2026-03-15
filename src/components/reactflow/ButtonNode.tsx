import { Handle, Position } from '@xyflow/react';
import { Button } from '@/components/ui/button';

interface ButtonNodeProps {
  data: {
    label: string;
    content: string;
  };
}

export default function ButtonNode({ data }: ButtonNodeProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <Handle type="target" position={Position.Top} />
      <Button variant="secondary" size="sm" className="w-full">
        {data.content || 'Button Text'}
      </Button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
} 
