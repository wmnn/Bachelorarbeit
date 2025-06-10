import { useImmer } from "use-immer";
import { BerechtigungenSelect } from "./BerechtigungenSelect";
import { Berechtigung, createRole, type Rolle } from "@thesis/rollen";
import { DialogWithButtons } from "../dialog/DialogWithButtons";
import { useRollenStore } from "./RollenStore";
import { useState } from "react";

interface RolleHinzufügenDialogProps {
    closeDialog: () => void;
}

const defaultRolle: Rolle = {
    rolle: "",
    berechtigungen: {
        [Berechtigung.KlasseCreate]: false,
        [Berechtigung.KlasseRead]: "keine",
        [Berechtigung.KlasseUpdate]: false,
        [Berechtigung.KlasseDelete]: false,
        [Berechtigung.GanztagsangebotCreate]: false,
        [Berechtigung.GanztagsangebotRead]: "keine",
        [Berechtigung.GanztagsangebotUpdate]: false,
        [Berechtigung.GanztagsangebotDelete]: false,
        [Berechtigung.SchuelerCreate]: false,
        [Berechtigung.SchuelerRead]: "keine",
        [Berechtigung.SchuelerUpdate]: false,
        [Berechtigung.SchuelerDelete]: false,
        [Berechtigung.AnwesenheitsstatusUpdate]: false,
        [Berechtigung.AnwesenheitsstatusRead]: false,
        [Berechtigung.DiagnostikverfahrenRead]: "keine",
        [Berechtigung.DiagnostikverfahrenDelete]: false,
        [Berechtigung.RollenVerwalten]: false,
        [Berechtigung.NachrichtenvorlagenVerwalten]: false,
        [Berechtigung.NachrichtenDelete]: "eigene",
    }
}
export function RolleHinzufügenDialog({ closeDialog }: RolleHinzufügenDialogProps) { 

    const setRollen = useRollenStore((state) => state.setRollen);
    const rollen = useRollenStore((state) => state.rollen);
    const [isSuccess, setIsSuccess] = useState(true);
    const [message, setMessage] = useState("");
    const [neueRolle, setNeueRolle] = useImmer<Rolle>(defaultRolle);
    
    async function onSubmit() {

        if (neueRolle.rolle === '') {
            setIsSuccess(false);
            setMessage('Die Rollenbezeichnung darf nicht leer sein.')
            return;
        }; 
        const res = await createRole(neueRolle);

        if (!res || !res.success || !rollen) {
            setIsSuccess(false);
            setMessage(res.message)
            return;
        }

        setRollen((prev) => {
            if (!prev) {
                return [neueRolle]
            }
            return [...prev, neueRolle]
        })
        closeDialog()
    }

    return <DialogWithButtons closeDialog={() => closeDialog()} onSubmit={() => onSubmit()} submitButtonText={"Hinzufügen"}>
        <h1 className="mb-8">Rolle hinzufügen</h1>

        <div className="flex flex-col gap-2 mb-4">
            <label>
                Rollenbezeichnung
            </label>
            <input className="p-2 xl:max-w-[50%] border-[1px] border-gray-200 rounded-l" placeholder="" id="rollenbezeichnung" onChange={({ target }) => {
                setNeueRolle(rolle => {
                    rolle.rolle = target.value
                })
            }}/>
        </div>
        
        <BerechtigungenSelect rolle={neueRolle} setRolle={(neueRolle) => {
            setNeueRolle(neueRolle)
        }}/>
        <div className="pb-8"/>
        { 
            !isSuccess && <p className="text-red-500">{message}</p>
        }
    </DialogWithButtons>
}