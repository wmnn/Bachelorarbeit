import { useQueryClient } from "@tanstack/react-query";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";
import { GANZTAGSANGEBOT_QUERY_KEY } from "@/reactQueryKeys";
import { deleteGanztagsangebot } from "@thesis/schule";
import { useNavigate, useRouter } from "@tanstack/react-router";

interface GanztagsangebotLoeschenDialogProps {
    id: number,
    closeDialog: () => void;
    setDeleteMsg?: (val: string) => void,
    setIsLoading?: (val: boolean) => void,
    onSubmit?: () => void
}

export function GanztagsangebotLoeschenDialog({ id, closeDialog, setDeleteMsg, setIsLoading, onSubmit }: GanztagsangebotLoeschenDialogProps) {

    const queryClient = useQueryClient()
    const router = useRouter()

    async function handleDelete() {
        if (setIsLoading) {
            setIsLoading(true);
        }
        const res = await deleteGanztagsangebot(id);
        queryClient.invalidateQueries({ queryKey: [GANZTAGSANGEBOT_QUERY_KEY] })
        if (setDeleteMsg) {
            setDeleteMsg(res.message)
        }
        if (setIsLoading) {
            setIsLoading(false);
        }
        closeDialog()
        router.history.back()
    }

    return <RiskyActionDialog 
        message={'Willst du das Ganztagsangebot wirklich löschen?'} 
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