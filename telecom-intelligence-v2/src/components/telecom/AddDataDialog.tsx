'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'date'
  placeholder?: string
  options?: string[]
}

interface AddDataDialogProps {
  title: string
  fields: FieldDef[]
  onSubmit: (data: Record<string, string>) => void | Promise<void>
  triggerLabel?: string
}

export default function AddDataDialog({
  title,
  fields,
  onSubmit,
  triggerLabel = 'إضافة',
}: AddDataDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    // Basic validation: ensure all fields have values
    const missingFields = fields.filter(
      (field) => !formData[field.name]?.trim()
    )
    if (missingFields.length > 0) {
      toast.error(`يرجى ملء جميع الحقول المطلوبة`)
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      toast.success('تمت الإضافة بنجاح')
      setFormData({})
      setOpen(false)
    } catch {
      toast.error('حدث خطأ أثناء الإضافة')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormData({})
      setLoading(false)
    }
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-teal-400 hover:bg-teal-500 text-white">
          <Plus className="h-4 w-4 ml-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>أدخل البيانات المطلوبة أدناه</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </Label>
              {field.type === 'select' && field.options ? (
                <Select
                  value={formData[field.name] || ''}
                  onValueChange={(value) => handleChange(field.name, value)}
                >
                  <SelectTrigger className="w-full bg-muted/30 border-border/50">
                    <SelectValue placeholder={field.placeholder || 'اختر...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type === 'number' ? 'number' : field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="bg-muted/30 border-border/50"
                  dir={field.type === 'number' ? 'ltr' : undefined}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={loading}
              className="border-border/50"
            >
              إلغاء
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-teal-400 hover:bg-teal-500 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 ml-2" />
                {triggerLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
