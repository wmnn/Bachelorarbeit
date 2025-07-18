import { updateRole, type Rolle } from "@thesis/rollen";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { BerechtigungenSelect } from "./BerechtigungenSelect";
import { useRollenStore } from "./RollenStore";
import { useState } from "react";
import { ErrorDialog } from "../dialog/MessageDialog";
import { DeleteRoleDialog } from "./DeleteRoleDialog";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";

export function RollenListeElement({ rolle }: { rolle: Rolle }) {

    const setRollen = useRollenStore((state) => state.setRollen);
    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false);
    const [responseMessage, setResponseMessage] = useState('')
    const rollenBezeichnung = rolle.rolle

    const [isEditDialogShown, setIsEditDialogShown] = useState(false);
    const [tmpRolle, setTmpRolle] = useState<undefined | Rolle>(undefined);
    
    async function onPermissionChange() {

        const neueRolle = tmpRolle
        if (!neueRolle) return;
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
        alert(res.message)
        setIsEditDialogShown(false)
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
        {(isEditDialogShown) && <RiskyActionDialog 
            closeDialog={() => {
                setIsEditDialogShown(false);
            }} 
            message="Willst du die Rolle wirklich ändern?"
            onSubmit={() => onPermissionChange()}
        />}
        {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}
        <AccordionTrigger handleDeleteIcon={() => {
            setIsDeleteDialogShown(true);
        }}>{rollenBezeichnung}</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 xl:pl-[600px]">
            <BerechtigungenSelect rolle={rolle} setRolle={(rolle) => {
                setTmpRolle(rolle)
                setIsEditDialogShown(true)
            }}/>
        </AccordionContent>
    </AccordionItem>
}