import { userHasPermission } from "@/components/auth/userHasPermission"
import { userContext } from "@/context/UserContext"
import { Berechtigung } from "@thesis/rollen"
import { use } from "react"

export const SchuelerListHeader = () => {
    const { user } = use(userContext)
    return <div className="hidden md:flex justify-between mb-2">
        <h2 className="ml-8">Vor- und Nachname</h2>
        <div className="flex">
            {
                userHasPermission(user, Berechtigung.AnwesenheitsstatusRead, true ) && <>
                <h2 className="mr-[20px] xl:mr-[55px]">geprüft</h2>
                <h2 className="mr-[58px] xl:mr-[96px]">Status</h2></>
            }
            
        </div>
    </div>
}