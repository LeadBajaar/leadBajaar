'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, Trash2, UserPlus, Upload, FileText, Loader2, Search, Check, ChevronRight, ArrowLeft, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  
  // Import State
  const [importText, setImportText] = useState('');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({ phone: '', name: '' });
  const [importMode, setImportMode] = useState<'manual' | 'csv'>('manual');

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
    if (!groupName) return;
    try {
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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      if (rows.length > 0) {
        const headers = rows[0];
        setCsvHeaders(headers);
        setCsvData(rows.slice(1).filter(r => r.length === headers.length));
        
        // Auto-guess mapping
        const phoneIdx = headers.findIndex(h => h.toLowerCase().includes('phone') || h.toLowerCase().includes('mobile'));
        const nameIdx = headers.findIndex(h => h.toLowerCase().includes('name'));
        setMapping({
          phone: phoneIdx !== -1 ? headers[phoneIdx] : '',
          name: nameIdx !== -1 ? headers[nameIdx] : ''
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImportContacts = async () => {
    if (!selectedGroup) return;
    
    let contacts: any[] = [];

    if (importMode === 'manual') {
      const lines = importText.split('\n').filter(l => l.trim());
      contacts = lines.map(line => {
        const [phone, name] = line.split(',').map(s => s.trim());
        return { phone, name: name || null };
      }).filter(c => c.phone);
    } else {
      if (!mapping.phone) {
        toast.error('Please map the Phone column');
        return;
      }
      const phoneIdx = csvHeaders.indexOf(mapping.phone);
      const nameIdx = mapping.name ? csvHeaders.indexOf(mapping.name) : -1;
      
      contacts = csvData.map(row => ({
        phone: row[phoneIdx],
        name: nameIdx !== -1 ? row[nameIdx] : null
      })).filter(c => c.phone);
    }

    if (contacts.length === 0) {
      toast.error('No valid contacts found');
      return;
    }

    try {
      await axios.post(`${WHATSAPP_BASE_URL}/campaigns/contacts/import`, {
        userId,
        groupId: selectedGroup.id,
        contacts
      });
      toast.success(`Successfully imported ${contacts.length} contacts`);
      setIsImportModalOpen(false);
      setImportText('');
      setCsvData([]);
      setCsvHeaders([]);
      fetchGroups();
    } catch (err) {
      toast.error('Failed to import contacts');
    }
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
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20">
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
              <Button onClick={handleCreateGroup} className="w-full bg-indigo-600 h-12 font-black rounded-xl shadow-lg shadow-indigo-500/20">Create Group</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
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
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
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
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                  <Users className="h-5 w-5 text-indigo-500" />
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

          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/20">
            <ScrollArea className="flex-1 p-6">
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
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group/item">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center font-black text-[10px] text-indigo-600">
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
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-slate-900 dark:text-white">Import Contacts to {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="manual" onValueChange={(v) => setImportMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mb-6">
              <TabsTrigger value="manual" className="rounded-lg font-bold text-xs uppercase tracking-widest">Manual Paste</TabsTrigger>
              <TabsTrigger value="csv" className="rounded-lg font-bold text-xs uppercase tracking-widest">CSV Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl">
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
                  className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="csv" className="space-y-6">
              {csvHeaders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                  <Upload className="h-10 w-10 text-slate-300 mb-4" />
                  <p className="text-sm font-bold text-slate-500">Select a CSV file to continue</p>
                  <Input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    id="csv-upload" 
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" className="mt-4 rounded-xl font-bold" onClick={() => document.getElementById('csv-upload')?.click()}>
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number Column</Label>
                      <Select onValueChange={(v) => setMapping(prev => ({ ...prev, phone: v }))} value={mapping.phone}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name Column</Label>
                      <Select onValueChange={(v) => setMapping(prev => ({ ...prev, name: v }))} value={mapping.name}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="">No Name (Phone only)</SelectItem>
                          {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Preview (First 3 rows)</p>
                    <div className="space-y-2">
                      {csvData.slice(0, 3).map((row, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                          <div className="w-4 h-4 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded text-[10px]">{i+1}</div>
                          <span className="truncate">{row[csvHeaders.indexOf(mapping.phone)] || '---'}</span>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <span className="truncate text-slate-400">{mapping.name ? row[csvHeaders.indexOf(mapping.name)] : 'No Name'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button variant="ghost" className="text-xs font-bold text-rose-500" onClick={() => { setCsvHeaders([]); setCsvData([]); }}>
                    Remove File
                  </Button>
                </div>
              )}
            </TabsContent>

            <div className="flex gap-3 mt-8">
              <Button onClick={handleImportContacts} className="flex-1 bg-indigo-600 h-12 font-black rounded-xl shadow-lg shadow-indigo-500/20">
                <Upload className="mr-2 h-4 w-4" /> Start Import
              </Button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
