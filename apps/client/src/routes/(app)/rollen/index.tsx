import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/rollen/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='min-h-full py-8'>
    <h1>Rollenmanagement</h1>

    <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
        <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
        <TableRow>
            <TableCell className="font-medium">INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
        </TableBody>
    </Table>
  </div>
}
