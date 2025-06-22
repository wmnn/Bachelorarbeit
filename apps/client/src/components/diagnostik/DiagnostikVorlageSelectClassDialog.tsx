import { createDiagnostik, DiagnostikTyp, type Diagnostik } from "@thesis/diagnostik";
import { DialogWithButtons } from "../dialog/DialogWithButtons";
import { useKlassen } from "../shared/useKlassen";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getTitle } from "@thesis/schule";
import { useQueryClient } from "@tanstack/react-query";
import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { Input } from "../Input";

interface DiagnostikVorlageSelectClassDialogProps {
    diagnostik: Diagnostik,
    closeDialog: () => void;
    setResponseMsg: (val: string) => void,
}

export function DiagnostikVorlageSelectClassDialog({ diagnostik, closeDialog, setResponseMsg }: DiagnostikVorlageSelectClassDialogProps) {

    const queryClient = useQueryClient()

    const klassenQuery = useKlassen()
    if (klassenQuery.isPending) {
        return <p>...Loading</p>
    }
    const klassen = klassenQuery.data

    const [selectedClass, setSelectedClass] = useState(-1)
    const [name, setName] = useState(diagnostik.name)
    
    async function handleSubmit() {

        const res = await createDiagnostik({
            ...diagnostik,
            name,
            klasseId: selectedClass,
            speicherTyp: DiagnostikTyp.LAUFENDES_VERFAHREN
        })
        setResponseMsg(res.message)
        queryClient.invalidateQueries({ queryKey: [DIAGNOSTIKEN_QUERY_KEY]})
        closeDialog()
    }

    
    return <DialogWithButtons closeDialog={closeDialog} onSubmit={handleSubmit} submitButtonText="Benutzen">

        <div className="flex flex-col gap-2">
            <label>
                Name
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)}/>
            <label>
                Klasse
            </label>
            <Select 
                value={`${selectedClass}`}
                onValueChange={async (val) => {
                    setSelectedClass(parseInt(val))
                }}
            >
                <SelectTrigger className="xl:w-[200px] w-min">
                    <SelectValue placeholder="Keine Klasse ausgewählt"/>
                </SelectTrigger>
                <SelectContent>
                    {
                        selectedClass == -1 && <SelectItem value={`-1`}>
                            Keine Klasse ausgewählt
                        </SelectItem>
                    }
                    {
                        klassen.map((klasse) => {
                            return <SelectItem key={klasse.id} value={`${klasse.id}`}>
                                {getTitle(klasse)}
                            </SelectItem>                 
                        })
                    }
                </SelectContent>
            </Select>    
        </div>
        
    </DialogWithButtons>
}