import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/reset-password/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/reset-password/"!</div>
}
