import { DiagnostikenNav } from '@/layout/DiagnostikenNav'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/diagnostikverfahren/shared')({
  component: RouteComponent,
})

function RouteComponent() {
    return <div className='w-full'>
        <DiagnostikenNav />
    </div>
}
