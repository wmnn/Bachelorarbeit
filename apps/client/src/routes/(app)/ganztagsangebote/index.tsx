import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/ganztagsangebote/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/ganztagsangebote/"!</div>
}
