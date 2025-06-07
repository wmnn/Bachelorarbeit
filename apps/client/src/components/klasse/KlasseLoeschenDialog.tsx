import { useQueryClient } from "@tanstack/react-query";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";
import { deleteSchueler } from "@thesis/schueler";

interface KlasseLoeschenDialogProps {
    klasseId: number,
    closeDialog: () => void;
    setDeleteMsg?: (val: string) => void,
    setIsLoading?: (val: boolean) => void,
    onSubmit?: () => void
}

export function KlasseLoeschenDialog({ klasseId, closeDialog, setDeleteMsg, setIsLoading, onSubmit }: KlasseLoeschenDialogProps) {

    const queryClient = useQueryClient()
    

    async function handleDelete() {
        if (setIsLoading) {
            setIsLoading(true);
        }
        const res = await deleteSchueler(klasseId);
        queryClient.invalidateQueries({ queryKey: ['schueler'] })
        if (setDeleteMsg) {
            setDeleteMsg(res.message)
        }
        if (setIsLoading) {
            setIsLoading(false);
        }
        closeDialog()
    }
    return <RiskyActionDialog 
        message={'Willst du den Schüler wirklich löschen?'} 
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