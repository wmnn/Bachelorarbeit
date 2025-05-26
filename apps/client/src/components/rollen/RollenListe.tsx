import { type Rolle } from "@thesis/auth";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ButtonLight } from "../ButtonLight";
import { BerechtigungenSelect } from "./BerechtigungenSelect";
import { useState } from "react";
import { RolleHinzufügenDialog } from "./RolleHinzufügenDialog";
import { DialogWithButtons } from "../DialogWithButtons";

interface RollenProps {
    rollen: Rolle[],
}
export function RollenListe({ rollen }: RollenProps) {

    const [isAddRoleDialogShown, setIsAddRoleDialogShown] = useState(false);

    return <>

        {
            isAddRoleDialogShown && <RolleHinzufügenDialog closeDialog={() => {
                setIsAddRoleDialogShown(false)
            }}/>
        }

        <Accordion type="single" collapsible>
            {
                [...rollen, ...rollen, ...rollen].map((rolle, idx) => <AccordionItem value={`${rolle.rolle} ${idx}`}>
                    <AccordionTrigger>{rolle.rolle} {idx}</AccordionTrigger>
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