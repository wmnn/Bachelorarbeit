import type { Halbjahr } from "@thesis/schule"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useSchuljahrStore } from "./SchuljahrStore"

export function HalbjahrSelect() {
    const halbjahr = useSchuljahrStore((state) => state.ausgewaeltesHalbjahr)
    const updateHalbjahr = useSchuljahrStore((state) => state.updateHalbjahr)

    return (
        <Select 
            value={halbjahr}
            onValueChange={async (neuesHalbjahr: Halbjahr) => {
                updateHalbjahr(neuesHalbjahr)
            }}
        >
            <SelectTrigger className="xl:w-[180px] w-min">
                <SelectValue placeholder="Schuljahr wählen" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem key={1} value={"1. Halbjahr"}>1. Halbjahr</SelectItem>
                <SelectItem key={2} value={"2. Halbjahr"}>2. Halbjahr</SelectItem>
            </SelectContent>
        </Select>
    )
}
