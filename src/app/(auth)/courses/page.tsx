"use client";

import React, { useEffect, useState } from 'react';
import { type Course } from '@/lib/mock-data';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';

function CourseForm({ course, onSave, onCancel }: { course: Partial<Course> | null, onSave: (course: Partial<Course>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState(course || {});
  
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
        <Label htmlFor="name">Course Name</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="code">Course Code</Label>
        <Input id="code" name="code" value={formData.code || ''} onChange={handleChange} required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Course</Button>
      </div>
    </form>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [supabase] = useState(() => createClient());
  const { toast } = useToast();

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('courses').select('*').order('name');
    if (error) {
      toast({ title: "Error fetching courses", description: error.message, variant: "destructive" });
    } else {
      setCourses(data as Course[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSave = async (course: Partial<Course>) => {
    const isEditing = !!course.id;
    const courseData = {
        name: course.name,
        code: course.code,
    };

    let error;
    if (isEditing) {
        const { error: updateError } = await supabase.from('courses').update(courseData).eq('id', course.id!);
        error = updateError;
    } else {
        const { error: insertError } = await supabase.from('courses').insert({...courseData, id: `crs_${Date.now()}`});
        error = insertError;
    }
    
    if (error) {
      toast({ title: `Error saving course`, description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Course ${isEditing ? 'updated' : 'created'} successfully` });
      await fetchCourses();
      setIsDialogOpen(false);
      setEditingCourse(null);
    }
  };
  
  const handleDelete = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) {
        toast({ title: "Error deleting course", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Course deleted successfully" });
        await fetchCourses();
    }
  };

  const handleOpenDialog = (course: Partial<Course> | null = null) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Course>[] = [
    { header: 'Course Name', accessorKey: 'name' },
    { header: 'Course Code', accessorKey: 'code' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const course = row.original;
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
                <DropdownMenuItem onClick={() => handleOpenDialog(course)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(course.id)}>Delete</DropdownMenuItem>
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
        <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
        <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Course
        </Button>
      </div>
      <DataTable columns={columns} data={courses} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCourse?.id ? 'Edit Course' : 'Add New Course'}</DialogTitle>
              <DialogDescription>
                {editingCourse?.id ? 'Make changes to the course details here.' : 'Fill in the details to create a new course.'} Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <CourseForm 
                course={editingCourse} 
                onSave={handleSave} 
                onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingCourse(null);
                }} 
            />
          </DialogContent>
        </Dialog>
    </div>
  );
}
