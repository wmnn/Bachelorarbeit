import { createFileRoute } from '@tanstack/react-router'

function RouteComponent() {
  return <div className='flex w-full flex-col p-2 xl:p-8'>
    <h1>Hilfe</h1>
  </div>
}

export const Route = createFileRoute('/(app)/hilfe/')({
  component: RouteComponent,
})
