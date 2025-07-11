"use client";

import React from 'react';
import { schools as mockSchools, type School } from '@/lib/mock-data';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SchoolForm({ school, onSave, onOpenChange }: { school: Partial<School> | null, onSave: (school: School) => void, onOpenChange: (open: boolean) => void }) {
  const [formData, setFormData] = React.useState(school || {});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchool = {
      id: formData.id || `sch_${Date.now()}`,
      ...formData
    } as School;
    onSave(newSchool);
    onOpenChange(false);
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
      <Button type="submit">Save School</Button>
    </form>
  );
}

export default function SchoolsPage() {
  const [schools, setSchools] = React.useState(mockSchools);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSchool, setEditingSchool] = React.useState<Partial<School> | null>(null);

  const handleSave = (school: School) => {
    if (editingSchool?.id) {
      setSchools(prev => prev.map(s => s.id === school.id ? school : s));
    } else {
      setSchools(prev => [...prev, school]);
    }
  };

  const handleDelete = (schoolId: string) => {
    setSchools(prev => prev.filter(s => s.id !== schoolId));
  };
  
  const columns: ColumnDef<School>[] = [
    { header: 'School Name', accessorKey: 'name' },
    { header: 'City', accessorKey: 'city' },
    {
      header: 'Actions',
      cell: (row) => (
        <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                 <DialogTrigger asChild onSelect={() => setEditingSchool(row)}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem onClick={() => handleDelete(row.id)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit School</DialogTitle>
                    <DialogDescription>
                        Make changes to the school details here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <SchoolForm school={row} onSave={handleSave} onOpenChange={() => {}}/>
            </DialogContent>
        </Dialog>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">School Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSchool(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new school.
              </DialogDescription>
            </DialogHeader>
            <SchoolForm school={editingSchool} onSave={handleSave} onOpenChange={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={schools} />
    </div>
  );
}
