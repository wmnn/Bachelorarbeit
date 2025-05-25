import type { Rolle, User } from "@thesis/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface UserDialogProps {
    rollen: Rolle[],
    user: User
}
export function UserRolleSelect({ user, rollen }: UserDialogProps) {
    return <div>
        {/*{typeof user.rolle === "string" ? user.rolle : ''} */}
        <Select value={typeof user.rolle === "string" ? user.rolle : user?.rolle?.rolle ?? ''}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme"/>
            </SelectTrigger>
            <SelectContent>
                {
                    rollen.map((rolle) => {
                        return <SelectItem value={rolle.rolle}>{rolle.rolle}</SelectItem>                                                            
                    })
                }
            </SelectContent>
        </Select>     
    </div>
}