import { useState } from "react";
import { Dialog } from "../Dialog";
import { BerechtigungenSelect } from "./BerechtigungenSelect";
import { Berechtigung, type Rolle } from "@thesis/auth";
import { DialogWithButtons } from "../DialogWithButtons";

interface RolleHinzufügenDialogProps {
    closeDialog: () => void;
}
export function RolleHinzufügenDialog({ closeDialog }: RolleHinzufügenDialogProps) { 

    const [neueRolle, setNeueRolle] = useState<Rolle>({
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
    });

    return <DialogWithButtons closeDialog={() => {}} onSubmit={() => {}} submitButtonText={"Hinzufügen"}>
        <h1 className="mb-8">Rolle hinzufügen</h1>
        <BerechtigungenSelect rolle={neueRolle} />
        <div className="pb-8"/>
    </DialogWithButtons>
}