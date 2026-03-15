'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash2, MessageSquare, RefreshCcw, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { integrationApi } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TokenUpdateModal } from "@/components/ui/reconnection-modal"
import { RoleGuard } from '@/components/RoleGuard'

interface WhatsAppAccount {
  id: number;
  business_name: string;
  phone_number: string;
  status: string;
  templates_count: number;
  last_synced: string;
}

interface MessageTemplate {
  id: number;
  template_id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: TemplateComponent[];
  attachments?: {
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    url?: string;
    filename?: string;
  }[];
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text?: string;
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  example?: {
    header_handle?: string[];
    header_text?: string[];
    body_text?: string[];
  };
  file?: File; // For file upload handling
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
    text: string;
    url?: string;
    phone_number?: string;
    code?: string;
  }>;
}

interface NewTemplate {
  name: string;
  category: string;
  language: string;
  components: TemplateComponent[];
}

export default function WhatsAppManagementPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedAccount, setSelectedAccount] = useState<WhatsAppAccount | null>(null)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newTemplate, setNewTemplate] = useState<NewTemplate>({
    name: '',
    category: 'MARKETING',
    language: 'en',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '' },
      { type: 'BODY', text: '' },
      { type: 'FOOTER', text: '' }
    ]
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null)
  const [showTokenUpdateModal, setShowTokenUpdateModal] = useState(false)
  const [tokenUpdateData, setTokenUpdateData] = useState<{
    businessName?: string;
    phoneNumber?: string;
    errorMessage?: string;
    integrationId?: number;
  }>({})
  const [isUpdatingToken, setIsUpdatingToken] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<WhatsAppAccount | null>(null)
  const [showEditTemplate, setShowEditTemplate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [editTemplateData, setEditTemplateData] = useState<NewTemplate>({
    name: '',
    category: 'MARKETING',
    language: 'en',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '' },
      { type: 'BODY', text: '' },
      { type: 'FOOTER', text: '' }
    ]
  })
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [rejectionData, setRejectionData] = useState<{
    templateId?: string;
    rejectionReason?: string;
    suggestedAction?: string;
  }>({})

  // Reset template form to initial state
  const resetTemplateForm = () => {
    // Cleanup preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls([])
    
    setNewTemplate({
      name: '',
      category: 'MARKETING',
      language: 'en',
      components: [
        { type: 'HEADER', format: 'TEXT', text: '' },
        { type: 'BODY', text: '' },
        { type: 'FOOTER', text: '' }
      ]
    })
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  // Manage object URLs for file previews
  useEffect(() => {
    // Cleanup previous URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    
    // Create new URLs if file exists
    if (newTemplate.components[0]?.file) {
      const url = URL.createObjectURL(newTemplate.components[0].file)
      setPreviewUrls([url])
    } else {
      setPreviewUrls([])
    }
    
    // Cleanup on unmount
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [newTemplate.components[0]?.file])

  // Auto-show preview when editing template
  useEffect(() => {
    if (showEditTemplate) {
      setShowPreview(true)
    }
  }, [showEditTemplate])

  // Helper function to replace variables with sample text
  const replaceVariablesWithSample = (templateText: string, sampleText: string) => {
    if (!templateText || !sampleText) return templateText;
    
    // Split sample text by common separators to get individual values
    const sampleValues = sampleText.split(/[,;|]/).map(val => val.trim()).filter(val => val);
    
    // Replace variables {{1}}, {{2}}, etc. with corresponding sample values
    return templateText.replace(/\{\{(\d+)\}\}/g, (match, number) => {
      const index = parseInt(number) - 1; // Convert to 0-based index
      return sampleValues[index] || `{{${number}}}`; // Fallback to original if no sample value
    });
  }

  const fetchAccounts = async () => {
    try {
      const response = await integrationApi.getWhatsAppAccounts()
      setAccounts(response.accounts)
      if (response.accounts && response.accounts.length > 0) {
        setTemplates(response.accounts[0].templates || [])
        setSelectedAccount(response.accounts[0])
        
        // Check if any account needs token update
        for (const account of response.accounts) {
          try {
            const statusResponse = await integrationApi.checkIntegrationStatus(account.id)
            if (statusResponse.needs_token_update) {
              setTokenUpdateData({
                businessName: account.business_name,
                phoneNumber: account.phone_number,
                errorMessage: statusResponse.last_error || 'Your WhatsApp access token has expired.',
                integrationId: account.id
              });
              setShowTokenUpdateModal(true);
              break;
            }
          } catch (error) {
            // Silently handle integration status check errors
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch WhatsApp accounts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemplates = async (accountId: number) => {
    try {
      const response = await integrationApi.getWhatsAppTemplates(accountId)
      setTemplates(response.templates)  
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch templates",
        variant: "destructive",
      })
    }
  }

  const syncTemplates = async (accountId: number) => {
    try {
      await integrationApi.syncWhatsAppTemplates(accountId)
      toast({
        title: "Success",
        description: "Templates synced successfully",
      })
      fetchTemplates(accountId)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sync templates",
        variant: "destructive",
      })
    }
  }

  const handleCreateTemplate = async () => {
    if (!selectedAccount) {
      toast({
        title: "Error",
        description: "Please select an account first",
        variant: "destructive",
      });
      return;
    }

    // Capture selectedAccount data to avoid state changes during async operations
    const currentAccount = { ...selectedAccount };

    // Validate required fields
    if (!newTemplate.name.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    if (!newTemplate.components[1]?.text?.trim()) {
      toast({
        title: "Error",
        description: "Message body is required",
        variant: "destructive",
      });
      return;
    }

    // Validate language code (must be 2 characters)
    if (newTemplate.language.length !== 2) {
      toast({
        title: "Error",
        description: "Language code must be exactly 2 characters (e.g., 'en', 'es')",
        variant: "destructive",
      });
      return;
    }

    // Check for media files (not supported yet)
    const hasMediaHeader = newTemplate.components[0]?.format && 
                          newTemplate.components[0].format !== 'TEXT' && 
                          newTemplate.components[0].file;
    if (hasMediaHeader) {
      toast({
        title: "Not Supported",
        description: "Media file uploads are not yet implemented. Please use text headers only.",
        variant: "destructive",
      });
      return;
    }

    // Prepare the template data for API
    const templateData = {
      name: newTemplate.name.trim(),
      category: newTemplate.category,
      language: newTemplate.language,
      components: newTemplate.components
        .filter(component => {
          // Filter out empty components
          if (component.type === 'HEADER' && !component.format) return false;
          if (component.type === 'BODY' && !component.text?.trim()) return false;
          if (component.type === 'FOOTER' && !component.text?.trim()) return false;
          if (component.type === 'BUTTONS' && (!component.buttons || component.buttons.length === 0)) return false;
          return true;
        })
        .map(component => {
          // Clean up component data
          if (component.type === 'HEADER') {
            const headerComponent: any = {
              type: component.type,
              format: component.format
            };
            
            if (component.format === 'TEXT') {
              headerComponent.text = component.text ?? '';
            } else if (component.format === 'IMAGE' || component.format === 'VIDEO' || component.format === 'DOCUMENT') {
              headerComponent.example = component.example;
            }
            
            return headerComponent;
          }
          if (component.type === 'BODY' || component.type === 'FOOTER') {
            const bodyComponent: any = {
              type: component.type,
              text: component.text ?? ''
            };
            
            // Add example/sample text if available
            if (component.example) {
              if (component.type === 'BODY' && component.example.body_text?.[0]) {
                bodyComponent.example = {
                  body_text: [component.example.body_text[0]]
                };
              } else if (component.type === 'FOOTER' && component.example.body_text?.[0]) {
                bodyComponent.example = {
                  body_text: [component.example.body_text[0]]
                };
              }
            }
            
            return bodyComponent;
          }
          if (component.type === 'BUTTONS') {
            return {
              type: component.type,
              buttons: component.buttons?.map(button => {
                const buttonData: any = {
                  type: button.type,
                  text: button.text
                };
                
                if (button.type === 'URL' && button.url) {
                  buttonData.url = button.url;
                }
                if (button.type === 'PHONE_NUMBER' && button.phone_number) {
                  buttonData.phone_number = button.phone_number;
                }
                if (button.type === 'COPY_CODE' && button.code) {
                  buttonData.code = button.code;
                }
                
                return buttonData;
              }) || []
            };
          }
          return component;
        })
    };

    try {
      try {
        await integrationApi.createWhatsAppTemplate(currentAccount.id, templateData);
        toast({
          title: "Success",
          description: "Template created successfully",
        });
        setShowNewTemplate(false);
        resetTemplateForm();
        fetchTemplates(currentAccount.id);
      } catch (apiError: any) {
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (error: any) {
      // Enhanced error display
      let errorMessage = error.message || "Failed to create template";
      
      // Handle specific error types
      if (errorMessage.includes('Validation failed:')) {
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (error.response?.data?.error_type === 'token_expired') {
        // Show token update modal instead of toast
        if (currentAccount) {
          setTokenUpdateData({
            businessName: currentAccount.business_name,
            phoneNumber: currentAccount.phone_number,
            errorMessage: error.response.data.message,
            integrationId: currentAccount.id
          });
          setShowTokenUpdateModal(true);
          
          // Show a user-friendly toast to explain what happened
          toast({
            title: "Token Update Required",
            description: "Your WhatsApp access token has expired. Please update it to continue creating templates.",
            variant: "default",
          });
        } else {
          // Fallback if no selected account
          toast({
            title: "Token Expired",
            description: "Your WhatsApp access token has expired. Please update your access token.",
            variant: "destructive",
          });
        }
      } else if (error.response?.data?.error_type === 'duplicate_template') {
        // Handle duplicate template error
        toast({
          title: "Template Already Exists",
          description: `This template name "${newTemplate.name}" already exists in ${newTemplate.language === 'en' ? 'English' : 
                       newTemplate.language === 'es' ? 'Spanish' : 
                       newTemplate.language === 'pt' ? 'Portuguese' :
                       newTemplate.language === 'hi' ? 'Hindi' :
                       newTemplate.language === 'ar' ? 'Arabic' : 
                       newTemplate.language}. You can either:\n\n1. Choose a different name (e.g., "${newTemplate.name}_2")\n2. Use a different language (available: Spanish, Portuguese, Hindi, Arabic)`,
          variant: "destructive",
        });
      } else if (error.response?.data?.error_type === 'template_rejected') {
        // Handle template rejection
        setRejectionData({
          templateId: error.response.data.template_id,
          rejectionReason: error.response.data.rejection_reason,
          suggestedAction: error.response.data.suggested_action
        });
        setShowRejectionModal(true);
        
        toast({
          title: "Template Rejected",
          description: "Your template was rejected by WhatsApp. Click 'Edit Template' to add sample text and resubmit.",
          variant: "destructive",
        });
      } else if (error.response?.data?.error_type === 'validation_error') {
        // Handle other validation errors
        toast({
          title: error.response.data.error_details || "Validation Error",
          description: error.response.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!currentAccount) return

    try {
      await integrationApi.deleteWhatsAppTemplate(currentAccount.id, templateId)
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
      await loadTemplates(currentAccount.id)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete template"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template)
    setEditTemplateData({
      name: template.name,
      category: template.category,
      language: template.language,
      components: template.components || []
    })
    setShowPreview(true) // Show preview by default in edit mode
    setShowEditTemplate(true)
    
    // Ensure currentAccount is set for resubmission
    if (!currentAccount && selectedAccount) {
      setCurrentAccount(selectedAccount)
    }
  }

  const handleUpdateTemplate = async () => {
    console.log('Update button clicked', { currentAccount, selectedAccount, editingTemplate, editTemplateData });
    
    // Use currentAccount or fallback to selectedAccount
    const accountToUse = currentAccount || selectedAccount;
    
    if (!accountToUse || !editingTemplate) {
      console.error('Missing required data:', { currentAccount, selectedAccount, editingTemplate });
      toast({
        title: "Error",
        description: "Missing account or template data",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingTemplate(true)
      
      // Prepare components with sample text for resubmission
      const componentsWithSample = editTemplateData.components.map(component => {
        if (component.type === 'BODY' || component.type === 'FOOTER') {
          const bodyComponent: any = {
            type: component.type,
            text: component.text ?? ''
          };
          
          // Add example/sample text if available
          if (component.example) {
            if (component.type === 'BODY' && component.example.body_text?.[0]) {
              bodyComponent.example = {
                body_text: [component.example.body_text[0]]
              };
            } else if (component.type === 'FOOTER' && component.example.body_text?.[0]) {
              bodyComponent.example = {
                body_text: [component.example.body_text[0]]
              };
            }
          }
          
          return bodyComponent;
        }
        
        if (component.type === 'HEADER') {
          const headerComponent: any = {
            type: component.type,
            format: component.format
          };
          
          if (component.format === 'TEXT') {
            headerComponent.text = component.text ?? '';
          } else if (component.format === 'IMAGE' || component.format === 'VIDEO' || component.format === 'DOCUMENT') {
            headerComponent.example = component.example;
          }
          
          return headerComponent;
        }
        
        if (component.type === 'BUTTONS') {
          return {
            type: component.type,
            buttons: component.buttons?.map(button => {
              const buttonData: any = {
                type: button.type,
                text: button.text
              };
              
              if (button.type === 'URL' && button.url) {
                buttonData.url = button.url;
              } else if (button.type === 'PHONE_NUMBER' && button.phone_number) {
                buttonData.phone_number = button.phone_number;
              } else if (button.type === 'COPY_CODE' && button.code) {
                buttonData.code = button.code;
              }
              
              return buttonData;
            })
          };
        }
        
        return component;
      });
      
          await integrationApi.updateWhatsAppTemplate(accountToUse.id, editingTemplate.template_id, {
            components: componentsWithSample
          })
      
      toast({
        title: "Success",
        description: "Template updated successfully",
      })
      
      setShowEditTemplate(false)
      setShowRejectionModal(false)
      setEditingTemplate(null)
      await loadTemplates(accountToUse.id)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to resubmit template"
      
      if (error.response?.data?.error_type === 'template_rejected') {
        setRejectionData({
          templateId: error.response.data.template_id,
          rejectionReason: error.response.data.rejection_reason,
          suggestedAction: error.response.data.suggested_action
        });
        setShowRejectionModal(true);
        
        toast({
          title: "Template Rejected Again",
          description: "Your template was rejected again. Please review the guidelines and add proper sample text.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsCreatingTemplate(false)
    }
  }

  const loadTemplates = async (accountId: number) => {
    try {
      const response = await integrationApi.getWhatsAppTemplates(accountId)
      setTemplates(response.templates)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to load templates"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const indexOfLastTemplate = currentPage * itemsPerPage
  const indexOfFirstTemplate = indexOfLastTemplate - itemsPerPage
  const currentTemplates = templates.slice(indexOfFirstTemplate, indexOfLastTemplate)
  const totalPages = Math.ceil(templates.length / itemsPerPage)
  return (
    <RoleGuard allowedRoles={['Super Admin', 'Admin']}>
      <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">WhatsApp Management</h1>
        <Button onClick={() => {
          resetTemplateForm();
          setShowNewTemplate(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Connected WhatsApp Business Accounts</CardTitle>
              <CardDescription>
                Manage your connected WhatsApp Business accounts and their templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Templates</TableHead>
                    <TableHead>Last Synced</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.business_name}</TableCell>
                      <TableCell>{account.phone_number}</TableCell>
                      <TableCell>
                        <Badge variant={account.status === 'Active' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{account.templates_count}</TableCell>
                      <TableCell>{account.last_synced}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => syncTemplates(account.id)}
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAccount(account)
                              fetchTemplates(account.id)
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Manage your WhatsApp message templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAccount ? (
                <div className="space-y-4">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead className="min-w-[100px]">Category</TableHead>
                          <TableHead className="min-w-[100px]">Language</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[100px]">Attachments</TableHead>
                          <TableHead className="w-[150px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>{template.category}</TableCell>
                            <TableCell>{template.language}</TableCell>
                            <TableCell>
                              <Badge variant={template.status === 'APPROVED' ? 'default' : 'secondary'}>
                                {template.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {template.components.map((component, idx) => (
                                component.format && component.format !== 'TEXT' && (
                                  <Badge key={idx} variant="outline" className="mr-1">
                                    {component.format.toLowerCase()}
                                  </Badge>
                                )
                              ))}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setPreviewTemplate(template)
                                  setShowPreview(true)
                                }}>
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditTemplate(template)}
                                  disabled={template.status === 'APPROVED'}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteTemplate(template.template_id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {indexOfFirstTemplate + 1} to {Math.min(indexOfLastTemplate, templates.length)} of {templates.length} templates
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Select an account to view templates
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

             {/* Enhanced Template Creation Modal with Preview */}
      <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
         <DialogContent className="max-w-[1200px] max-h-[95vh] w-[95vw]">
          <DialogHeader>
             <DialogTitle>Create New WhatsApp Template</DialogTitle>
             <DialogDescription>
               Design your WhatsApp message template with real-time preview
             </DialogDescription>
          </DialogHeader>
           
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                         {/* Form Section */}
             <div className="h-[65vh] overflow-hidden flex flex-col">
               <ScrollArea className="flex-1 pr-2">
                 <div className="space-y-3 pb-4">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Basic Information</h3>
                    
              <div className="grid gap-2">
                      <Label htmlFor="template-name">Template Name *</Label>
                <Input
                        id="template-name"
                  placeholder="welcome_message"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev,
                    name: e.target.value.toLowerCase().replace(/\s+/g, '_')
                  }))}
                />
                      <p className="text-xs text-muted-foreground">
                        Use lowercase letters and underscores only
                      </p>
              </div>

                    <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                        <Label htmlFor="template-category">Category *</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate(prev => ({
                    ...prev,
                    category: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                        <Label htmlFor="template-language">Language *</Label>
                <Select
                  value={newTemplate.language}
                  onValueChange={(value) => setNewTemplate(prev => ({
                    ...prev,
                    language: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                            <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                    </div>
              </div>

                  {/* Header Component */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Header (Optional)</h3>
                    
                <div className="grid gap-2">
                      <Label htmlFor="header-type">Header Type</Label>
                  <Select
                        value={newTemplate.components[0].format || 'TEXT'}
                    onValueChange={(value: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT') => {
                      const components = [...newTemplate.components];
                          components[0] = { 
                            type: 'HEADER', 
                            format: value, 
                            text: value === 'TEXT' ? (components[0].text || '') : undefined,
                            example: value !== 'TEXT' ? { header_handle: [] } : undefined
                          };
                      setNewTemplate(prev => ({ ...prev, components }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="DOCUMENT">Document</SelectItem>
                    </SelectContent>
                  </Select>
                    </div>

                  {newTemplate.components[0].format === 'TEXT' ? (
                      <div className="grid gap-2">
                        <Label htmlFor="header-text">Header Text</Label>
                    <Input
                          id="header-text"
                          placeholder="Enter header text"
                      value={newTemplate.components[0].text || ''}
                      onChange={(e) => {
                        const components = [...newTemplate.components];
                        components[0] = { ...components[0], text: e.target.value };
                        setNewTemplate(prev => ({ ...prev, components }));
                      }}
                    />
                        <p className="text-xs text-muted-foreground">
                          Maximum 60 characters
                        </p>
                      </div>
                    ) : newTemplate.components[0].format && (newTemplate.components[0].format === 'IMAGE' || newTemplate.components[0].format === 'VIDEO' || newTemplate.components[0].format === 'DOCUMENT') ? (
                    <div className="space-y-2">
                        <Label htmlFor="header-media">Upload {newTemplate.components[0].format}</Label>
                      <Input
                          id="header-media"
                        type="file"
                        accept={
                          newTemplate.components[0].format === 'IMAGE' ? 'image/*' :
                          newTemplate.components[0].format === 'VIDEO' ? 'video/*' :
                          newTemplate.components[0].format === 'DOCUMENT' ? '.pdf,.doc,.docx' :
                          undefined
                        }
                        key={`file-input-${newTemplate.components[0].format}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                               // For now, we'll store the file reference
                               // In a real implementation, you'd upload the file to your server first
                               // and get a proper URL that WhatsApp can access
                               const components = [...newTemplate.components];
                               components[0] = { 
                                 ...components[0], 
                                 example: { header_handle: [file.name] }, // Store filename for now
                                 file: file // Store file reference for upload
                               };
                               setNewTemplate(prev => ({ ...prev, components }));
                               
                               // Show warning about file upload
                               toast({
                                 title: "File Upload Notice",
                                 description: "File uploads require server-side implementation. For now, only text headers are supported.",
                                 variant: "default",
                               });
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                          {newTemplate.components[0].format === 'IMAGE' && 'Supported: JPG, PNG (max 5MB)'}
                          {newTemplate.components[0].format === 'VIDEO' && 'Supported: MP4 (max 16MB)'}
                          {newTemplate.components[0].format === 'DOCUMENT' && 'Supported: PDF, DOC (max 100MB)'}
                      </p>
                    </div>
                    ) : null}
                </div>

                  {/* Body Component */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Body (Required)</h3>

                <div className="grid gap-2">
                      <Label htmlFor="body-text">Message Body *</Label>
                  <Textarea
                        id="body-text"
                        placeholder="Enter your message content here..."
                        className="min-h-[100px]"
                    value={newTemplate.components[1].text || ''}
                    onChange={(e) => {
                      const components = [...newTemplate.components];
                          components[1] = { type: 'BODY', text: e.target.value };
                      setNewTemplate(prev => ({ ...prev, components }));
                    }}
                  />
                      <p className="text-xs text-muted-foreground">
                        Maximum 1024 characters. Use {'{{1}}'}, {'{{2}}'} for variables.
                      </p>
                    </div>
                </div>

                  {/* Footer Component */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Footer (Optional)</h3>

                <div className="grid gap-2">
                      <Label htmlFor="footer-text">Footer Text</Label>
                  <Input
                        id="footer-text"
                        placeholder="Enter footer text"
                        value={newTemplate.components[2].text || ''}
                    onChange={(e) => {
                      const components = [...newTemplate.components];
                          components[2] = { type: 'FOOTER', text: e.target.value };
                      setNewTemplate(prev => ({ ...prev, components }));
                    }}
                  />
                      <p className="text-xs text-muted-foreground">
                        Maximum 60 characters
                      </p>
                    </div>
                  </div>

                                     {/* Buttons Component */}
                   <div className="space-y-2">
                     <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Buttons (Optional)</h3>
                     
                                          <div className="space-y-2">
                       {/* Empty State */}
                       {(!newTemplate.components[3]?.buttons || newTemplate.components[3].buttons.length === 0) && (
                         <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                           No buttons added yet. Click "Add Button" to get started.
                         </div>
                       )}
                       
                       {/* Existing Buttons */}
                       {newTemplate.components[3]?.buttons?.map((button, buttonIndex) => (
                         <div key={buttonIndex} className="border rounded-lg p-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Button {buttonIndex + 1}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const components = [...newTemplate.components];
                                if (!components[3]) {
                                  components[3] = { type: 'BUTTONS', buttons: [] };
                                }
                                const buttons = [...(components[3].buttons || [])];
                                buttons.splice(buttonIndex, 1);
                                components[3].buttons = buttons;
                                setNewTemplate(prev => ({ ...prev, components }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label>Button Type</Label>
                            <Select
                              value={newTemplate.components[3]?.buttons?.[buttonIndex]?.type || ''}
                              onValueChange={(value: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE') => {
                                const components = [...newTemplate.components];
                                if (!components[3]) {
                                  components[3] = { type: 'BUTTONS', buttons: [] };
                                }
                                if (!components[3].buttons) {
                                  components[3].buttons = [];
                                }
                                if (!components[3].buttons[buttonIndex]) {
                                  components[3].buttons[buttonIndex] = { type: value, text: '' };
                                } else {
                                  components[3].buttons[buttonIndex] = { ...components[3].buttons[buttonIndex], type: value };
                                }
                                setNewTemplate(prev => ({ ...prev, components }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select button type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                                <SelectItem value="URL">URL</SelectItem>
                                <SelectItem value="PHONE_NUMBER">Phone Number</SelectItem>
                                <SelectItem value="COPY_CODE">Copy Code</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label>Button Text</Label>
                            <Input
                              placeholder="Enter button text"
                              value={newTemplate.components[3]?.buttons?.[buttonIndex]?.text || ''}
                              onChange={(e) => {
                                const components = [...newTemplate.components];
                                if (!components[3]) {
                                  components[3] = { type: 'BUTTONS', buttons: [] };
                                }
                                if (!components[3].buttons) {
                                  components[3].buttons = [];
                                }
                                if (!components[3].buttons[buttonIndex]) {
                                  components[3].buttons[buttonIndex] = { type: 'QUICK_REPLY', text: e.target.value };
                                } else {
                                  components[3].buttons[buttonIndex] = { ...components[3].buttons[buttonIndex], text: e.target.value };
                                }
                      setNewTemplate(prev => ({ ...prev, components }));
                    }}
                  />
                </div>

                          {newTemplate.components[3]?.buttons?.[buttonIndex]?.type === 'URL' && (
                            <div className="grid gap-2">
                              <Label>URL</Label>
                              <Input
                                placeholder="https://example.com"
                                value={newTemplate.components[3]?.buttons?.[buttonIndex]?.url || ''}
                                onChange={(e) => {
                                  const components = [...newTemplate.components];
                                  if (components[3]?.buttons?.[buttonIndex]) {
                                    components[3].buttons[buttonIndex] = { 
                                      ...components[3].buttons[buttonIndex], 
                                      url: e.target.value 
                                    };
                                    setNewTemplate(prev => ({ ...prev, components }));
                                  }
                                }}
                              />
                            </div>
                          )}

                          {newTemplate.components[3]?.buttons?.[buttonIndex]?.type === 'PHONE_NUMBER' && (
                            <div className="grid gap-2">
                              <Label>Phone Number</Label>
                              <Input
                                placeholder="+1234567890"
                                value={newTemplate.components[3]?.buttons?.[buttonIndex]?.phone_number || ''}
                                onChange={(e) => {
                                  const components = [...newTemplate.components];
                                  if (components[3]?.buttons?.[buttonIndex]) {
                                    components[3].buttons[buttonIndex] = { 
                                      ...components[3].buttons[buttonIndex], 
                                      phone_number: e.target.value 
                                    };
                                    setNewTemplate(prev => ({ ...prev, components }));
                                  }
                                }}
                              />
                            </div>
                          )}

                          {newTemplate.components[3]?.buttons?.[buttonIndex]?.type === 'COPY_CODE' && (
                <div className="grid gap-2">
                              <Label>Code</Label>
                  <Input
                                placeholder="Enter code to copy"
                                value={newTemplate.components[3]?.buttons?.[buttonIndex]?.code || ''}
                    onChange={(e) => {
                      const components = [...newTemplate.components];
                                  if (components[3]?.buttons?.[buttonIndex]) {
                                    components[3].buttons[buttonIndex] = { 
                                      ...components[3].buttons[buttonIndex], 
                                      code: e.target.value 
                                    };
                      setNewTemplate(prev => ({ ...prev, components }));
                                  }
                    }}
                  />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Add Button - Only show if less than 3 buttons */}
                      {(newTemplate.components[3]?.buttons?.length || 0) < 3 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const components = [...newTemplate.components];
                            if (!components[3]) {
                              components[3] = { type: 'BUTTONS', buttons: [] };
                            }
                            if (!components[3].buttons) {
                              components[3].buttons = [];
                            }
                            // Add a new button (max 3 buttons allowed)
                            if (components[3].buttons.length < 3) {
                              components[3].buttons.push({ type: 'QUICK_REPLY', text: '' });
                              setNewTemplate(prev => ({ ...prev, components }));
                            } else {
                              toast({
                                title: "Maximum Buttons Reached",
                                description: "You can only add up to 3 buttons per template.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Button
                        </Button>
                      )}
                </div>
              </div>
            </div>
          </ScrollArea>
            </div>

                         {/* Preview Section */}
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Template Preview</h3>
                 <Badge variant="outline">WhatsApp Preview</Badge>
               </div>
               
               <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 h-[350px] overflow-y-auto">
                 <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border max-w-sm mx-auto">
                   {/* Template Preview */}
                   <div className="p-3 space-y-2">
                    {/* Header Preview */}
                    {newTemplate.components[0]?.format === 'TEXT' && newTemplate.components[0]?.text && (
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {newTemplate.components[0].text}
                      </div>
                    )}
                    
                    {newTemplate.components[0]?.format === 'IMAGE' && newTemplate.components[0]?.file && previewUrls[0] && (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img 
                          src={previewUrls[0]} 
                          alt="Header" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <div className="text-2xl mb-2">🖼️</div>
                            <div>Image Preview</div>
                            <div className="text-xs mt-1">{newTemplate.components[0].file?.name}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {newTemplate.components[0]?.format === 'VIDEO' && newTemplate.components[0]?.file && previewUrls[0] && (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <video 
                          src={previewUrls[0]} 
                          controls 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if video fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                          <div className="text-center">
                            <div className="text-2xl mb-2">🎥</div>
                            <div>Video Preview</div>
                            <div className="text-xs mt-1">{newTemplate.components[0].file?.name}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {newTemplate.components[0]?.format === 'DOCUMENT' && newTemplate.components[0]?.file && (
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex items-center space-x-2">
                        <div className="text-2xl">📄</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <div>Document Attachment</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {newTemplate.components[0].file?.name}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Body Preview */}
                    {newTemplate.components[1]?.text && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {newTemplate.components[1].text}
                      </div>
                    )}

                    {/* Footer Preview */}
                    {newTemplate.components[2]?.text && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
                        {newTemplate.components[2].text}
                      </div>
                    )}

                    {/* Buttons Preview */}
                    {newTemplate.components[3]?.buttons && newTemplate.components[3].buttons.length > 0 && (
                      <div className="space-y-2 pt-3 border-t">
                        {newTemplate.components[3].buttons.map((button, index) => (
                          <div
                            key={index}
                            className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors rounded-lg p-3 text-sm text-center cursor-pointer border border-blue-200 dark:border-blue-800"
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
                    )}
                  </div>
                </div>
              </div>

                             {/* Template Info */}
               <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                 <h4 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Template Information</h4>
                 <div className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                   <div><strong>Name:</strong> {newTemplate.name || 'Not set'}</div>
                   <div><strong>Category:</strong> {newTemplate.category}</div>
                   <div><strong>Language:</strong> {newTemplate.language.toUpperCase()}</div>
                   <div><strong>Status:</strong> Will be submitted for approval</div>
                 </div>
               </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setShowNewTemplate(false);
              resetTemplateForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name || !newTemplate.components[1]?.text}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewTemplate && (
              <div className="bg-muted rounded-lg p-4 space-y-3">
                {previewTemplate.components.map((component, idx) => {
                  if (component.type === 'HEADER') {
                    return (
                      <div key={idx} className="space-y-2">
                        {component.format === 'TEXT' && (
                          <p className="font-semibold">{component.text}</p>
                        )}
                        {component.format === 'IMAGE' && (
                          <div className="bg-background rounded-lg p-3 text-center">
                            <div className="aspect-video bg-muted-foreground/10 rounded-md flex items-center justify-center">
                              {component.example?.header_handle?.[0] ? (
                                <img 
                                  src={component.example.header_handle[0]} 
                                  alt="Header" 
                                  className="max-h-full rounded-md object-contain"
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">Image Preview</p>
                              )}
                            </div>
                          </div>
                        )}
                        {component.format === 'VIDEO' && (
                          <div className="bg-background rounded-lg p-3 text-center">
                            <div className="aspect-video bg-muted-foreground/10 rounded-md flex items-center justify-center">
                              {component.example?.header_handle?.[0] ? (
                                <video 
                                  src={component.example.header_handle[0]} 
                                  controls 
                                  className="max-h-full rounded-md"
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">Video Preview</p>
                              )}
                            </div>
                          </div>
                        )}
                        {component.format === 'DOCUMENT' && (
                          <div className="bg-background rounded-lg p-3 text-center">
                            <div className="bg-muted-foreground/10 rounded-md p-4 flex items-center justify-center">
                              <p className="text-sm text-muted-foreground">
                                📄 Document Attachment
                                {component.example?.header_handle?.[0] && (
                                  <span className="block text-xs mt-1">
                                    {component.example.header_handle[0].split('/').pop()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }
                  if (component.type === 'BODY') {
                    return (
                      <div key={idx} className="text-sm whitespace-pre-line">
                        {component.text}
                      </div>
                    )
                  }
                  if (component.type === 'FOOTER') {
                    return (
                      <div key={idx} className="text-xs text-muted-foreground">
                        {component.text}
                      </div>
                    )
                  }
                  if (component.type === 'BUTTONS' && component.buttons) {
                    return (
                      <div key={idx} className="space-y-2 pt-2 border-t">
                        {component.buttons.map((button, buttonIdx) => (
                          <div
                            key={buttonIdx}
                            className="bg-primary/10 hover:bg-primary/20 transition-colors rounded-md p-2 text-sm text-center cursor-pointer"
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
                    )
                  }
                  return null
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Token Update Modal */}
      <TokenUpdateModal
        isOpen={showTokenUpdateModal}
        onClose={() => setShowTokenUpdateModal(false)}
        onUpdateToken={async (token: string) => {
          if (!tokenUpdateData.integrationId) return;
          
          setIsUpdatingToken(true);
          try {
            await integrationApi.updateAccessToken(tokenUpdateData.integrationId, token);
            toast({
              title: "Success",
              description: "Access token updated successfully. You can now create templates.",
            });
            setShowTokenUpdateModal(false);
            // Refresh the accounts to update the status
            fetchAccounts();
          } catch (error: any) {
            throw error; // Let the modal handle the error display
          } finally {
            setIsUpdatingToken(false);
          }
        }}
        businessName={tokenUpdateData.businessName}
        phoneNumber={tokenUpdateData.phoneNumber}
        errorMessage={tokenUpdateData.errorMessage}
        isLoading={isUpdatingToken}
      />

      {/* Template Rejection Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Template Rejected
            </DialogTitle>
            <DialogDescription>
              Your template was rejected by WhatsApp and needs to be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-medium text-destructive mb-2">Rejection Reason:</h4>
              <p className="text-sm text-muted-foreground">
                {rejectionData.rejectionReason || "Template variables without sample text or policy violation"}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Suggested Action:</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {rejectionData.suggestedAction || "Please add sample text for variables and resubmit for review"}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">WhatsApp Guidelines:</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Add sample text for variables - separate multiple values with commas (e.g., "John, Smith" for {`{{1}}, {{2}}`})</li>
                <li>• Ensure content complies with WhatsApp Business Policy</li>
                <li>• Avoid promotional language in utility templates</li>
                <li>• Keep templates clear and professional</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowRejectionModal(false);
              if (editingTemplate) {
                handleEditTemplate(editingTemplate);
              }
            }}>
              Edit Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Edit Modal */}
      <Dialog open={showEditTemplate} onOpenChange={setShowEditTemplate}>
        <DialogContent className="max-w-[1200px] max-h-[95vh] w-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit Template - {editingTemplate?.name}</DialogTitle>
            <DialogDescription>
              Update your template with sample text and resubmit for review
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Form Section */}
            <div className="h-[65vh] overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-3 pb-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Template Components</h3>
                    
                    {editTemplateData.components.map((component, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{component.type}</span>
                          {component.type !== 'BODY' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newComponents = editTemplateData.components.filter((_, i) => i !== idx);
                                setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {component.type === 'HEADER' && (
                          <div className="space-y-2">
                            <Label>Format</Label>
                            <Select
                              value={component.format}
                              onValueChange={(value) => {
                                const newComponents = [...editTemplateData.components];
                                newComponents[idx] = { ...component, format: value as 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' };
                                setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TEXT">Text</SelectItem>
                                <SelectItem value="IMAGE">Image</SelectItem>
                                <SelectItem value="VIDEO">Video</SelectItem>
                                <SelectItem value="DOCUMENT">Document</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Label>Text Content</Label>
                            <Textarea
                              placeholder="Enter header text with variables like {{1}}"
                              value={component.text}
                              onChange={(e) => {
                                const newComponents = [...editTemplateData.components];
                                newComponents[idx] = { ...component, text: e.target.value };
                                setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                              }}
                            />
                            
                            <Label>Sample Text (for variables)</Label>
                            <Input
                              placeholder="e.g., Welcome John! (for {{1}}) or John, Smith (for {{1}}, {{2}})"
                              value={component.example?.header_text?.[0] || ''}
                              onChange={(e) => {
                                const newComponents = [...editTemplateData.components];
                                newComponents[idx] = {
                                  ...component,
                                  example: {
                                    ...component.example,
                                    header_text: [e.target.value]
                                  }
                                };
                                setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                              }}
                            />
                          </div>
                        )}
                        
                        {component.type === 'BODY' && (
                          <div className="space-y-2">
                            <Label>Message Text</Label>
                            <Textarea
                              placeholder="Enter message text with variables like {{1}}"
                              value={component.text}
                              onChange={(e) => {
                                const newComponents = [...editTemplateData.components];
                                newComponents[idx] = { ...component, text: e.target.value };
                                setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                              }}
                            />
                            
                            <Label>Sample Text (for variables)</Label>
                            <Input
                              placeholder="e.g., John, 12345 (for {{1}}, {{2}}) - separate multiple values with commas"
                              value={component.example?.body_text?.[0] || ''}
                              onChange={(e) => {
                                const newComponents = [...editTemplateData.components];
                                newComponents[idx] = {
                                  ...component,
                                  example: {
                                    ...component.example,
                                    body_text: [e.target.value]
                                  }
                                };
                                setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                              }}
                            />
                          </div>
                        )}
                        
                        {component.type === 'FOOTER' && (
                          <div className="space-y-2">
                            <Label>Footer Text</Label>
                            <Textarea
                              placeholder="Enter footer text"
                              value={component.text}
                              onChange={(e) => {
                                const newComponents = [...editTemplateData.components];
                                newComponents[idx] = { ...component, text: e.target.value };
                                setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                              }}
                            />
                          </div>
                        )}
                        
                        {component.type === 'BUTTONS' && (
                          <div className="space-y-2">
                            <Label>Buttons</Label>
                            {component.buttons?.map((button, buttonIdx) => (
                              <div key={buttonIdx} className="flex gap-2 items-center">
                                <Select
                                  value={button.type}
                                  onValueChange={(value) => {
                                    const newComponents = [...editTemplateData.components];
                                    newComponents[idx] = {
                                      ...component,
                                      buttons: component.buttons?.map((b, i) => 
                                        i === buttonIdx ? { ...b, type: value as 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE' } : b
                                      )
                                    };
                                    setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                                    <SelectItem value="URL">URL</SelectItem>
                                    <SelectItem value="PHONE_NUMBER">Phone</SelectItem>
                                    <SelectItem value="COPY_CODE">Copy Code</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Input
                                  placeholder="Button text"
                                  value={button.text}
                                  onChange={(e) => {
                                    const newComponents = [...editTemplateData.components];
                                    newComponents[idx] = {
                                      ...component,
                                      buttons: component.buttons?.map((b, i) => 
                                        i === buttonIdx ? { ...b, text: e.target.value } : b
                                      )
                                    };
                                    setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                                  }}
                                />
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newComponents = [...editTemplateData.components];
                                    newComponents[idx] = {
                                      ...component,
                                      buttons: component.buttons?.filter((_, i) => i !== buttonIdx)
                                    };
                                    setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newComponents = [...editTemplateData.components];
                                newComponents[idx] = {
                                  ...component,
                                  buttons: [
                                    ...(component.buttons || []),
                                    { type: 'QUICK_REPLY', text: '' }
                                  ]
                                };
                                setEditTemplateData(prev => ({ ...prev, components: newComponents }));
                              }}
                            >
                              Add Button
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Preview Section */}
            <div className="h-[65vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Preview</h3>
              </div>
              
              <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 max-w-sm mx-auto">
                  <div className="space-y-2">
                    {editTemplateData.components.map((component, idx) => {
                        if (component.type === 'HEADER') {
                          // Replace variables with sample text
                          const displayText = component.example?.header_text?.[0] 
                            ? replaceVariablesWithSample(component.text || '', component.example.header_text[0])
                            : component.text || '';
                          return (
                            <div key={idx} className="font-semibold text-lg">
                              {displayText}
                            </div>
                          )
                        }
                        if (component.type === 'BODY') {
                          // Replace variables with sample text
                          const displayText = component.example?.body_text?.[0] 
                            ? replaceVariablesWithSample(component.text || '', component.example.body_text[0])
                            : component.text || '';
                          return (
                            <div key={idx} className="text-sm whitespace-pre-line">
                              {displayText}
                            </div>
                          )
                        }
                      if (component.type === 'FOOTER') {
                        return (
                          <div key={idx} className="text-xs text-muted-foreground">
                            {component.text}
                          </div>
                        )
                      }
                      if (component.type === 'BUTTONS' && component.buttons) {
                        return (
                          <div key={idx} className="space-y-2 pt-2 border-t">
                            {component.buttons.map((button, buttonIdx) => (
                              <div
                                key={buttonIdx}
                                className="bg-primary/10 hover:bg-primary/20 transition-colors rounded-md p-2 text-sm text-center cursor-pointer"
                              >
                                {button.text}
                              </div>
                            ))}
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTemplate(false)}>
              Cancel
            </Button>
        <Button 
          onClick={() => {
            console.log('Update button clicked - before handler', { isCreatingTemplate, currentAccount, selectedAccount, editingTemplate });
            handleUpdateTemplate();
          }} 
          disabled={isCreatingTemplate}
        >
          {isCreatingTemplate ? 'Updating...' : 'Update Template'}
        </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  )
}
