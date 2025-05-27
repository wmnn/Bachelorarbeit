import { Dialog } from "./Dialog"
import { ButtonLight } from "./ButtonLight"


interface ErrorDialogProps {
    message: string
    className?: string,
    closeDialog: () => void
}

export function ErrorDialog({ closeDialog, message }: ErrorDialogProps) {
    return <Dialog className="flex flex-col justify-between">

        <div className="flex justify-end pt-8 pb-2 px-8">
            <button className="text-end" onClick={() => closeDialog()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="px-8 flex justify-center items-center h-[100%] text-l md:text-2xl">
            {message}
        </div>
    
        <div className="flex gap-2 px-8 py-8">
            <ButtonLight onClick={() => closeDialog()}>
                Schliessen
            </ButtonLight>
        </div>   
        
    </Dialog>
}