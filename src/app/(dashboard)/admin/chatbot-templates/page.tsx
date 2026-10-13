"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { chatbotService } from "@/services/chatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2, Sliders, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RoleGuard } from "@/components/RoleGuard";

export default function AdminChatbotTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "all",
    badge: "",
    icon: "LayoutTemplate",
    trigger: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await chatbotService.getEvolutionTemplates();
      setTemplates(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load templates", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (template: any = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name || "",
        description: template.description || "",
        category: template.category || "all",
        badge: template.badge || "",
        icon: template.icon || "LayoutTemplate",
        trigger: template.trigger || "",
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        description: "",
        category: "all",
        badge: "",
        icon: "LayoutTemplate",
        trigger: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        badge: formData.badge,
        icon: formData.icon,
        trigger: formData.trigger,
      };

      if (editingTemplate) {
        await chatbotService.updateEvolutionTemplate(editingTemplate.id, payload);
        toast({ title: "Success", description: "Template metadata updated successfully" });
      } else {
        await chatbotService.createEvolutionTemplate(payload);
        toast({ title: "Success", description: "Template created successfully" });
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save template. Check JSON format.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await chatbotService.deleteEvolutionTemplate(id);
        toast({ title: "Success", description: "Template deleted" });
        fetchTemplates();
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete template", variant: "destructive" });
      }
    }
  };

  return (
    <RoleGuard allowedRoles={['Admin', 'Super Admin'] as any[]}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Chatbot Templates</h1>
          <p className="text-sm text-slate-500">Add, edit, or remove Evolution Chatbot flow templates.</p>
        </div>
        <Button onClick={() => router.push("/admin/chatbot-templates/builder/new")} className="bg-crm-btn-primary hover:bg-crm-btn-primary-hover text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Template Flow
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No templates found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((tpl) => (
                <TableRow key={tpl.id}>
                  <TableCell>
                    <div className="font-semibold text-sm">{tpl.name}</div>
                    <div className="text-xs text-slate-500 line-clamp-1 max-w-[300px]">{tpl.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px]">{tpl.trigger}</Badge>
                  </TableCell>
                  <TableCell className="capitalize text-xs">{tpl.category}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">{tpl.badge}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/chatbot-templates/builder/${tpl.id}`)} className="h-8">
                      <Sliders className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                      Edit Flow
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(tpl)} title="Edit Settings">
                      <Settings className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(tpl.id)} title="Delete">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-1">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Template Name"
              />
            </div>
            
            <div className="col-span-2 space-y-1">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <Label>Category</Label>
              <select 
                className="w-full flex h-9 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:focus-visible:ring-slate-300"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="all">All</option>
                <option value="lead_gen">Lead Generation</option>
                <option value="support">Support</option>
                <option value="sales">Sales</option>
                <option value="automation">Automation</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label>Trigger Keyword</Label>
              <Input
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                placeholder="hello"
              />
            </div>

            <div className="space-y-1">
              <Label>Badge Text</Label>
              <Input
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Popular"
              />
            </div>

            <div className="space-y-1">
              <Label>Icon Name</Label>
              <select 
                className="w-full flex h-9 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:border-slate-800 dark:focus-visible:ring-slate-300"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                <option value="Sparkles">Sparkles</option>
                <option value="Target">Target</option>
                <option value="LifeBuoy">LifeBuoy</option>
                <option value="CalendarCheck">CalendarCheck</option>
                <option value="Moon">Moon</option>
                <option value="Package">Package</option>
                <option value="LayoutTemplate">LayoutTemplate</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-crm-btn-primary hover:bg-crm-btn-primary-hover text-white">
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}
