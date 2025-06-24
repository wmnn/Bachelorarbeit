import { useQueryClient } from "@tanstack/react-query";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";
import { deleteSchueler } from "@thesis/schueler";
import { SCHUELER_QUERY_KEY } from "@/reactQueryKeys";
import { useNavigate } from "@tanstack/react-router";

interface SchuelerLoeschenDialogProps {
    schuelerId: number,
    closeDialog: () => void;
    setDeleteMsg?: (val: string) => void,
    setIsLoading?: (val: boolean) => void,
    onSubmit?: () => void
}

export function SchuelerLoeschenDialog({ schuelerId, closeDialog, setDeleteMsg, setIsLoading, onSubmit }: SchuelerLoeschenDialogProps) {

    const queryClient = useQueryClient()
    const navigate = useNavigate()
    

    async function handleDelete() {
        if (setIsLoading) {
            setIsLoading(true);
        }
        const res = await deleteSchueler(schuelerId);
        
        if (setDeleteMsg) {
            setDeleteMsg(res.message)
        }
        if (setIsLoading) {
            setIsLoading(false);
        }
        if (res.success) {
            queryClient.invalidateQueries({ queryKey: [SCHUELER_QUERY_KEY] })
            navigate({to: "/schueler"})
            closeDialog()
        }
        
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