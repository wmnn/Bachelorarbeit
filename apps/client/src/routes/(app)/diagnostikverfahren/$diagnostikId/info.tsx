import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(app)/diagnostikverfahren/$diagnostikId/info',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/diagnostikverfahren/$diagnostikId/info"!</div>
}
