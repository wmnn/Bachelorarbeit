import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Anwesenheitsstatus, ANWESENHEITEN } from '@thesis/anwesenheiten'
import { styleAnwesenheit } from "./util";

interface AnwesenheitsstatusSelectProps { 
    selected: Anwesenheitsstatus,
    onValueChange: (val: Anwesenheitsstatus) => void,
}
export function AnwesenheitsstatusSelect (props: AnwesenheitsstatusSelectProps) {

    const { onValueChange, selected } = props;

    return <Select 
        value={`${selected}`}
        onValueChange={async (val) => {
            const status = parseInt(val) as Anwesenheitsstatus
            onValueChange(status)
        }}
    >
        <SelectTrigger className="xl:w-[200px] w-min">
            <SelectValue placeholder="Keine Rolle"/>
        </SelectTrigger>
        <SelectContent>
            {
                ANWESENHEITEN.map((val) => {
                    return <SelectItem key={val} value={`${val}`}>
                        {styleAnwesenheit(val)}
        
                        
                    </SelectItem>                 
                })
            }
        </SelectContent>
    </Select>    
    
}