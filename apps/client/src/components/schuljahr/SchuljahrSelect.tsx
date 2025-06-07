import { getSchuljahr, type Schuljahr } from "@thesis/schule";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useSchuljahrStore } from "./SchuljahrStore";

export function SchuljahrSelect() {
    const schuljahr = useSchuljahrStore((state) => state.ausgewaeltesSchuljahr)
    const updateSchuljahr = useSchuljahrStore((state) => state.updateSchuljahr)

    const generateSchuljahre = () => {
    const currentDate = new Date();
    const currentSchuljahr = getSchuljahr(currentDate);
    const startJahr = parseInt(currentSchuljahr.split("/")[0]);

    const format = (n: number) => String(n % 100).padStart(2, "0");

    return Array.from({ length: 21 }, (_, idx) => {
      const offset = idx - 10; 
      const jahrStart = startJahr + offset;
      const jahrEnd = jahrStart + 1;
      return `${format(jahrStart)}/${format(jahrEnd)}`;
    });
  };


    return (
        <Select 
            value={schuljahr}
            onValueChange={async (neuesSchuljahr: Schuljahr) => {
                updateSchuljahr(neuesSchuljahr)
            }}
        >
            <SelectTrigger className="xl:w-[180px] w-min">
                <SelectValue placeholder="Schuljahr wählen" />
            </SelectTrigger>
            <SelectContent>
                {generateSchuljahre().map((jahr, idx) => (
                    <SelectItem key={idx} value={jahr}>{jahr}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
