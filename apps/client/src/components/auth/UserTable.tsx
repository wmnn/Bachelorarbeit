import type { User } from "@thesis/auth";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import { useRollenStore } from "./RollenStore";
import { UserTableEntry } from "./UserTableEntry";

interface UserTableProps {
    users: User[]
}

export const COLUMN_WIDTH = "w-[25%]"
export function UserTable({ users }: UserTableProps) {

    const rollen = useRollenStore((state) => state.rollen);

    if (!rollen) return;

    return <>

    <h2 className='mt-[80px] mb-[20px]'>Nutzer</h2>
    <Table>
        <TableHeader>
          <TableRow className='flex justify-between'>
              <TableHead className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[20%]`}>Vorname</TableHead>
              <TableHead className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[20%]`}>Nachname</TableHead>
              <TableHead className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[20%]`}>Rolle</TableHead>
              <TableHead className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[40%]`}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            users.map(user => <UserTableEntry user={user} rollen={rollen} />)
          }
        
        </TableBody>
    </Table>
    </>
}