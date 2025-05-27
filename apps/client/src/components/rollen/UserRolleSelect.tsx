import { updateUser, type Rolle, type User } from "@thesis/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { ErrorDialog } from "../dialog/MessageDialog"

interface UserDialogProps {
    rollen: Rolle[],
    user: User,
    setIsLoading: (boolean: boolean) => void
}
export function UserRolleSelect({ user, rollen, setIsLoading }: UserDialogProps) {

    const queryClient = useQueryClient()
    const [isDialogShown, setIsDialogShown] = useState(false);
    const [msg, setMsg] = useState('')

    return <div className="grow">

        {
            isDialogShown && <ErrorDialog message={msg} closeDialog={() => setIsDialogShown(false)}/>
        }
        <Select 
            value={typeof user.rolle === "string" ? user.rolle : user?.rolle?.rolle ?? ''}
            onValueChange={async (neueRollenbezeichnung) => {
                setIsLoading(true);
                await new Promise(resolve => setTimeout(() => resolve(null), 500))
                const res = await updateUser({ id: user.id, rolle: neueRollenbezeichnung});    
                queryClient.invalidateQueries({ queryKey: ['users'] })
                setIsDialogShown(true);
                setIsLoading(false);
                setMsg(res.message)
            }}
        >
            <SelectTrigger className="xl:w-[180px] w-min">
                <SelectValue placeholder="Theme"/>
            </SelectTrigger>
            <SelectContent>
                {
                    rollen.map((rolle) => {
                        return <SelectItem key={user.email + rolle.rolle} value={rolle.rolle == '' ? 'FEHLER' : rolle.rolle}>{rolle.rolle}</SelectItem>                                                            
                    })
                }
            </SelectContent>
        </Select>     
    </div>
}