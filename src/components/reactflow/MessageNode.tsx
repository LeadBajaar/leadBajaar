import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, ExternalLink, ListFilter } from 'lucide-react';
import { MessageNodeData } from '@/types/nodes';
import { cn } from '@/lib/utils';

function MessageNode({ data, selected }: { data: MessageNodeData; selected?: boolean }) {
  const renderContent = () => {
    switch (data.messageType) {
      case 'cta_url':
        return (
          <div className="space-y-2">
            {data.ctaUrl?.header && (
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{data.ctaUrl.header}</div>
            )}
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{data.ctaUrl?.body}</div>
            {data.ctaUrl?.footer && (
              <div className="text-[10px] text-slate-400 dark:text-slate-500 italic">{data.ctaUrl.footer}</div>
            )}
            {data.ctaUrl?.button && (
              <div className="relative mt-2">
                <div className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
                  <span>{data.ctaUrl.button.display_text}</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="button-cta"
                  className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white dark:!border-slate-900"
                  style={{ right: -6, top: '50%' }}
                />
              </div>
            )}
          </div>
        );

      case 'template':
        return (
          <div className="space-y-2">
            <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {data.content || 'Template Message'}
            </div>
            {data.buttons && data.buttons.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {data.buttons.map((button) => (
                  <div key={button.id} className="relative">
                    <div className="w-full text-center py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {button.text}
                    </div>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`button-${button.id}`}
                      className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white dark:!border-slate-900"
                      style={{ right: -6, top: '50%' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default: // text message
        return (
          <div className="space-y-2">
            <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
              {data.content || <span className="text-slate-400 italic">No message content set...</span>}
            </div>
            {data.buttons && data.buttons.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {data.buttons.map((button) => (
                  <div key={button.id} className="relative">
                    <div className="w-full text-center py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {button.text}
                    </div>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`button-${button.id}`}
                      className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white dark:!border-slate-900"
                      style={{ right: -6, top: '50%' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'w-[270px] rounded-xl bg-white dark:bg-[#10182D] border transition-all duration-200 shadow-sm select-none',
        selected
          ? 'border-[#1e2d6b] dark:border-indigo-400 ring-2 ring-[#1e2d6b]/20 dark:ring-indigo-400/20 shadow-md'
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
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/80 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200/50 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
            {data.label || 'Message'}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {data.messageType || 'Text'}
        </span>
      </div>

      {/* Message Bubble Body */}
      <div className="p-3.5 bg-white dark:bg-[#10182D] rounded-b-2xl">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[var(--crm-bg)] border border-slate-100 dark:border-slate-800/80 shadow-2xs">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="main"
        className="!w-3 !h-3 !bg-[#1e2d6b] dark:!bg-indigo-400 !border-2 !border-white dark:!border-slate-900 transition-transform hover:!scale-125"
      />
    </div>
  );
}

export default memo(MessageNode);
