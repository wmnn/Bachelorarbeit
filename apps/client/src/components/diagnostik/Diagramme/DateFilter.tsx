import { Input } from "@/components/Input"
import { Erhebungszeitraum } from "@thesis/diagnostik"

interface DateFilterProps { 
    minDate: undefined | string,
    maxDate: undefined | string,
    setMinDate: any,
    setMaxDate: any,
    erhebungszeitraum?: Erhebungszeitraum
}
export const DateFilter = (props: DateFilterProps) => {
    const { minDate, setMinDate, maxDate, setMaxDate, erhebungszeitraum } = props

    return <div className="flex flex-col">
        
        <label>
            Min. datum:
        </label>
        {
            erhebungszeitraum === Erhebungszeitraum.KALENDERWOCHE ? <Input type='week' value={minDate} onChange={(e) => {
                setMinDate(e.target.value)
            }} /> : <Input type='date' value={minDate} onChange={(e) => {
                const newVal = e.target.value
                if (newVal !== undefined && minDate !== undefined && new Date(newVal) < new Date(minDate)) {
                    return alert('Das Datum darf nicht kleiner sein als min. Datum.')
                } 
                setMinDate(newVal)
            }} />
        }
        <label>
            Max. datum:
        </label>
        {
            erhebungszeitraum === Erhebungszeitraum.KALENDERWOCHE ? <Input type='week' value={maxDate} onChange={(e) => {
                const newVal = e.target.value
                setMaxDate(newVal)}
            } />
            : <Input type='date' value={maxDate} onChange={(e) => {
                const newVal = e.target.value
                if (newVal !== undefined && maxDate !== undefined && new Date(newVal) > new Date(maxDate)) {
                    return alert('Das Datum darf nicht größer sein als max. Datum.')
                } 
                setMaxDate(e.target.value)}
            } />
        }
        
    </div>
}