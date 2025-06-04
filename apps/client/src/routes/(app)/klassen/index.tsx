import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/klassen/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/klassen/"!</div>
}
