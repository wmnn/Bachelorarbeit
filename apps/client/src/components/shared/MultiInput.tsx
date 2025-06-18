import { ButtonLight } from "../ButtonLight";
import { Input } from "../Input";

export function MultiInput<T>({ values, setValues, label, buttonLabel }: { values: Array<T>, setValues: (values: Array<T>) => void, label: string, buttonLabel?: string}) {
    return <div className="flex flex-col gap-2 my-2">
        <label>{label}</label>
        {
            values.map((value, idx) => <Input key={idx} value={`${value}`} onChange={(e) => {
                setValues(values.map((v, i) => {
                    if (i !== idx) {
                        return v;
                    }
                    return e.target.value as T
                }))
            }}/>)
        }
        <ButtonLight onClick={() => setValues([...values, '' as T])}>
            {buttonLabel ?? label} hinzufügen
        </ButtonLight>
    </div>
}