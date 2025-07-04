import { ButtonLight } from "@/components/ButtonLight"
import type { NachrichtenTyp } from "@thesis/nachricht"
import { useState } from "react"
import { useNachrichtenVorlagen } from "./useNachrichtenVorlagen"

interface NachrichtFormProps {
  onAbort: () => void,
  onSubmit: (inahlt: string) => void,
  submitButtonClassName?: string,
  cancelButtonClassName?: string,
  submitButtonText: string,
  typ: NachrichtenTyp
  initial?: string,
  title?: string
}

export const NachrichtForm = (props: NachrichtFormProps) => {

    const { typ, onAbort, onSubmit, cancelButtonClassName, submitButtonClassName, submitButtonText, initial } = props

    const [inhalt, setInhalt] = useState(initial === undefined ? '' : initial)

    const { query }  = useNachrichtenVorlagen(typ)

    const handleSubmit = () => {
        onSubmit(inhalt)
    }

    return <div>

        <textarea className="w-full min-h-[240px] border-[1px] border-gray-300 p-2"
            value={inhalt}
            onChange={(e) => setInhalt(e.target.value)}            
        />

        <div className="flex flex-wrap gap-4">
            {
                query.data.map((vorlage, key) => <button key={key} className="border-[1px] border-gray-300 px-8 rounded-sm py-2 text-wrap hover:bg-black transition-all hover:text-white" onClick={() => setInhalt(vorlage)}>
                    {vorlage}
                </button>)
            }
        </div>

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