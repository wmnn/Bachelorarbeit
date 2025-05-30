import { Accordion } from "../ui/accordion";
import { ButtonLight } from "../ButtonLight";
import { useState } from "react";
import { RolleHinzufügenDialog } from "./RolleHinzufügenDialog";
import { useRollenStore } from "./RollenStore";
import { RollenListeElement } from "./RollenListeElement";
import { Description } from "../Description";

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

        <h2 className='mt-[24px]'>Rollen</h2>
        <Description>
            Alle verfügbaren Rollen werden hier aufgelistet. Klicke auf eine Rolle, um die zugehörigen Rechte anzuzeigen und zu bearbeiten.
        </Description>
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