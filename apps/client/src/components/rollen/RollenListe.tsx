import { Berechtigung, BERECHTIGUNGEN_LABELS, BERECHTIGUNGEN_VALUES, type Rolle } from "@thesis/auth";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface RollenProps {
    rollen: Rolle[],
}
export function RollenListe({ rollen }: RollenProps) {
    return <Accordion type="single" collapsible>
        {
            [...rollen, ...rollen, ...rollen].map((rolle, idx) => <AccordionItem value={`${rolle.rolle} ${idx}`}>
                <AccordionTrigger>{rolle.rolle} {idx}</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2">

                    {
                        ((Object.keys(rolle.berechtigungen) as any) as Berechtigung[]).map((berechtigung) => {
                            return <div className="flex justify-between">
                                <label className="xl:pl-[600px]">{BERECHTIGUNGEN_LABELS[berechtigung]}</label>

                               
                                <Select value={rolle.berechtigungen[berechtigung]}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Theme"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {
                                            BERECHTIGUNGEN_VALUES[berechtigung].map((val: any) => {
                                                return <SelectItem value={val}>{typeof val !== "string" ? val ? "ja" : "nein": val}</SelectItem>                                                            
                                            })
                                        }
                                    </SelectContent>
                                </Select>     
                            </div>
                        })
                    }
                </AccordionContent>
            </AccordionItem>
            )
        }
    </Accordion>
}