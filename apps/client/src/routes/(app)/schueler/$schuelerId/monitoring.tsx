import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/schueler/$schuelerId/monitoring')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/schueler/$schuelerId/monitoring"!</div>
}
