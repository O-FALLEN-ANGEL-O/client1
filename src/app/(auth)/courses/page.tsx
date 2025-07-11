"use client";

import React from 'react';
import { courses as mockCourses, type Course } from '@/lib/mock-data';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function CourseForm({ course, onSave, onOpenChange }: { course: Partial<Course> | null, onSave: (course: Course) => void, onOpenChange: (open: boolean) => void }) {
  const [formData, setFormData] = React.useState(course || {});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse = {
      id: formData.id || `crs_${Date.now()}`,
      ...formData
    } as Course;
    onSave(newCourse);
    onOpenChange(false);
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
      <Button type="submit">Save Course</Button>
    </form>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = React.useState(mockCourses);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Partial<Course> | null>(null);

  const handleSave = (course: Course) => {
    if (editingCourse?.id) {
      setCourses(prev => prev.map(c => c.id === course.id ? course : c));
    } else {
      setCourses(prev => [...prev, course]);
    }
  };

  const handleDelete = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };
  
  const columns: ColumnDef<Course>[] = [
    { header: 'Course Name', accessorKey: 'name' },
    { header: 'Course Code', accessorKey: 'code' },
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
                <DialogTrigger asChild onSelect={() => setEditingCourse(row)}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem onClick={() => handleDelete(row.id)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                    <DialogDescription>
                        Make changes to the course details here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <CourseForm course={row} onSave={handleSave} onOpenChange={() => {}}/>
            </DialogContent>
        </Dialog>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourse(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new course.
              </DialogDescription>
            </DialogHeader>
            <CourseForm course={editingCourse} onSave={handleSave} onOpenChange={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={courses} />
    </div>
  );
}
