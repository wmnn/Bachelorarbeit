import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Berechtigung, BERECHTIGUNGEN_LABELS, BERECHTIGUNGEN_VALUES, type Rolle } from "@thesis/rollen";

interface BerechtigungenSelectProps {
    setRolle: (neueRolle: Rolle) => void,
    rolle: Rolle,
}
export const BerechtigungenSelect = ({ rolle, setRolle }: BerechtigungenSelectProps) => {
    return <div className="flex flex-col gap-2">{
        ((Object.keys(rolle.berechtigungen) as any) as Berechtigung[]).map((berechtigung) => {
            return <BerechtigungSelect key={rolle.rolle + berechtigung} rolle={rolle} berechtigung={berechtigung} setRolle={setRolle} />
        })
    }
    </div>
}
const BerechtigungSelect = ({ berechtigung, rolle, setRolle }: { berechtigung: Berechtigung} & BerechtigungenSelectProps) => {
    return <div className="flex justify-between items-center">
        <label className="text-black!">{BERECHTIGUNGEN_LABELS[berechtigung]}</label>

        
        <Select 
            value={rolle.berechtigungen[berechtigung] as string}
            onValueChange={(newValue) => {
                // It is done like this because of: 'Cannot assign to read only property'
                let tmp = {...rolle};
                tmp.berechtigungen = { ...tmp.berechtigungen }
                // @ts-ignore
                tmp.berechtigungen[berechtigung] = newValue as string | boolean;
                setRolle(tmp)
            }}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Berechtigung"/>
            </SelectTrigger>
            <SelectContent>
                {
                    BERECHTIGUNGEN_VALUES[berechtigung].map((val: any) => {
                        return <SelectItem value={val} key={val}>{typeof val !== "string" ? val ? "ja" : "nein": val}</SelectItem>                                                            
                    })
                }
            </SelectContent>
        </Select>     
    </div>
}