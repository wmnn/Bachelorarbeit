import { type User } from "@thesis/auth";
import { TableCell, TableRow } from "../ui/table";
import { UserRolleSelect } from "./UserRolleSelect";
import { useState } from "react";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { COLUMN_WIDTH } from "./UserTable";
import { ErrorDialog } from "../dialog/MessageDialog";
import { LoadingSpinner } from "../LoadingSpinner";
import { LockUserDialog } from "./LockUserDialog";
import { DeleteIcon } from "../icons/DeleteIcon";
import { LockIcon } from "../icons/LockIcon";
import { LockIconOpen } from "../icons/LockIconOpen";
import type { Rolle } from "@thesis/rollen";

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
                    user.isLocked == true ? <LockIcon /> : <LockIconOpen />
                }
            </button>

            <button onClick={async () => {
                setIsDeleteDialogShown(true);
            }}>
                <DeleteIcon />
            </button>
            
            </TableCell>
    </TableRow>
}