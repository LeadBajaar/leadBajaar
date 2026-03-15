import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

interface FlowNodeData {
  label: string;
  content: string;
  trigger?: string;
}

function FlowNode({ data }: { data: FlowNodeData }) {
  return (
    <Card className="w-[250px] border-2 border-blue-500">
      <CardHeader className="p-2 bg-blue-50 dark:bg-blue-900">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          <CardTitle className="text-sm flex-1">{data.label}</CardTitle>
        </div>
        {data.trigger && (
          <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Trigger: {data.trigger}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-2 text-xs">
        {data.content}
      </CardContent>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}

export default memo(FlowNode); 
