
"use client"

import * as React from 'react'
import { type School, type Course, type Payment } from '@/lib/mock-data'
import { DataTable, type ColumnDef } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon, FileDown, Loader2 } from 'lucide-react'
import { format, type DateRange } from 'date-fns'
import { cn, exportToCsv } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/hooks/use-toast'

const columns: ColumnDef<Payment>[] = [
  { header: 'Student ID', accessorKey: 'studentId' },
  { header: 'Student Name', accessorKey: 'studentName' },
  { header: 'Course', accessorKey: 'course' },
  { header: 'School', accessorKey: 'school' },
  {
    header: 'Amount',
    cell: ({row}) => `$${row.original.amount.toFixed(2)}`,
  },
  {
    header: 'Payment Type',
    accessorKey: 'paymentType',
    cell: ({row}) => {
        let variant: 'default' | 'secondary' | 'outline' = 'secondary'
        if (row.original.paymentType === 'Credit Card') variant = 'default'
        if (row.original.paymentType === 'Bank Transfer') variant = 'outline'
        return <Badge variant={variant}>{row.original.paymentType}</Badge>
    }
  },
  {
    header: 'Date',
    accessorKey: 'date',
    cell: ({row}) => format(new Date(row.original.date), 'PPP'),
  },
]

export default function DashboardPage() {
  const [data, setData] = React.useState<Payment[]>([])
  const [schools, setSchools] = React.useState<School[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [searchTerm, setSearchTerm] = React.useState('')
  const [date, setDate] = React.useState<DateRange | undefined>()
  const [paymentType, setPaymentType] = React.useState('all')
  const [schoolName, setSchoolName] = React.useState('all')
  const [courseName, setCourseName] = React.useState('all')
  
  const [supabase] = React.useState(() => createClient());
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [paymentsRes, schoolsRes, coursesRes] = await Promise.all([
        supabase.from('payments').select('*'),
        supabase.from('schools').select('*'),
        supabase.from('courses').select('*'),
    ]);

    if (paymentsRes.error) toast({ title: "Error fetching payments", description: paymentsRes.error.message, variant: 'destructive' });
    else setData(paymentsRes.data as Payment[]);

    if (schoolsRes.error) toast({ title: "Error fetching schools", description: schoolsRes.error.message, variant: 'destructive' });
    else setSchools(schoolsRes.data as School[]);

    if (coursesRes.error) toast({ title: "Error fetching courses", description: coursesRes.error.message, variant: 'destructive' });
    else setCourses(coursesRes.data as Course[]);

    setLoading(false);
  }

  React.useEffect(() => {
    fetchData();
  }, []);

  const filteredData = React.useMemo(() => {
    return data.filter(payment => {
      const lowerSearchTerm = searchTerm.toLowerCase()
      const matchesSearch = searchTerm ?
        payment.studentName.toLowerCase().includes(lowerSearchTerm) ||
        payment.studentId.toLowerCase().includes(lowerSearchTerm) : true

      const matchesDate = date?.from && date?.to ?
        new Date(payment.date) >= date.from && new Date(payment.date) <= date.to : true

      const matchesPaymentType = paymentType && paymentType !== 'all' ? payment.paymentType === paymentType : true
      const matchesSchool = schoolName && schoolName !== 'all' ? payment.school === schoolName : true
      const matchesCourse = courseName && courseName !== 'all' ? payment.course === courseName : true

      return matchesSearch && matchesDate && matchesPaymentType && matchesSchool && matchesCourse
    })
  }, [data, searchTerm, date, paymentType, schoolName, courseName])

  const handleExport = () => {
    const paymentReportData = filteredData.map(p => ({
      'Student ID': p.studentId,
      'Student Name': p.studentName,
      'Course': p.course,
      'School': p.school,
      'Amount': p.amount,
      'Payment Type': p.paymentType,
      'Date': format(new Date(p.date), 'yyyy-MM-dd')
    }));

    exportToCsv('Payment_Report.csv', paymentReportData)
    
    const powerBiData = filteredData.map(p => ({
        studentId: p.studentId,
        studentName: p.studentName,
        course: p.course,
        school: p.school,
        amount: p.amount,
        paymentType: p.paymentType,
        date: format(new Date(p.date), 'yyyy-MM-dd')
      }));
    
    exportToCsv('Power_BI_Data.csv', powerBiData)
  }

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
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Input
          placeholder="Filter by Student ID/Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="lg:col-span-2"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        <Select value={paymentType} onValueChange={setPaymentType}>
          <SelectTrigger><SelectValue placeholder="Payment Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
            <Select value={schoolName} onValueChange={setSchoolName}>
                <SelectTrigger><SelectValue placeholder="School" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={courseName} onValueChange={setCourseName}>
                <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  )
}
