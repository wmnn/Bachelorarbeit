import { createKlasse } from "@thesis/schule";
import { useKlassenStore } from "./KlassenStore";
import { useQueryClient } from "@tanstack/react-query";
import { KLASSEN_QUERY_KEY } from "@/reactQueryKeys";
import { KlasseForm } from "./KlasseForm";
import { Dialog } from "../dialog/Dialog";
import { useSelectedUserStore } from "../shared/SelectedUserStore";

interface KlasseErstellenDialogProps {
  closeDialog: () => void,
  setResponseMessage: (val: string) => void
}
export function KlasseErstellenDialog({ closeDialog, setResponseMessage }: KlasseErstellenDialogProps) {

    const klassen = useKlassenStore(state => state.neueKlassen)
    const klassenlehrer = useSelectedUserStore(store => store.selectedUser)
    const queryClient = useQueryClient();

    async function handleSubmit() {
        const res = await createKlasse(klassen, klassenlehrer);
        setResponseMessage(res.message)
        queryClient.invalidateQueries({
            queryKey: [KLASSEN_QUERY_KEY]
        })
        if (res.success) {
            closeDialog();
        }
    }
    return <Dialog className="p-8 overflow-auto!">
        <KlasseForm onSubmit={() => handleSubmit()} onAbort={() => closeDialog()} submitButtonText="Erstellen"/>
    </Dialog>
}