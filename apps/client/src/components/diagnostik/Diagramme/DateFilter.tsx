import { Input } from "@/components/Input"

interface DateFilterProps { 
    minDate: undefined | string,
    maxDate: undefined | string,
    setMinDate: any,
    setMaxDate: any
}
export const DateFilter = (props: DateFilterProps) => {
    const { minDate, setMinDate, maxDate, setMaxDate } = props

    return <div className="flex flex-col">
        
        <label>
            Min. datum:
        </label>
        <Input type='date' value={minDate} onChange={(e) => {
            const newVal = e.target.value
            if (newVal !== undefined && minDate !== undefined && new Date(newVal) < new Date(minDate)) {
                return alert('Das Datum darf nicht kleiner sein als min. Datum.')
            } 
            setMinDate(e.target.value)
        }} />
        <label>
            Max. datum:
        </label>
        <Input type='date' value={maxDate} onChange={(e) => {
            const newVal = e.target.value
            if (newVal !== undefined && maxDate !== undefined && new Date(newVal) > new Date(maxDate)) {
                return alert('Das Datum darf nicht größer sein als max. Datum.')
            } 
            setMaxDate(e.target.value)}
        } />
    </div>
}