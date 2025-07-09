import type { User } from "@thesis/auth";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import { useRollenStore } from "./RollenStore";
import { UserTableEntry } from "./UserTableEntry";
import { Description } from "../Description";
import { useEffect, useState } from "react";
import { Input } from "../Input";

interface UserTableProps {
    users: User[]
}

export const COLUMN_WIDTH = "w-[25%]"
export function UserTable({ users: initialUsers }: UserTableProps) {

    const rollen = useRollenStore((state) => state.rollen);
    const [users, setUsers] = useState(initialUsers);
    const [query, setQuery] = useState('');

    useEffect(() => {
      setUsers(initialUsers)
    }, [initialUsers])

    if (!rollen) return;

    return <>

    <div>
      <h2 className='mt-[80px]'>Nutzer</h2>
      <Description>
        Hier werden alle Nutzer aufgelistet. Du kannst einem Nutzer eine Rolle zuordnen, ihn sperren oder sein Konto löschen.
      </Description>
    </div>
    
    

    
    <Table className="mt-[20px] mb-8">
        <TableHeader>
          <TableRow className='flex justify-between pt-2'>
              <TableHead className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[20%]`}>Vorname</TableHead>
              <TableHead className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[20%]`}>Nachname</TableHead>
              <TableHead className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[20%]`}>Rolle</TableHead>
              <TableHead className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[40%]`}>
                <div className="flex gap-2 items-center justify-end">
                  <label>
                    Suche
                  </label>
                  <Input value={query} onChange={(e) => {
                    const newValue = e.target.value
                    setQuery(newValue)
                    setUsers(initialUsers.filter(user => `${user.vorname} ${user.nachname}`.includes(newValue)))
                  }}/>
                </div>
              </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            users.map(user => <UserTableEntry key={user.id} user={user} rollen={rollen} />)
          }
        
        </TableBody>
    </Table>
    </>
}