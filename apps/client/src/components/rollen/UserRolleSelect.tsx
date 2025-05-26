import type { Rolle, User } from "@thesis/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface UserDialogProps {
    rollen: Rolle[],
    user: User
}
export function UserRolleSelect({ user, rollen }: UserDialogProps) {
    return <div className="grow">
        {/*{typeof user.rolle === "string" ? user.rolle : ''} */}
        <Select value={typeof user.rolle === "string" ? user.rolle : user?.rolle?.rolle ?? ''}>
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