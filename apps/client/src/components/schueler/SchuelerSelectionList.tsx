import type { SchuelerSimple } from "@thesis/schueler"
import { useSchuelerStore } from "../schueler/SchuelerStore";

export const SchuelerSelectionList = ({
    selectedIds, handleSelection,

}: {
    selectedIds: number[],
    handleSelection: (element: SchuelerSimple) => void
}) => {

    const schueler = useSchuelerStore((state) => state.schueler)

    return <ul className="flex flex-col">
        <label>Schüler</label>
        {
            schueler.map((element) => 
            
            <li key={element.id}>
                <input
                    type="checkbox"
                    checked={selectedIds.find(id => id === (element.id ?? -1)) ? true : false}
                />

                <button onClick={() => handleSelection(element)}>
                    {JSON.stringify(element)}
                </button>

            </li>
       
            
            )
        }
    </ul>  
}