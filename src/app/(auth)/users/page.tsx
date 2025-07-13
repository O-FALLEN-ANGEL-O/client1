"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { type User } from '@/lib/mock-data';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/providers/auth-provider';
import { addUser, updateUser, deleteUser } from './actions';

function UserForm({ user, onSave, onCancel, isPending }: { user: Partial<User> | null, onSave: (user: Partial<User>) => void, onCancel: () => void, isPending: boolean }) {
  const [formData, setFormData] = useState(user || { role: 'Staff' });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
        <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required disabled={!!user?.id} />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select onValueChange={handleSelectChange} value={formData.role || 'Staff'} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>
       {!user?.id && (
         <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} required minLength={6} />
        </div>
       )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save User
        </Button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [supabase] = useState(() => createClient());
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isPending, startTransition] = useTransition();

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      toast({ title: "Error fetching users", description: error.message, variant: "destructive" });
    } else {
      setUsers(data.filter(u => u.id !== currentUser?.id) as User[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if(currentUser) {
        fetchUsers();
    }
  }, [currentUser]);

  const handleSave = async (user: Partial<User>) => {
    startTransition(async () => {
        const result = user.id ? await updateUser(user) : await addUser(user);
        
        if (result.error) {
            toast({ title: `Error: ${result.error}`, variant: "destructive" });
        } else {
            toast({ title: `Success: ${result.success}` });
            await fetchUsers();
            setIsDialogOpen(false);
            setEditingUser(null);
        }
    });
  };
  
  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action is irreversible and will delete the user's auth record and profile.")) return;
    
    startTransition(async () => {
        const result = await deleteUser(userId);
        if (result.error) {
            toast({ title: "Error deleting user", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "User deleted successfully" });
            await fetchUsers();
        }
    });
  };

  const handleOpenDialog = (user: Partial<User> | null = null) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };
  
  const columns: ColumnDef<User>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Role', accessorKey: 'role' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
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
                <DropdownMenuItem onClick={() => handleOpenDialog(user)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(user.id)}>Delete</DropdownMenuItem>
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
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
        </Button>
      </div>
      <DataTable columns={columns} data={users} />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser?.id ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingUser?.id ? "Make changes to the user's profile here." : 'Fill in the details to create a new user.'} Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <UserForm 
                user={editingUser} 
                onSave={handleSave} 
                onCancel={() => {
                    if (isPending) return;
                    setIsDialogOpen(false);
                    setEditingUser(null);
                }}
                isPending={isPending}
            />
          </DialogContent>
        </Dialog>
    </div>
  );
}
