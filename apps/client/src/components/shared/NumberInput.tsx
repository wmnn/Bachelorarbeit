import { Input } from "../Input";

export function NumberInput(props: { value: number | '', setValue: (val: undefined | number) => void }) {
    const { value, setValue } = props;

    return <Input value={value} onChange={(e) => {
        const value = e.target.value;
        if (/^-?\d*$/.test(value)) {
            if (value == '-') {
                setValue(0);
                return;
            }
            setValue(value === '' ? 0 : parseInt(value, 10));
        }
    }}/>
}