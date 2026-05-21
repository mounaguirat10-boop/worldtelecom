'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-2xl bg-muted/30 mb-4">
        {icon || <Plus className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-teal-400 hover:bg-teal-500 text-white"
        >
          <Plus className="h-4 w-4 ml-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
