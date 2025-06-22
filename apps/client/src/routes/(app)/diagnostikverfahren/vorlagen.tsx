import { DiagnostikVorlagenList } from '@/components/diagnostik/DiagnostikVorlagenList'
import { DiagnostikenNav } from '@/layout/DiagnostikenNav'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/diagnostikverfahren/vorlagen')({
  component: RouteComponent,
})

function RouteComponent() {
    return <div className='w-full'>
        <DiagnostikenNav />

        <div className='w-full px-8'>
            <DiagnostikVorlagenList />
        </div>
    </div>
}
