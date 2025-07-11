"use client";

import React from 'react';
import { users as mockUsers, type User } from '@/lib/mock-data';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function UserForm({ user, onSave, onOpenChange }: { user: Partial<User> | null, onSave: (user: User) => void, onOpenChange: (open: boolean) => void }) {
  const [formData, setFormData] = React.useState(user || {});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: formData.id || `usr_${Date.now()}`,
      ...formData
    } as User;
    onSave(newUser);
    onOpenChange(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: 'Admin' | 'Staff') => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select onValueChange={handleSelectChange} value={formData.role || ''} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Save User</Button>
    </form>
  );
}

export default function UsersPage() {
  const [users, setUsers] = React.useState(mockUsers.filter(u => u.role !== 'Admin')); // Don't show admin in list
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<Partial<User> | null>(null);

  const handleSave = (user: User) => {
    if (editingUser?.id) {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    } else {
      setUsers(prev => [...prev, user]);
    }
  };

  const handleDelete = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };
  
  const columns: ColumnDef<User>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Role', accessorKey: 'role' },
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
                <DialogTrigger asChild onSelect={() => setEditingUser(row)}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem onClick={() => handleDelete(row.id)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Make changes to the user profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <UserForm user={row} onSave={handleSave} onOpenChange={() => {}}/>
            </DialogContent>
        </Dialog>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUser(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new user.
              </DialogDescription>
            </DialogHeader>
            <UserForm user={editingUser} onSave={handleSave} onOpenChange={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
