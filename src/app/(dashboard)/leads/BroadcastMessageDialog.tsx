'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { MessageTemplate, BroadcastResponse, columns } from './types'

interface BroadcastMessageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  templates: MessageTemplate[];
  isLoadingTemplates: boolean;
  selectedTemplate: MessageTemplate | null;
  setSelectedTemplate: (template: MessageTemplate | null) => void;
  variables: Record<string, string>;
  setVariables: (vars: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  variableColumnMapping: Record<string, string>;
  setVariableColumnMapping: (mapping: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  isSendingBroadcast: boolean;
  broadcastResponse: BroadcastResponse | null;
  setBroadcastResponse: (response: BroadcastResponse | null) => void;
  onBroadcast: () => void;
  extractVariables: (template: MessageTemplate) => string[];
}

export const BroadcastMessageDialog: React.FC<BroadcastMessageDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedCount,
  templates,
  isLoadingTemplates,
  selectedTemplate,
  setSelectedTemplate,
  variables,
  setVariables,
  variableColumnMapping,
  setVariableColumnMapping,
  isSendingBroadcast,
  broadcastResponse,
  setBroadcastResponse,
  onBroadcast,
  extractVariables
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Send Broadcast Message</DialogTitle>
          <DialogDescription>
            Select a template and customize variables to send to {selectedCount} leads.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[calc(85vh-180px)]">
          <div className="flex flex-col lg:flex-row gap-6 p-4">
            {/* Left side - Template selection and variables */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Select Template</Label>
                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No templates available
                  </div>
                ) : (
                  <Select
                    value={selectedTemplate?.id?.toString()}
                    onValueChange={(value) => {
                      const template = templates.find(t => t.id?.toString() === value);
                      setSelectedTemplate(template || null);
                      setVariables({});
                      setVariableColumnMapping({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem
                          key={template.id}
                          value={template.id?.toString() || 'default'}
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-normal">
                              {template.status}
                            </Badge>
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedTemplate && (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-3">Template Variables</h4>
                    {extractVariables(selectedTemplate).map(variable => (
                      <div key={variable} className="space-y-2 mb-4">
                        <Label>{variable}</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            placeholder="Enter value"
                            value={variables[variable] || ''}
                            onChange={(e) => setVariables(prev => ({
                              ...prev,
                              [variable]: e.target.value
                            }))}
                            className="flex-1"
                          />
                          <Select
                            value={variableColumnMapping[variable] || '_manual'}
                            onValueChange={(value) => {
                              setVariableColumnMapping(prev => ({
                                ...prev,
                                [variable]: value === '_manual' ? '' : value
                              }))
                              if (value !== '_manual') {
                                setVariables(prev => ({
                                  ...prev,
                                  [variable]: ''
                                }))
                              }
                            }}
                          >
                            <SelectTrigger className="w-full sm:w-[180px]">
                              <SelectValue placeholder="Use column value" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_manual">Manual Input</SelectItem>
                              {columns
                                .filter(col => col.id !== 'actions')
                                .map(col => (
                                  <SelectItem key={col.id} value={col.id}>
                                    {col.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Template preview */}
            <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
              <h4 className="font-medium mb-3">Preview</h4>
              {selectedTemplate ? (
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  {selectedTemplate.components.map((component, idx) => {
                    if (component.type === 'HEADER') {
                      return (
                        <div key={idx} className="space-y-2">
                          {component.format === 'TEXT' && (
                            <p className="font-semibold">
                              {component.text?.replace(/{{([^}]+)}}/g, (_, variable) =>
                                variables[variable] || `{{${variable}}}`
                              )}
                            </p>
                          )}
                          {component.format === 'IMAGE' && (
                            <div className="bg-background rounded-lg p-3">
                              <div className="aspect-video bg-muted-foreground/10 rounded-md flex items-center justify-center overflow-hidden">
                                {component.example?.header_handle?.[0] ? (
                                  <img
                                    src={component.example.header_handle[0]}
                                    alt="Header"
                                    className="max-h-full rounded-md object-contain"
                                  />
                                ) : (
                                  <p className="text-sm text-muted-foreground">Image Header</p>
                                )}
                              </div>
                            </div>
                          )}
                          {component.format === 'VIDEO' && (
                            <div className="bg-background rounded-lg p-3">
                              <div className="aspect-video bg-muted-foreground/10 rounded-md flex items-center justify-center overflow-hidden">
                                {component.example?.header_handle?.[0] ? (
                                  <video
                                    src={component.example.header_handle[0]}
                                    controls
                                    className="max-h-full rounded-md"
                                  />
                                ) : (
                                  <p className="text-sm text-muted-foreground">Video Header</p>
                                )}
                              </div>
                            </div>
                          )}
                          {component.format === 'DOCUMENT' && (
                            <div className="bg-background rounded-lg p-3">
                              <div className="bg-muted-foreground/10 rounded-md p-4 flex items-center justify-center overflow-hidden">
                                <p className="text-sm text-muted-foreground text-center">
                                  📄 Document Attachment
                                  {component.example?.header_handle?.[0] && (
                                    <span className="block text-[10px] mt-1 truncate">
                                      {component.example.header_handle[0].split('/').pop()}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (component.type === 'BODY') {
                      return (
                        <div key={idx} className="text-sm whitespace-pre-line">
                          {component.text?.replace(/{{([^}]+)}}/g, (_, variable) =>
                            variables[variable] || `{{${variable}}}`
                          )}
                        </div>
                      );
                    }

                    if (component.type === 'FOOTER') {
                      return (
                        <div key={idx} className="text-[10px] text-muted-foreground italic">
                          {component.text?.replace(/{{([^}]+)}}/g, (_, variable) =>
                            variables[variable] || `{{${variable}}}`
                          )}
                        </div>
                      );
                    }

                    if (component.type === 'BUTTONS' && component.buttons) {
                      return (
                        <div key={idx} className="space-y-2 pt-2 border-t">
                          {component.buttons.map((button, buttonIdx) => (
                            <div
                              key={buttonIdx}
                              className="bg-primary/10 hover:bg-primary/20 transition-colors rounded-md p-2 text-[11px] font-medium text-center cursor-pointer shadow-sm"
                            >
                              {button.type === 'URL' && (
                                <div className="flex items-center justify-center gap-1">
                                  <span>🔗</span>
                                  <span>{button.text}</span>
                                </div>
                              )}
                              {button.type === 'PHONE_NUMBER' && (
                                <div className="flex items-center justify-center gap-1">
                                  <span>📞</span>
                                  <span>{button.text}</span>
                                </div>
                              )}
                              {button.type === 'QUICK_REPLY' && (
                                <span>{button.text}</span>
                              )}
                              {button.type === 'COPY_CODE' && (
                                <div className="flex items-center justify-center gap-1">
                                  <span>📋</span>
                                  <span>{button.text}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-sm">Select a template to preview</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t p-4 mt-4">
          <div className="flex flex-col w-full gap-4">
            {broadcastResponse && (
              <div className={cn(
                "p-4 rounded-lg w-full animate-in slide-in-from-bottom-2",
                broadcastResponse.success
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              )}>
                <div className="flex items-center gap-2">
                  {broadcastResponse.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <p className="text-xs font-medium">
                    {broadcastResponse.message || broadcastResponse.error}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  setBroadcastResponse(null);
                }}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={onBroadcast}
                disabled={!selectedTemplate || selectedCount === 0 || isSendingBroadcast}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                {isSendingBroadcast ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-3.5 w-3.5" />
                    Send to {selectedCount} Leads
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
