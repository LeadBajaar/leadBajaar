"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EvolutionFlowBuilder from "@/components/chatbot/evolution-flow-builder";
import { chatbotService } from "@/services/chatbot";
import { RoleGuard } from "@/components/RoleGuard";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminTemplateBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const id = params.id as string;
  const isNew = id === 'new';

  const handleSave = async (flowData: any) => {
    try {
      if (isNew) {
        // Provide defaults for UI fields since builder doesn't have them
        const payload = {
          ...flowData,
          category: 'all',
          badge: '',
          icon: 'LayoutTemplate',
        };
        await chatbotService.createEvolutionTemplate(payload);
        toast({ title: "Success", description: "Template created successfully" });
        router.push("/admin/chatbot-templates");
      } else {
        // Update existing template logic
        const payload = {
          name: flowData.name,
          description: flowData.description,
          trigger: flowData.trigger,
          nodes: flowData.nodes,
          edges: flowData.edges,
        };
        await chatbotService.updateEvolutionTemplate(id, payload);
        toast({ title: "Success", description: "Template updated successfully" });
        router.push("/admin/chatbot-templates");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" });
    }
  };

  return (
    <RoleGuard allowedRoles={['Admin', 'Super Admin'] as any[]}>
      <div className="h-full w-full relative">
        <EvolutionFlowBuilder
          flowId={isNew ? null : id}
          isNew={isNew}
          mode="template"
          onSave={handleSave}
        />
      </div>
    </RoleGuard>
  );
}
