import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/klassen/$klassenId/brett')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/klassen/$klassenId/brett"!</div>
}
