import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowNodeData {
  label: string;
  content: string;
  trigger?: string;
}

function FlowNode({ data, selected }: { data: FlowNodeData; selected?: boolean }) {
  return (
    <div
      className={cn(
        'w-[270px] rounded-xl bg-white dark:bg-[#10182D] border transition-all duration-200 shadow-sm select-none',
        selected
          ? 'border-[#1e2d6b] dark:border-indigo-400 ring-2 ring-[#1e2d6b]/20 dark:ring-indigo-400/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      )}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-crm-btn-primary dark:bg-slate-800 rounded-t-xl text-white">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="text-xs font-bold tracking-tight truncate max-w-[150px]">
            {data.label || 'Trigger'}
          </span>
        </div>
        <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Start
        </span>
      </div>

      {/* Body Content */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Trigger Keyword</span>
          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#1e2d6b]/10 dark:bg-indigo-500/15 text-[#1e2d6b] dark:text-indigo-400 border border-[#1e2d6b]/15 dark:border-indigo-500/20">
            {data.trigger || 'message'}
          </span>
        </div>

        {data.content && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {data.content}
          </p>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#1e2d6b] dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900 transition-transform hover:!scale-125"
      />
    </div>
  );
}

export default memo(FlowNode);
