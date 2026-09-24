import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConditionNodeData {
  label: string;
  content?: string;
  condition?: string;
}

function ConditionNode({ data, selected }: { data: ConditionNodeData; selected?: boolean }) {
  return (
    <div
      className={cn(
        'w-[250px] rounded-xl bg-white dark:bg-[#10182D] border transition-all duration-200 shadow-sm select-none',
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      )}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-400 dark:!bg-slate-500 !border-2 !border-white dark:!border-slate-900"
      />

      {/* Header Banner */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-200/50 dark:border-amber-900/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <GitBranch className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
            {data.label || 'Condition'}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Branch
        </span>
      </div>

      {/* Body Content */}
      <div className="p-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="font-mono text-[11px] bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
          {data.condition || data.content || 'If message matches...'}
        </div>
      </div>

      {/* Handles */}
      <div className="relative flex justify-between px-4 pb-2 text-[10px] font-bold text-slate-400">
        <span>True</span>
        <span>False</span>
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white dark:!border-slate-900 !left-[25%]"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white dark:!border-slate-900 !left-[75%]"
        />
      </div>
    </div>
  );
}

export default memo(ConditionNode);
