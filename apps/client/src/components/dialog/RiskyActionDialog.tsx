import { Dialog } from "../dialog/Dialog";
import { MainButton } from "../MainButton";

interface RiskyActionDialogProps {
    message: string,
    closeDialog: () => void;
    onSubmit: () => void;

}
export function RiskyActionDialog({ message, closeDialog, onSubmit }: RiskyActionDialogProps) {
    
    return <Dialog className="p-8 flex flex-col justify-between">
        
        <div />
        <h2 className="text-center">{message}</h2>
        <div className="flex gap-2">
            <MainButton className="bg-white hover:text-white! text-black! border-[1px] border-gray-200!" onClick={() => closeDialog()}>
                Nein
            </MainButton>
            <MainButton className="bg-red-500" onClick={() => onSubmit()}>
                Ja
            </MainButton>
        </div>
        
    </Dialog>
}