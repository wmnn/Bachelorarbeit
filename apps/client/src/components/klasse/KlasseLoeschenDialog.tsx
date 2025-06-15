import { useQueryClient } from "@tanstack/react-query";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";
import { KLASSEN_QUERY_KEY } from "@/reactQueryKeys";
import { deleteKlasse } from "@thesis/schule";
import { useSchuljahrStore } from "../schuljahr/SchuljahrStore";

interface KlasseLoeschenDialogProps {
    klasseId: number,
    closeDialog: () => void;
    setDeleteMsg?: (val: string) => void,
    setIsLoading?: (val: boolean) => void,
    onSubmit?: () => void
}

export function KlasseLoeschenDialog({ klasseId, closeDialog, setDeleteMsg, setIsLoading, onSubmit }: KlasseLoeschenDialogProps) {

    const schuljahr = useSchuljahrStore(store => store.ausgewaeltesSchuljahr)
    const halbjahr = useSchuljahrStore(store => store.ausgewaeltesHalbjahr)
    const queryClient = useQueryClient()

    async function handleDelete() {
        if (setIsLoading) {
            setIsLoading(true);
        }
        const res = await deleteKlasse(klasseId, schuljahr, halbjahr);
        queryClient.invalidateQueries({ queryKey: [KLASSEN_QUERY_KEY] })
        if (setDeleteMsg) {
            setDeleteMsg(res.message)
        }
        if (setIsLoading) {
            setIsLoading(false);
        }
        closeDialog()
    }

    return <RiskyActionDialog 
        message={'Willst du die Klasse wirklich löschen?'} 
        closeDialog={() => closeDialog()}
        onSubmit={() => {
            if (onSubmit) {
                onSubmit()
            } else {
                handleDelete()
            }
        }}
    />
}