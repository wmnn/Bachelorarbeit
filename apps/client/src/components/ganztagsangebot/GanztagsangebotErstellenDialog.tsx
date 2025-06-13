import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "../dialog/Dialog";
import { GanztagsangebotForm } from "./GanztagsangebotForm";
import { useSchuljahrStore } from "../schuljahr/SchuljahrStore";
import { useState } from "react";
import { createGanztagsangebot } from "@thesis/schule";
import { useSelectedUserStore } from "../shared/SelectedUserStore";
import { GANZTAGSANGEBOT_QUERY_KEY } from "@/reactQueryKeys";

interface KlasseErstellenDialogProps {
  closeDialog: () => void,
  setResponseMessage: (val: string) => void
}
export function GanztagsangebotErstellenDialog({ closeDialog, setResponseMessage }: KlasseErstellenDialogProps) {

    const queryClient = useQueryClient();
    const schuljahr = useSchuljahrStore(store => store.ausgewaeltesSchuljahr)
    const halbjahr = useSchuljahrStore(store => store.ausgewaeltesHalbjahr)
    const betreuer = useSelectedUserStore(store => store.selectedUser)
    const [selectedSchueler, setSelectedSchueler] = useState<number[]>([])
    const [name, setName] = useState('')

    async function handleSubmit() {
        const res = await createGanztagsangebot({
            name,
            schuljahr,
            halbjahr,
            schueler: selectedSchueler,
            betreuer: betreuer.map(user => user.id ?? -1)
        });
        setResponseMessage(res.message)
        closeDialog()
        queryClient.invalidateQueries({ queryKey: [GANZTAGSANGEBOT_QUERY_KEY] })
    }
    return <Dialog className="p-8 overflow-auto!">
        <GanztagsangebotForm 
            onSubmit={() => handleSubmit()} 
            onAbort={() => closeDialog()} 
            submitButtonText="Erstellen" 
            selectedSchueler={selectedSchueler} 
            setSelectedSchueler={setSelectedSchueler} 
            name={name}
            setName={setName}
        />
    </Dialog>
}