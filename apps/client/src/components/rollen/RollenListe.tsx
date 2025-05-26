import { Accordion } from "../ui/accordion";
import { ButtonLight } from "../ButtonLight";
import { useState } from "react";
import { RolleHinzufügenDialog } from "./RolleHinzufügenDialog";
import { useRollenStore } from "./RollenStore";
import { RollenListeElement } from "./RollenListeElement";

export function RollenListe() {

    const rollen = useRollenStore((state) => state.rollen);
    const [isAddRoleDialogShown, setIsAddRoleDialogShown] = useState(false);

    if (!rollen) return;
    return <>

        {
            isAddRoleDialogShown && <RolleHinzufügenDialog closeDialog={() => {
                setIsAddRoleDialogShown(false)
            }}/>
        }

        <Accordion type="single" collapsible>
            {
                rollen?.map((rolle) => <RollenListeElement key={rolle.rolle} rolle={rolle}/> )
            }
        </Accordion>
        <ButtonLight className="mt-8 shadow-xs" onClick={() => {
            setIsAddRoleDialogShown(true)
        }}>
            + Rolle hinzufügen
        </ButtonLight>
    </>
}