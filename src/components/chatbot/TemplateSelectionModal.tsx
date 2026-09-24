"use client";

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Sparkles,
  Target,
  LifeBuoy,
  CalendarCheck,
  Moon,
  Package,
  ArrowRight,
  Workflow,
  Zap,
  CheckCircle2,
  LayoutTemplate,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CHATBOT_TEMPLATES, ChatbotTemplate } from '@/constants/chatbot-templates';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: ChatbotTemplate) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'lead_gen', label: 'Lead Generation' },
  { id: 'support', label: 'Support & FAQ' },
  { id: 'sales', label: 'Sales & Booking' },
  { id: 'automation', label: 'Automation' },
];

export function TemplateSelectionModal({
  isOpen,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTemplates = useMemo(() => {
    return CHATBOT_TEMPLATES.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.trigger.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || template.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target':
        return <Target className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
      case 'LifeBuoy':
        return <LifeBuoy className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
      case 'CalendarCheck':
        return <CalendarCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
      case 'Moon':
        return <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
      case 'Package':
        return <Package className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
      default:
        return <LayoutTemplate className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
    }
  };

  const getIconBg = (iconName: string) => {
    return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[85vh] p-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[var(--crm-bg)] shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Workflow className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-['Satoshi']">
                  Choose a Chatbot Template
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Start with a pre-configured automation flow or build your own from scratch.
              </DialogDescription>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-[#1e2d6b] dark:focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-4 pb-1">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                  )}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const isBlank = template.id === 'blank';
              const nodeCount = template.nodes.length;

              return (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={cn(
                    'group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md active:scale-[0.99]',
                    isBlank
                      ? 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-[#1e2d6b] dark:hover:border-indigo-400'
                      : 'border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#10182D] hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                          getIconBg(template.icon)
                        )}
                      >
                        {renderIcon(template.icon)}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-md border-0',
                            isBlank
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          )}
                        >
                          {template.badge}
                        </Badge>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-crm-btn-primary dark:group-hover:text-indigo-400 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono text-[10px]">
                        Trigger: &quot;{template.trigger}&quot;
                      </span>
                      <span>•</span>
                      <span>{nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}</span>
                    </div>

                    <span className="text-xs font-bold text-crm-btn-primary dark:text-indigo-400 inline-flex items-center gap-1 opacity-90 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                      Use Flow <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No chatbot templates found matching &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            You can customize any template anytime in the visual canvas.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
