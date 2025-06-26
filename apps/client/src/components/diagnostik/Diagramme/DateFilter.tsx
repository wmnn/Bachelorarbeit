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
            Max. datum:
        </label>
        <Input type='date' value={minDate} onChange={(e) => setMinDate(e.target.value)} />
        <label>
            Min. datum:
        </label>
        <Input type='date' value={maxDate} onChange={(e) => setMaxDate(e.target.value)} />
    </div>
}