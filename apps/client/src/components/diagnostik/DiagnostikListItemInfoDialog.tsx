import type { Diagnostik } from "@thesis/diagnostik";
import { Dialog } from "../dialog/Dialog";
import { ButtonLight } from "../ButtonLight";
import { DiagnostikInfo } from "./DiagnostikInfo";

export const DiagnostikListItemInfoDialog = ({ diagnostik, closeDialog }: { 
    diagnostik : Diagnostik,
    closeDialog: () => void
}) => {
    return <Dialog className="p-8 flex flex-col gap-2">
        <DiagnostikInfo diagnostik={diagnostik}/>
        <ButtonLight onClick={closeDialog}>
            Schließen
        </ButtonLight>
    </Dialog>
}