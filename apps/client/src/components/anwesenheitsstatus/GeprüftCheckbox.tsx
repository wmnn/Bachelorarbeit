import { ANWESENHEITEN, AnwesenheitTyp, deleteStatus, updateStatus } from "@thesis/anwesenheiten";
import { useSchuelerStore } from "../schueler/SchuelerStore";
import { Tooltip } from "../Tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { SCHUELER_QUERY_KEY } from "@/reactQueryKeys";

export function GeprüftCheckbox ({ schuelerId, typ }: { schuelerId: number, typ: AnwesenheitTyp }) {

    const getSchueler = useSchuelerStore(store => store.getSchueler)
    const schueler = getSchueler(schuelerId)
    const queryClient = useQueryClient()
    if (!schueler) return <p>Fehler</p>

    function getChecked() {
        if (typ === AnwesenheitTyp.GANZTAG) {
            return schueler?.heutigerGanztagAnwesenheitsstatus === undefined ? false : true
        }
        return schueler?.heutigerSchultagAnwesenheitsstatus === undefined ? false : true
    }
    async function handleChange() {
        const isChecked = getChecked()
        const date = new Date().toISOString().split('T')[0]
        if (isChecked) {
            const res = await deleteStatus(schuelerId, typ, date);
            if (res?.success) {
                queryClient.invalidateQueries({ queryKey: [SCHUELER_QUERY_KEY]})
            }
        } else {
            const status = ANWESENHEITEN[0]
            const res = await updateStatus(schuelerId, status, typ, date, date)
            if (res?.success) {
                queryClient.invalidateQueries({ queryKey: [SCHUELER_QUERY_KEY]})
            }
        }
    }
    
    return <Tooltip content={getChecked() ? 'Bei einem Klick wird der heutige Anwesenheitsstatus gelöscht.' : 'Bei einem Klick wird der heutige Anwesenheitsstatus auf anwesend gesetzt.'}>
        <input type='checkbox' className="w-[25px] h-full" checked={getChecked()} onChange={() => handleChange()} />
    </Tooltip>
    
}