import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/schueler/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/schueler/"!</div>
}
