"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Phone,
  Presentation,
  HeartHandshake,
  Users,
  Coffee,
  CalendarCheck,
  Zap,
  ListChecks,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EVENT_TEMPLATES, EventTemplate } from '@/constants/event-templates';

interface EventTemplateSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateId: string) => void;
}

export function EventTemplateSelectionModal({
  isOpen,
  onOpenChange,
  onSelectTemplate,
}: EventTemplateSelectionModalProps) {

  const renderIcon = (iconName: any) => {
    const Icon = iconName;
    return <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] p-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[var(--crm-bg)] shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-['Satoshi']">
                  Choose an Event Template
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Start with a pre-configured template or build your own from scratch.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Templates Grid Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guided Setup Card */}
            <div
              onClick={() => onSelectTemplate('scratch')}
              className="group relative flex flex-col p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#1e2d6b]/40 dark:hover:border-indigo-500/40 bg-white dark:bg-[var(--crm-surface-1)] hover:shadow-lg hover:shadow-[#1e2d6b]/5 dark:hover:shadow-indigo-500/5 transition-all cursor-pointer text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-blue-600 dark:text-blue-400">
                  <ListChecks className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 group-hover:text-[#1e2d6b] dark:group-hover:text-indigo-400 transition-colors">
                Guided Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                Answer a few questions and we'll set up the event configuration for you.
              </p>
            </div>

            {/* One on One Card */}
            <div
              onClick={() => onSelectTemplate('one_on_one')}
              className="group relative flex flex-col p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#1e2d6b]/40 dark:hover:border-indigo-500/40 bg-white dark:bg-[var(--crm-surface-1)] hover:shadow-lg hover:shadow-[#1e2d6b]/5 dark:hover:shadow-indigo-500/5 transition-all cursor-pointer text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-indigo-500">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 group-hover:text-[#1e2d6b] dark:group-hover:text-indigo-400 transition-colors">
                One-on-One Event
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                Good for coffee chats, 1:1 interviews, etc. Start from scratch.
              </p>
            </div>

            {/* Group Card */}
            <div
              onClick={() => onSelectTemplate('group')}
              className="group relative flex flex-col p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#1e2d6b]/40 dark:hover:border-indigo-500/40 bg-white dark:bg-[var(--crm-surface-1)] hover:shadow-lg hover:shadow-[#1e2d6b]/5 dark:hover:shadow-indigo-500/5 transition-all cursor-pointer text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-emerald-500">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 group-hover:text-[#1e2d6b] dark:group-hover:text-indigo-400 transition-colors">
                Group Event
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                Good for webinars, online classes, etc. Start from scratch.
              </p>
            </div>

            {/* Predefined Templates */}
            {EVENT_TEMPLATES.map((template) => {
              return (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template.id)}
                  className="group relative flex flex-col p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[var(--crm-surface-1)] hover:border-[#1e2d6b]/40 dark:hover:border-indigo-500/40 hover:shadow-lg hover:shadow-[#1e2d6b]/5 dark:hover:shadow-indigo-500/5 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      {renderIcon(template.icon)}
                    </div>
                    {template.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wider">
                        {template.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1.5 group-hover:text-[#1e2d6b] dark:group-hover:text-indigo-400 transition-colors">
                    {template.name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                    {template.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
