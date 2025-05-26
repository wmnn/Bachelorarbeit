import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Berechtigung, BERECHTIGUNGEN_LABELS, BERECHTIGUNGEN_VALUES, type Rolle } from "@thesis/auth";

export const BerechtigungenSelect = ({ rolle }: { rolle: Rolle }) => {
    return <div className="flex flex-col gap-2">{
        ((Object.keys(rolle.berechtigungen) as any) as Berechtigung[]).map((berechtigung) => {
            return <BerechtigungSelect rolle={rolle} berechtigung={berechtigung} />
        })
    }
    </div>
}
const BerechtigungSelect = ({ berechtigung, rolle }: { berechtigung: Berechtigung, rolle: Rolle}) => {
    return <div className="flex justify-between">
        <label>{BERECHTIGUNGEN_LABELS[berechtigung]}</label>

        
        <Select value={rolle.berechtigungen[berechtigung] as string}>
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
}