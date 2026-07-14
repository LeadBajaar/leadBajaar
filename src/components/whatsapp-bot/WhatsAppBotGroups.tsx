'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, Trash2, UserPlus, Upload, FileText, Loader2, Search, Check, ChevronRight, ArrowLeft, X, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { WHATSAPP_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Group {
  id: number;
  name: string;
  description: string;
  contact_count: number;
  created_at: string;
}

interface WhatsAppBotGroupsProps {
  userId: string;
}

export function WhatsAppBotGroups({ userId }: WhatsAppBotGroupsProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isViewContactsOpen, setIsViewContactsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupContacts, setGroupContacts] = useState<any[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Pagination Logic
  const filteredContacts = groupContacts.filter(c => 
    c.phone.includes(contactSearch) || 
    (c.name && c.name.toLowerCase().includes(contactSearch.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredContacts.length / pageSize);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );
  
  // New Group State
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // Import State
  const [file, setFile] = useState<File | null>(null);
  const [importText, setImportText] = useState('');
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<{csvHeader: string, contactField: string}[]>([]);
  const [importMode, setImportMode] = useState<'manual' | 'csv'>('manual');
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<{
    totalRows: number;
    successfulRows: number;
    skippedRows: number;
    errors: any[];
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  useEffect(() => {
    fetchGroups();
  }, [userId]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${WHATSAPP_BASE_URL}/campaigns/groups/${userId}`);
      setGroups(res.data || []);
    } catch (err) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async (groupId: number) => {
    try {
      const res = await axios.get(`${WHATSAPP_BASE_URL}/campaigns/contacts/${userId}/${groupId}`);
      setGroupContacts(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch contacts');
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group? All contacts within it will be removed.')) return;
    try {
      await axios.delete(`${WHATSAPP_BASE_URL}/campaigns/groups/${groupId}`);
      toast.success('Group deleted');
      fetchGroups();
    } catch (err) {
      toast.error('Failed to delete group');
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      await axios.delete(`${WHATSAPP_BASE_URL}/campaigns/contacts/${contactId}`);
      setGroupContacts(prev => prev.filter(c => c.id !== contactId));
      fetchGroups(); // Refresh count
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || isCreatingGroup) return;
    try {
      setIsCreatingGroup(true);
      await axios.post(`${WHATSAPP_BASE_URL}/campaigns/groups`, {
        userId,
        name: groupName,
        description: groupDesc
      });
      toast.success('Group created');
      setIsCreateModalOpen(false);
      setGroupName('');
      setGroupDesc('');
      fetchGroups();
    } catch (err) {
      toast.error('Failed to create group');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setImportError(null);
    setImportStats(null);

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setImportError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          setImportError('CSV file is empty or has no data rows');
          return;
        }

        const result = lines.map(line => parseCSVLine(line));
        const headers = result[0];
        setCsvHeaders(headers);
        setCsvData(result.slice(1));
        
        // Initialize column mapping
        const initialMapping = headers.map(header => {
          let field = 'skip';
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('contact')) {
            field = 'phone';
          } else if (lowerHeader.includes('name')) {
            field = 'name';
          }
          return { csvHeader: header, contactField: field };
        });
        setColumnMapping(initialMapping);
      } catch (err) {
        setImportError('Failed to parse CSV file');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImportContacts = async () => {
    if (!selectedGroup || isImporting) return;
    
    setIsImporting(true);
    setImportError(null);
    let contacts: any[] = [];

    try {
      if (importMode === 'manual') {
        const lines = importText.split('\n').filter(l => l.trim());
        contacts = lines.map(line => {
          const [phone, name] = line.split(',').map(s => s.trim());
          return { phone, name: name || null };
        }).filter(c => c.phone);
      } else {
        const phoneMapping = columnMapping.find(m => m.contactField === 'phone');
        if (!phoneMapping) {
          toast.error('Please map the Phone column');
          setIsImporting(false);
          return;
        }

        const phoneIdx = csvHeaders.indexOf(phoneMapping.csvHeader);
        const nameMapping = columnMapping.find(m => m.contactField === 'name');
        const nameIdx = nameMapping ? csvHeaders.indexOf(nameMapping.csvHeader) : -1;
        
        contacts = csvData.map(row => ({
          phone: row[phoneIdx],
          name: nameIdx !== -1 ? row[nameIdx] : null
        })).filter(c => c.phone);
      }

      if (contacts.length === 0) {
        toast.error('No valid contacts found');
        setIsImporting(false);
        return;
      }

      const response = await axios.post(`${WHATSAPP_BASE_URL}/campaigns/contacts/import`, {
        userId,
        groupId: selectedGroup.id,
        contacts
      });

      setImportStats({
        totalRows: contacts.length,
        successfulRows: response.data?.successful || contacts.length,
        skippedRows: response.data?.skipped || 0,
        errors: response.data?.errors || []
      });

      toast.success(`Successfully imported contacts`);
      fetchGroups();
      if (response.data?.errors?.length === 0) {
        setTimeout(() => {
          setIsImportModalOpen(false);
          resetImport();
        }, 2000);
      }
    } catch (err) {
      toast.error('Failed to import contacts');
      setImportError('An error occurred during import. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setImportText('');
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping([]);
    setImportStats(null);
    setImportError(null);
    setFile(null);
  };

  const handleColumnMapChange = (csvHeader: string, contactField: string) => {
    setColumnMapping(prev => prev.map(m => 
      m.csvHeader === csvHeader ? { ...m, contactField } : m
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Contact Groups</h3>
          <p className="text-xs text-slate-500 font-medium">Manage your private WhatsApp audience segments.</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-black text-xl">Create Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Group Name</Label>
                <Input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Real Estate Investors" className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</Label>
                <Input value={groupDesc} onChange={e => setGroupDesc(e.target.value)} placeholder="Optional description" className="rounded-xl h-11" />
              </div>
              <Button 
                onClick={handleCreateGroup} 
                disabled={isCreatingGroup || !groupName}
                className="w-full bg-primary h-12 font-black rounded-xl shadow-lg shadow-primary/20"
              >
                {isCreatingGroup ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Group'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <Users className="h-12 w-12 text-slate-200 mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No groups found</p>
          <p className="text-xs text-slate-400 mt-2">Create a group to start importing contacts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <Card key={group.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all rounded-2xl group overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-primary/10 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest">{group.contact_count} Contacts</Badge>
                </div>
                <CardTitle className="text-lg font-black mt-4 truncate">{group.name}</CardTitle>
                <CardDescription className="text-xs font-medium line-clamp-1">{group.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-lg font-bold text-[10px] uppercase tracking-wider h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => {
                      setSelectedGroup(group);
                      fetchContacts(group.id);
                      setIsViewContactsOpen(true);
                    }}
                  >
                    <Search className="mr-1.5 h-3.5 w-3.5" /> View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-lg font-bold text-[10px] uppercase tracking-wider h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsImportModalOpen(true);
                    }}
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Import
                  </Button>
                  <Button onClick={() => handleDeleteGroup(group.id)} variant="ghost" size="sm" className="rounded-lg h-9 w-9 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Contacts Dialog */}
      <Dialog open={isViewContactsOpen} onOpenChange={setIsViewContactsOpen}>
        <DialogContent 
          onInteractOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl"
        >
          <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 dark:bg-primary/10 rounded-xl">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Group Management</span>
                  <DialogHeader className="p-0">
                    <DialogTitle className="font-black text-xl text-slate-900 dark:text-white">{selectedGroup?.name}</DialogTitle>
                  </DialogHeader>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  onClick={() => selectedGroup && handleDeleteGroup(selectedGroup.id)}
                  title="Delete Group"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsViewContactsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by phone or name..." 
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm"
                  value={contactSearch}
                  onChange={e => {
                    setContactSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="px-3 flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-0.5">Page</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {currentPage} <span className="text-slate-400">/</span> {totalPages || 1}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/20 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <div className="space-y-2">
                {paginatedContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Users className="h-12 w-12 text-slate-200 mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No contacts found</p>
                    <p className="text-xs text-slate-400 mt-2">Try a different search or import more leads.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {paginatedContacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm hover:border-primary/20 dark:hover:border-indigo-800 transition-colors group/item">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 dark:bg-primary/10 flex items-center justify-center font-black text-[10px] text-primary">
                            {contact.phone.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">+{contact.phone}</p>
                            {contact.name && (
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {contact.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {contact.is_verified && (
                            <Badge className={cn(
                              "text-[9px] font-black tracking-widest px-3",
                              contact.exists_on_whatsapp ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            )}>
                              {contact.exists_on_whatsapp ? 'WA ACTIVE' : 'NO WA'}
                            </Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={(open) => {
        if (!open) resetImport();
        setIsImportModalOpen(open);
      }}>
        <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 shrink-0">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Import Contacts</DialogTitle>
                <DialogDescription className="text-sm text-slate-500 font-medium mt-0.5">Import contacts to {selectedGroup?.name}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-950/30 no-scrollbar">
            <Tabs defaultValue="manual" onValueChange={(v) => setImportMode(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mb-6">
                <TabsTrigger value="manual" className="rounded-lg font-bold text-xs uppercase tracking-widest">Manual Paste</TabsTrigger>
                <TabsTrigger value="csv" className="rounded-lg font-bold text-xs uppercase tracking-widest">CSV Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Format Guide</p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 font-medium leading-relaxed">
                    Enter contacts in <code className="font-bold">phone,name</code> format (one per line). <br/>
                    Example: <code className="font-bold">919876543210,John Doe</code>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Paste Contacts</Label>
                  <textarea 
                    value={importText} 
                    onChange={e => setImportText(e.target.value)}
                    placeholder="919876543210,John Doe\n919012345678,Jane Smith"
                    className="w-full h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="csv" className="space-y-6">
                {importError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm mb-1">Import Error</div>
                      <p className="text-sm opacity-90 leading-relaxed font-medium">{importError}</p>
                    </div>
                  </div>
                )}

                {csvHeaders.length === 0 && !isImporting && !importStats ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50 shadow-sm transition-all hover:border-indigo-300">
                    <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">Select a CSV file to continue</p>
                    <Input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      id="csv-upload" 
                      onChange={handleFileChange}
                    />
                    <Button 
                      variant="outline" 
                      className="mt-6 rounded-xl font-bold h-10 px-6 border-slate-200 hover:bg-slate-50" 
                      onClick={() => document.getElementById('csv-upload')?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                ) : !isImporting && !importStats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {columnMapping.map((mapping) => (
                        <div
                          key={mapping.csvHeader}
                          className="flex flex-col space-y-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate pr-2">
                              CSV Column
                            </span>
                            {mapping.contactField !== 'skip' && (
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mb-1">
                            {mapping.csvHeader}
                          </div>
                          <Select
                            value={mapping.contactField}
                            onValueChange={(value) => handleColumnMapChange(mapping.csvHeader, value)}
                          >
                            <SelectTrigger className="w-full h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-[11px] font-semibold rounded-xl focus:ring-indigo-500/20">
                              <SelectValue placeholder="Map to..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl border-slate-200 dark:border-slate-800">
                              <SelectItem value="skip" className="text-xs font-medium text-slate-400 italic">Skip this column</SelectItem>
                              <SelectItem value="phone" className="text-xs font-bold">Phone Number (Required)</SelectItem>
                              <SelectItem value="name" className="text-xs font-bold">Full Name</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Preview</p>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg" onClick={() => { resetImport(); }}>
                          Change File
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {csvData.slice(0, 3).map((row, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800/50">
                            <div className="w-5 h-5 bg-primary/10 text-primary flex items-center justify-center rounded-lg text-[9px] shrink-0">{i+1}</div>
                            {columnMapping.map(m => m.contactField !== 'skip' ? (
                              <div key={m.csvHeader} className="flex flex-col min-w-0">
                                <span className="text-[8px] text-slate-400 uppercase leading-none mb-0.5">{m.contactField}</span>
                                <span className="truncate">{row[csvHeaders.indexOf(m.csvHeader)] || '---'}</span>
                              </div>
                            ) : null)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Progress View */}
                {isImporting && (
                  <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                    <div className="relative mb-8">
                      <div className="h-24 w-24 rounded-full border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-primary dark:text-indigo-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Importing Contacts</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                      We're currently importing and validating your contacts. This may take a few moments.
                    </p>
                  </div>
                )}

                {/* Stats View */}
                {importStats && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{importStats.totalRows}</div>
                      </div>
                      <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 text-center shadow-sm">
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Success</div>
                        <div className="text-2xl font-black text-emerald-600">{importStats.successfulRows}</div>
                      </div>
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/30 text-center shadow-sm">
                        <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Skipped</div>
                        <div className="text-2xl font-black text-amber-600">{importStats.skippedRows}</div>
                      </div>
                    </div>

                    {importStats.errors.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            Error Log ({importStats.errors.length})
                          </h4>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-2 space-y-1.5 no-scrollbar">
                          {importStats.errors.map((error, index) => (
                            <div key={index} className="text-[11px] flex items-center gap-4 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <span className="font-bold text-slate-400 shrink-0 w-12">Row {error.row || index + 1}</span>
                              <div className="flex-1 truncate">
                                <span className="font-bold text-red-500 mr-2">{error.reason || 'Failed to import'}</span>
                                <span className="text-slate-400 font-medium">Value: {error.value || 'N/A'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3 sm:gap-0 shrink-0">
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)} disabled={isImporting} className="rounded-xl font-semibold text-slate-500">
              {importStats ? 'Close' : 'Cancel'}
            </Button>
            {!importStats && (
              <Button
                onClick={handleImportContacts}
                disabled={isImporting || (importMode === 'csv' && csvHeaders.length === 0)}
                className="min-w-[140px] bg-primary hover:bg-primary/90 h-10 rounded-xl shadow-lg shadow-primary/20 dark:shadow-none font-bold text-sm transition-all active:scale-95"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Start Import
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
