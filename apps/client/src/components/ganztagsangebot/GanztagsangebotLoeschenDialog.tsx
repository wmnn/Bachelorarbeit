import { useQueryClient } from "@tanstack/react-query";
import { RiskyActionDialog } from "../dialog/RiskyActionDialog";
import { GANZTAGSANGEBOT_QUERY_KEY } from "@/reactQueryKeys";
import { deleteGanztagsangebot } from "@thesis/schule";
import { useSchuljahrStore } from "../schuljahr/SchuljahrStore";

interface GanztagsangebotLoeschenDialogProps {
    closeDialog: () => void;
    setDeleteMsg?: (val: string) => void,
    setIsLoading?: (val: boolean) => void,
    onSubmit?: () => void,
    ganztagsangebotId: number
}

export function GanztagsangebotLoeschenDialog({ ganztagsangebotId, closeDialog, setDeleteMsg, setIsLoading, onSubmit }: GanztagsangebotLoeschenDialogProps) {

    const queryClient = useQueryClient()
    const schuljahr = useSchuljahrStore(store => store.ausgewaeltesSchuljahr)
    const halbjahr = useSchuljahrStore(store => store.ausgewaeltesHalbjahr)

    async function handleDelete() {
        if (setIsLoading) {
            setIsLoading(true);
        }
        const res = await deleteGanztagsangebot(ganztagsangebotId, schuljahr, halbjahr);
        queryClient.invalidateQueries({ queryKey: [GANZTAGSANGEBOT_QUERY_KEY] })
        if (setDeleteMsg) {
            setDeleteMsg(res.message)
        }
        if (setIsLoading) {
            setIsLoading(false);
        }
        closeDialog()
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