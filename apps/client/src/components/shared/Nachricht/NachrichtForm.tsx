import { ButtonLight } from "@/components/ButtonLight"
import type { Nachricht } from "@thesis/nachricht"
import { useState } from "react"

interface NachrichtFormProps {
  onAbort: () => void,
  onSubmit: (inahlt: string) => void,
  submitButtonClassName?: string,
  cancelButtonClassName?: string,
  submitButtonText: string
  initial?: string,
  title?: string
}

export const NachrichtForm = (props: NachrichtFormProps) => {

    const { onAbort, onSubmit, cancelButtonClassName, submitButtonClassName, submitButtonText, initial } = props

    const [inhalt, setInhalt] = useState(initial === undefined ? '' : initial)

    const handleSubmit = () => {
        onSubmit(inhalt)
    }

    return <div>

        <textarea className="w-full min-h-[240px] border-[1px] border-gray-300 p-2"
            value={inhalt}
            onChange={(e) => setInhalt(e.target.value)}            
        />

         <div className="flex gap-2 py-8">
            <ButtonLight className={cancelButtonClassName} onClick={onAbort}>
                Abbrechen
            </ButtonLight>
            <ButtonLight className={submitButtonClassName} onClick={handleSubmit}>
                {submitButtonText}
            </ButtonLight>
        </div>
    </div>
}