import { DiagnostikList } from '@/components/diagnostik/DiagnostikList'
import { DiagnostikenNav } from '@/layout/DiagnostikenNav'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/diagnostikverfahren/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='w-full'>
    <DiagnostikenNav />
    <div className='w-full px-8'>
      <DiagnostikList />
    </div>
  </div>
}
