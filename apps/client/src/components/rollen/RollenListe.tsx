import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ButtonLight } from "../ButtonLight";
import { BerechtigungenSelect } from "./BerechtigungenSelect";
import { useState } from "react";
import { RolleHinzufügenDialog } from "./RolleHinzufügenDialog";
import { useRollenStore } from "./RollenStore";

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
                rollen?.map((rolle) => <AccordionItem value={rolle.rolle}>
                    <AccordionTrigger>{rolle.rolle}</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2 xl:pl-[600px]">
                        <BerechtigungenSelect rolle={rolle} />
                    </AccordionContent>
                </AccordionItem>
                )
            }
        </Accordion>
        <ButtonLight className="mt-8 shadow-xs" onClick={() => {
            setIsAddRoleDialogShown(true)
        }}>
            + Rolle hinzufügen
        </ButtonLight>
    </>
}