import type { ReactNode } from "@tanstack/react-router"
import { Dialog } from "./Dialog"
import { ButtonLight } from "../ButtonLight"


interface DialogWithButtonsProps {
  children: ReactNode,
  className?: string,
  closeDialog: () => void,
  onSubmit: () => void,
  submitButtonClassName?: string,
  cancelButtonClassName?: string,
  submitButtonText: string
}
export function DialogWithButtons({ closeDialog, children, onSubmit, submitButtonClassName, cancelButtonClassName, submitButtonText }: DialogWithButtonsProps) {
    return <Dialog className="flex flex-col justify-between">

        <div className="flex justify-end pt-8 pb-2 px-8">
            <button className="text-end" onClick={() => closeDialog()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="overflow-auto h-full grow flex flex-col justify-between">
            
            <div className="px-8">
                {children}
            </div>
            
            <div className="flex gap-2 px-8 py-8">
                <ButtonLight className={cancelButtonClassName} onClick={() => closeDialog()}>
                    Abbrechen
                </ButtonLight>
                <ButtonLight className={submitButtonClassName} onClick={() => onSubmit()}>
                    {submitButtonText}
                </ButtonLight>
            </div>
        </div>

        
    </Dialog>
}