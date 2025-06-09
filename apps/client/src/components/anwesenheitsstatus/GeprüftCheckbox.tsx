import { ANWESENHEITEN, AnwesenheitTyp, deleteStatus, updateStatus } from "@thesis/anwesenheiten";
import { useSchuelerStore } from "../schueler/SchuelerStore";
import type { Schueler } from "@thesis/schueler";
import { Tooltip } from "../Tooltip";

export function GeprüftCheckbox ({ schuelerId, typ }: { schuelerId: number, typ: AnwesenheitTyp }) {

    const getSchueler = useSchuelerStore(store => store.getSchueler)
    const setSingleSchueler = useSchuelerStore(store => store.setSingleSchueler)
    const schueler = getSchueler(schuelerId)
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
                if (typ === AnwesenheitTyp.GANZTAG) {
                    setSingleSchueler(schuelerId, {
                        ...schueler,
                        heutigerGanztagAnwesenheitsstatus: undefined
                    } as Schueler)
                } else {
                    setSingleSchueler(schuelerId, {
                        ...schueler,
                        heutigerSchultagAnwesenheitsstatus: undefined
                    } as Schueler)
                }
            }
        } else {
            const status = ANWESENHEITEN[0]
            const res = await updateStatus(schuelerId, status, typ, date)
            if (res?.success) {
                if (typ === AnwesenheitTyp.GANZTAG) {
                    setSingleSchueler(schuelerId, {
                        ...schueler,
                        heutigerGanztagAnwesenheitsstatus: status
                    } as Schueler)
                } else {
                    setSingleSchueler(schuelerId, {
                        ...schueler,
                        heutigerSchultagAnwesenheitsstatus: status
                    } as Schueler)
                }
            }
        }
    }
    
    return <Tooltip content={getChecked() ? 'Bei einem Klick wird der heutige Anwesenheitsstatus gelöscht.' : 'Bei einem Klick wird der heutige Anwesenheitsstatus auf anwesend gesetzt.'}>
        <input type='checkbox' className="w-[25px] h-full" checked={getChecked()} onChange={() => handleChange()} />
    </Tooltip>
    
}