import { type Rolle, type User } from "@thesis/auth";
import { TableCell, TableRow } from "../ui/table";
import { UserRolleSelect } from "./UserRolleSelect";
import { useState } from "react";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { COLUMN_WIDTH } from "./UserTable";
import { ErrorDialog } from "../dialog/MessageDialog";
import { LoadingSpinner } from "../LoadingSpinner";
import { LockUserDialog } from "./LockUserDialog";

export function UserTableEntry({ user, rollen}: { user: User, rollen: Rolle[]}) {

    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false);
    const [isLockUserDialogShown, setIsLockUserDialogShown] = useState(false);
    const [responseMessage, setResponseMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false);

    return <TableRow className='flex justify-between items-center relative' key={user.email}>
            { isLoading && <LoadingSpinner isLoading={isLoading} /> }
            {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}
            {(isDeleteDialogShown) && <DeleteUserDialog 
                userId={user.id ?? -1} 
                closeDialog={() => {
                    setIsDeleteDialogShown(false);
                }} 
                setDeleteMsg={setResponseMessage}
                setIsLoading={setIsLoading}
            />}
            {(isLockUserDialogShown) && <LockUserDialog 
                user={user} 
                closeDialog={() => {
                    setIsLockUserDialogShown(false);
                }} 
                setDeleteMsg={setResponseMessage}
                setIsLoading={setIsLoading}
            />}
            <TableCell className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[20%]`}>{user.vorname}</TableCell>
            <TableCell className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[20%]`}>{user.nachname}</TableCell>
            <TableCell className={`basis-0 grow w-[${COLUMN_WIDTH}] xl:w-[20%]`}>
                <UserRolleSelect user={user} rollen={rollen} setIsLoading={setIsLoading} />
            </TableCell>

            <TableCell className={`basis-0 grow w-[${COLUMN_WIDTH}] text-right xl:w-[40%] flex justify-end gap-4 xl:gap-8`}>

            <button onClick={async () => {
                setIsLockUserDialogShown(true);
            }}>
                {
                    user.isLocked == true ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>

                    : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>

                }
            </button>

            <button onClick={async () => {
                setIsDeleteDialogShown(true);
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </button>
            
            </TableCell>
    </TableRow>
}