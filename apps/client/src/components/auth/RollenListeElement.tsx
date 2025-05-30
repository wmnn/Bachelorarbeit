import { updateRole, type Rolle } from "@thesis/auth";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { BerechtigungenSelect } from "./BerechtigungenSelect";
import { useRollenStore } from "./RollenStore";
import { useState } from "react";
import { ErrorDialog } from "../dialog/MessageDialog";
import { DeleteRoleDialog } from "./DeleteRoleDialog";

export function RollenListeElement({ rolle }: { rolle: Rolle }) {

    const setRollen = useRollenStore((state) => state.setRollen);
    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false);
    const [responseMessage, setResponseMessage] = useState('')
    const rollenBezeichnung = rolle.rolle
    
    async function onPermissionChange(neueRolle: Rolle) {
        const res = await updateRole(rollenBezeichnung, neueRolle);

        if (res.success) {
            setRollen(prev => {
                if (!prev) return []
                const filtered = prev?.filter(role => role.rolle !== rollenBezeichnung)
                return [...filtered, neueRolle].sort((a, b) => {
                    if (a.rolle < b.rolle) return -1;
                    if (a.rolle > b.rolle) return 1; 
                    return 0;
                });
            })
        }
    }

    return <AccordionItem value={rollenBezeichnung}>
        {(isDeleteDialogShown) && <DeleteRoleDialog 
            rolle={rollenBezeichnung}
            closeDialog={() => {
                setIsDeleteDialogShown(false);
            }} 
            setResponseMsg={setResponseMessage}
            setIsLoading={() => {}}
        />}
        {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}
        <AccordionTrigger handleDeleteIcon={() => {
            setIsDeleteDialogShown(true);
        }}>{rollenBezeichnung}</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 xl:pl-[600px]">
            <BerechtigungenSelect rolle={rolle} setRolle={onPermissionChange}/>
        </AccordionContent>
    </AccordionItem>
}