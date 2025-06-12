import { createFileRoute, useRouter } from '@tanstack/react-router'
import { MoveLeft } from 'lucide-react'

export const Route = createFileRoute(
  '/(app)/ganztagsangebote/$ganztagsangebotId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  
  return <div className='w-full'>

    <div className='flex justify-start items-center px-8'>
            <div className='flex gap-4 items-center pt-8'>
                <button onClick={() => router.history.back()}>
                    <MoveLeft />
                </button>
                <h1>title</h1>
              
            </div>
        </div>
  </div>
}
