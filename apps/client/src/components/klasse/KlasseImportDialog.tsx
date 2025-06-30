import { getKlassen, getSchuljahrVorherigesHalbjahr, getTitle, getVorherigesHalbjahr, importKlassen as importKlassenRequest, ImportModus, type Halbjahr, type ImportKlasse, type ImportKlassenversion, type Klasse, type KlassenVersion, type Schuljahr } from "@thesis/schule"
import { DialogWithButtons } from "../dialog/DialogWithButtons"
import { useSchuljahrStore } from "../schuljahr/SchuljahrStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { KLASSEN_QUERY_KEY } from "@/reactQueryKeys"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../Input"
import { useState, useCallback, useEffect } from "react"

interface KlasseErstellenDialogProps {
  closeDialog: () => void,
  setResponseMessage: (val: string) => void
}

export function KlasseImportDialog(props: KlasseErstellenDialogProps) {
    const { closeDialog, setResponseMessage } = props
    const schuljahr = useSchuljahrStore(state => state.ausgewaeltesSchuljahr)
    const halbjahr = useSchuljahrStore(state => state.ausgewaeltesHalbjahr)
    const queryClient = useQueryClient()
    const [importKlassen, setImportData] = useState<ImportKlasse[]>([])

    const { isPending, data: klassen } = useQuery({
        queryKey: [KLASSEN_QUERY_KEY, getSchuljahrVorherigesHalbjahr(schuljahr, halbjahr), getVorherigesHalbjahr(halbjahr)],
        queryFn: ({ queryKey }) => {
            const [_key, prevSchuljahr, prevHalbjahr] = queryKey;
            if (!prevSchuljahr || !prevHalbjahr) {
                return Promise.resolve([]);
            }
            return getKlassen((prevSchuljahr as Schuljahr), (prevHalbjahr as Halbjahr));
        },
        initialData: [],
        enabled: !!schuljahr && !!halbjahr,
    });

    useEffect(() => {
        if (klassen && importKlassen.length === 0) { 
            const initialImportData: ImportKlasse[] = klassen.map((klasse: Klasse) => ({
                id: klasse.id,
                versionen: klasse.versionen.map(version => ({
                    klassenId: klasse.id,
                    klassenstufe: version.klassenstufe,
                    zusatz: version.zusatz,
                    modus: ImportModus.KeineKlasse,
                    neueKlassenstufe: version.klassenstufe,
                    neuerZusatz: version.zusatz,
                })) as any // TODO
            }));
            setImportData(initialImportData);
        }
    }, [klassen, importKlassen.length]);


    const updateImportKlasse = useCallback((
        klasseId: number,
        klassenstufe: string,
        field: 'modus' | 'neueKlassenstufe' | 'neuerZusatz',
        value: ImportModus | string
    ) => {
        setImportData(prev => prev.map(item => {
            if (item.id !== klasseId) {
                return item;
            }
            return {
                ...item,
                versionen: item.versionen.map(prevVersion => {
                    if (prevVersion.klassenstufe !== klassenstufe) {
                        return prevVersion;
                    }
                    return {
                        ...prevVersion,
                        [field]: value,
                    };
                }),
            };
        }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!schuljahr || !halbjahr) {
            setResponseMessage("Fehler: Schuljahr oder Halbjahr fehlen.");
            return;
        }
        try {
            const res = await importKlassenRequest(importKlassen, schuljahr, halbjahr);
            setResponseMessage(res.message || "Import erfolgreich!");
            queryClient.invalidateQueries({
                queryKey: [KLASSEN_QUERY_KEY, schuljahr, halbjahr]
            })
            closeDialog();
        } catch (error) {
            console.error("Import error:", error);
            setResponseMessage("Fehler beim Importieren der Klassen.");
        }
    }, [importKlassen, schuljahr, halbjahr, setResponseMessage, closeDialog]);


    if (isPending || !schuljahr || !halbjahr || importKlassen.length === 0) {
        return <DialogWithButtons
            submitButtonText="Importieren"
            onSubmit={() => {}}
            closeDialog={closeDialog}
        >
            <p>Lade Klassendaten...</p>
        </DialogWithButtons>
    }

    return (
        <DialogWithButtons
            submitButtonText="Importieren"
            onSubmit={handleSubmit}
            closeDialog={closeDialog}
        >
            <div className="text-black flex flex-col gap-2">
                {importKlassen.map((klasse: ImportKlasse) => (
                    <Klasse
                        key={klasse.id}
                        klasse={klasse}
                        updateImportKlasse={updateImportKlasse}
                    />
                ))}
            </div>
        </DialogWithButtons>
    )
}

interface KlasseProps {
    klasse: ImportKlasse,
    updateImportKlasse: (klasseId: number, klassenstufe: string, field: 'modus' | 'neueKlassenstufe' | 'neuerZusatz', value: ImportModus | string) => void
}

function Klasse({ klasse, updateImportKlasse }: KlasseProps) {
    return (
        <div className="flex gap-2 flex-col border-[1px] rounded-lg border-gray-300 py-2 px-2">
            <div>
                <p>{getTitle(klasse)}</p>
            </div>

            <div className="pl-16 flex flex-col gap-2">
                {klasse.versionen.map(version => (
                    <KlassenVersion
                        key={version.klassenstufe}
                        version={version}
                        setModus={(modus: ImportModus) => updateImportKlasse(klasse.id, `${version.klassenstufe ?? ''}`, 'modus', modus)}
                        setKlassenstufe={(neueKlassenstufe) => updateImportKlasse(klasse.id, `${version.klassenstufe ?? ''}`, 'neueKlassenstufe', neueKlassenstufe)}
                        setZusatz={(neuerZusatz) => updateImportKlasse(klasse.id, `${version.klassenstufe ?? ''}`, 'neuerZusatz', neuerZusatz)}
                    />
                ))}
            </div>
        </div>
    )
}

interface KlassenVersionProps {
    version: ImportKlassenversion
    setModus: (modus: ImportModus) => void,
    setKlassenstufe: (klassenstufe: string) => void,
    setZusatz: (zusatz: string) => void
}

function KlassenVersion(props: KlassenVersionProps) {
    const { version, setModus, setKlassenstufe, setZusatz } = props; // Destructure all props
    return (
        <div>
            <div className="flex gap-8">
                <p>{version.klassenstufe}{version.zusatz}</p>
                <Select
                    onValueChange={setModus}
                    value={version.modus || ImportModus.KeineKlasse} // Set default selected value
                >
                    <SelectTrigger className="xl:w-[180px] w-min">
                        <SelectValue placeholder="Modus"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ImportModus.Zusammenlegung}>Zusammenlegung mit</SelectItem>
                        <SelectItem value={ImportModus.Import}>Import</SelectItem>
                        <SelectItem value={ImportModus.KeineKlasse}>Keine Klasse</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {
                version.modus !== ImportModus.KeineKlasse && <div className="flex gap-8">
                    <div className="flex flex-col">
                        <label>{version.modus === ImportModus.Import ? 'Neue Klassenstufe' : 'Klassenstufe (vorheriges Halbjahr)'}</label>
                        <Input onChange={(e) => setKlassenstufe(e.target.value)} value={version.neueKlassenstufe}/>
                    </div>
                    <div className="flex flex-col">
                        <label>{version.modus === ImportModus.Import ? 'Neuer Zusatz' : 'Zusatz (vorheriges Halbjahr)'}</label>
                        <Input onChange={(e) => setZusatz(e.target.value)} value={version.neuerZusatz}/>
                    </div>

                </div>
            }
            
        </div>
    )
}