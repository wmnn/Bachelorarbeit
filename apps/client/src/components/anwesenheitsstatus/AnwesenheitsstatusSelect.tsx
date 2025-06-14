import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Anwesenheiten, ANWESENHEITEN, AnwesenheitenLabels } from '@thesis/anwesenheiten'

interface AnwesenheitsstatusSelectProps { 
    selected: Anwesenheiten,
    onValueChange: (val: Anwesenheiten) => void,
}
export function AnwesenheitsstatusSelect (props: AnwesenheitsstatusSelectProps) {

    const { onValueChange, selected } = props;
    
    function styleAnwesenheit(val: Anwesenheiten) {
        let color = ''
        if (val === Anwesenheiten.ANWESEND) {
            color = "bg-green-600"
        } else if (val === Anwesenheiten.FEHLT_ENTSCHULDIGT) {
            color = "bg-yellow-300"
        } else if (val === Anwesenheiten.FEHLT_UNENTSCHULDIGT) {
            color = "bg-red-600"
        } else {
            color = "bg-orange-400"
        }

        return <div className="flex justify-between w-full gap-4 items-center">
            <div className={`h-[8px] w-[8px] rounded-4xl ${color}`}/> 
            <p>
                {AnwesenheitenLabels[val]}
            </p>
        </div>
    }

    return <Select 
        value={`${selected}`}
        onValueChange={async (val) => {
            const status = parseInt(val) as Anwesenheiten
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