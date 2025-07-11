"use client";

import React, { useEffect, useState } from 'react';
import { type User } from '@/lib/mock-data';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/providers/auth-provider';

function UserForm({ user, onSave, onCancel }: { user: Partial<User> | null, onSave: (user: Partial<User>) => void, onCancel: () => void }) {
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
          <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} required />
        </div>
       )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save User</Button>
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
    const isEditing = !!user.id;
    
    if (isEditing) {
      // Update user profile in 'users' table
      const { error: profileError } = await supabase.from('users').update({ name: user.name, role: user.role }).eq('id', user.id!);
      if (profileError) {
        toast({ title: `Error updating user`, description: profileError.message, variant: "destructive" });
      } else {
        toast({ title: `User updated successfully` });
        await fetchUsers();
        setIsDialogOpen(false);
        setEditingUser(null);
      }
    } else {
       // Create a new user
      if (!user.email || !user.password) {
        toast({ title: "Error", description: "Email and password are required for new users.", variant: "destructive" });
        return;
      }
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { name: user.name }
      });

      if (authError) {
          toast({ title: `Error creating user`, description: authError.message, variant: "destructive" });
      } else if (authData.user) {
          const { error: profileError } = await supabase.from('users').insert({
              id: authData.user.id,
              name: user.name,
              email: user.email,
              role: user.role,
          });
          if (profileError) {
              toast({ title: `Error creating user profile`, description: profileError.message, variant: "destructive" });
          } else {
              toast({ title: "User created successfully" });
              await fetchUsers();
              setIsDialogOpen(false);
              setEditingUser(null);
          }
      }
    }
  };
  
  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action is irreversible.")) return;

    // We need to use an edge function or server-side call to delete from auth.users
    // For now, we'll just delete from the public.users table.
    // A more robust solution would involve an RPC call to a secure function.
    const { error } = await supabase.from('users').delete().eq('id', userId);
    
    if (error) {
        toast({ title: "Error deleting user", description: "Could not delete user profile. Deleting from Auth requires server-side logic.", variant: "destructive" });
    } else {
        toast({ title: "User profile deleted.", description: "Full deletion from Auth requires a server function." });
        await fetchUsers();
    }
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Button onClick={() => handleOpenDialog()}>
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
                    setIsDialogOpen(false);
                    setEditingUser(null);
                }}
            />
          </DialogContent>
        </Dialog>
    </div>
  );
}
