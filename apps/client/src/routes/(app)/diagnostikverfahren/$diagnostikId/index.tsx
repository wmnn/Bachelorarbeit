import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(app)/diagnostikverfahren/$diagnostikId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/diagnostikverfahren/$diagnostikId/"!</div>
}
