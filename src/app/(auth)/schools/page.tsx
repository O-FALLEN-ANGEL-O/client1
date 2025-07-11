"use client";

import React, { useEffect, useState } from 'react';
import { type School } from '@/lib/mock-data';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';

function SchoolForm({ school, onSave, onCancel }: { school: Partial<School> | null, onSave: (school: Partial<School>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState(school || {});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">School Name</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" value={formData.city || ''} onChange={handleChange} required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save School</Button>
      </div>
    </form>
  );
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<Partial<School> | null>(null);
  const [supabase] = useState(() => createClient());
  const { toast } = useToast();

  const fetchSchools = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('schools').select('*').order('name');
    if (error) {
      toast({ title: "Error fetching schools", description: error.message, variant: "destructive" });
    } else {
      setSchools(data as School[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSave = async (school: Partial<School>) => {
    const isEditing = !!school.id;
    const schoolData = {
        name: school.name,
        city: school.city,
    };

    let error;
    if (isEditing) {
        const { error: updateError } = await supabase.from('schools').update(schoolData).eq('id', school.id!);
        error = updateError;
    } else {
        const { error: insertError } = await supabase.from('schools').insert(schoolData);
        error = insertError;
    }
    
    if (error) {
      toast({ title: `Error saving school`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: `School ${isEditing ? 'updated' : 'created'} successfully` });
      await fetchSchools();
      setIsDialogOpen(false);
      setEditingSchool(null);
    }
  };
  
  const handleDelete = async (schoolId: string) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;

    const { error } = await supabase.from('schools').delete().eq('id', schoolId);
    if (error) {
        toast({ title: "Error deleting school", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "School deleted successfully" });
        await fetchSchools();
    }
  };

  const handleOpenDialog = (school: Partial<School> | null = null) => {
    setEditingSchool(school);
    setIsDialogOpen(true);
  };
  
  const columns: ColumnDef<School>[] = [
    { header: 'School Name', accessorKey: 'name' },
    { header: 'City', accessorKey: 'city' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const school = row.original;
        return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                 <DropdownMenuItem onClick={() => handleOpenDialog(school)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(school.id)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">School Management</h1>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add School
        </Button>
      </div>
      <DataTable columns={columns} data={schools} />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSchool?.id ? 'Edit School' : 'Add New School'}</DialogTitle>
              <DialogDescription>
                {editingSchool?.id ? 'Make changes to the school details here.' : 'Fill in the details to create a new school.'} Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <SchoolForm 
                school={editingSchool} 
                onSave={handleSave} 
                onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingSchool(null);
                }} 
            />
          </DialogContent>
        </Dialog>
    </div>
  );
}
