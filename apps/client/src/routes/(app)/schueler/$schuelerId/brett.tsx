import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/schueler/$schuelerId/brett')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/schueler/$schuelerId/brett"!</div>
}
