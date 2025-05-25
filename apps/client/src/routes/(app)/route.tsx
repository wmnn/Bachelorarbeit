import { AppLayout } from '@/layout/AppLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)')({
  component: AppLayout,
})