'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'date'
  placeholder?: string
  options?: string[]
  required?: boolean
  min?: number
  step?: string
}

interface DataFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: FormField[]
  onSubmit: (data: Record<string, string>) => void
  isLoading?: boolean
}

export default function DataFormDialog({
  open,
  onOpenChange,
  title,
  fields,
  onSubmit,
  isLoading = false,
}: DataFormDialogProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} مطلوب`
      }
      if (field.type === 'number' && formData[field.name]) {
        const num = parseFloat(formData[field.name])
        if (isNaN(num)) {
          newErrors[field.name] = `${field.label} يجب أن يكون رقماً`
        }
        if (field.min !== undefined && num < field.min) {
          newErrors[field.name] = `${field.label} يجب أن يكون ${field.min} على الأقل`
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData)
      setFormData({})
      setErrors({})
    }
  }

  const handleClose = () => {
    setFormData({})
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>أدخل البيانات المطلوبة أدناه</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {fields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-400 mr-1">*</span>}
              </Label>
              {field.type === 'select' && field.options ? (
                <Select
                  value={formData[field.name] || ''}
                  onValueChange={value => handleChange(field.name, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.placeholder || 'اختر...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(option => (
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
                  onChange={e => handleChange(field.name, e.target.value)}
                  min={field.min}
                  step={field.step}
                  className="bg-muted/30 border-border/50"
                />
              )}
              {errors[field.name] && (
                <p className="text-xs text-red-400">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-border/50"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-teal-400 hover:bg-teal-500 text-white"
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
