import { Link } from "@tanstack/react-router"
import { copyDiagnostik, DiagnostikTyp, editDiagnostik, Sichtbarkeit, updateSichtbarkeit, type Diagnostik } from "@thesis/diagnostik"
import { use, useState } from "react"
import { DiagnostikListItemInfoDialog } from "./DiagnostikListItemInfoDialog"
import { Edit2, Info, Trash2 } from "lucide-react"
import { useKlassen } from "../shared/useKlassen"
import { getTitle } from "@thesis/schule"
import { Tooltip } from "../Tooltip"
import { DeleteDiagnostikDialog } from "./DeleteDiagnostikDialog"
import { ErrorDialog } from "../dialog/MessageDialog"
import { ButtonLight } from "../ButtonLight"
import { DiagnostikVorlageSelectClassDialog } from "./DiagnostikVorlageSelectClassDialog"
import { DiagnostikEditDialog } from "./DiagnostikEditDialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useQueryClient } from "@tanstack/react-query"
import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys"
import { userContext } from "@/context/UserContext"
import { Berechtigung } from "@thesis/rollen"
import { useAllUsers } from "../shared/useAllUsers"
import { useUserStore } from "../auth/UserStore"
import { useRollenStore } from "../auth/RollenStore"
import { LoadingSpinner } from "../LoadingSpinner"

type DiagnostikListItemProps = {
  diagnostik: Diagnostik;
  isShared?: boolean;
};
export const DiagnostikListItem = ({ diagnostik, isShared = false }: DiagnostikListItemProps) => {

    const [isInfoDialogShown, setIsInfoDialogShown] = useState(false)
    const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)
    const [isSelectClassDialogShown, setIsSelectClassDialogShown] = useState(false)
    const [isEditDialogShown, setIsEditDialogShown] = useState(false)
    const [responseMessage, setResponseMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const queryClient = useQueryClient()
    const { user } = use(userContext)

    const klassenQuery = useKlassen()
    const isVorlage = diagnostik.speicherTyp == DiagnostikTyp.VORLAGE

    const query = useAllUsers();

    if (typeof user?.rolle == 'string' || query.data == undefined) {
        return;
    }

    const { users, rollen } = query.data

    if (typeof user?.rolle == 'string') {
        return;
    }

    async function handleSichtbarkeitChange(newValue: Sichtbarkeit) {
        const res = await updateSichtbarkeit(`${diagnostik?.id ?? -1}`, newValue)
        setResponseMsg(res.message)
        if (res.success) {
            queryClient.invalidateQueries({ queryKey: [DIAGNOSTIKEN_QUERY_KEY]})
        }
    }

    async function handleCopy() {
        const res = await copyDiagnostik(`${diagnostik.id ?? -1}`)
        setResponseMsg(res.message)
        if (res.success) {
            queryClient.invalidateQueries({ queryKey: [DIAGNOSTIKEN_QUERY_KEY]})
        }
    }

    if (klassenQuery.isPending) {
        return <p>...Loading</p>
    }
    const klassen = klassenQuery.data
    const klasse = klassen.find(item => item.id == diagnostik.klasseId)

    return <li className="px-4 py-4 relative">
        {
            isLoading && <LoadingSpinner isLoading={isLoading} />
        }
        {
            isSelectClassDialogShown && <DiagnostikVorlageSelectClassDialog 
                closeDialog={() => setIsSelectClassDialogShown(false)}
                setResponseMsg={setResponseMsg}
                diagnostik={diagnostik}
            />
        }
        {
            isInfoDialogShown && <DiagnostikListItemInfoDialog 
                closeDialog={() => setIsInfoDialogShown(false)} 
                diagnostik={diagnostik}
            />
        }
        {
            isDeleteDialogShown && <DeleteDiagnostikDialog 
                diagnostikId={`${diagnostik.id ?? -1}`} 
                setResponseMsg={setResponseMsg}
                closeDialog={() => setIsDeleteDialogShown(false)}
            />
        }
        {
            isEditDialogShown && <DiagnostikEditDialog 
                closeDialog={() => setIsEditDialogShown(false)} 
                diagnostik={diagnostik}
                setResponseMsg={setResponseMsg}
            />
        }

        {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMsg('')}/>}
        <div className="flex justify-between items-center">
            <Link className="flex gap-2 w-full"
                to="/diagnostikverfahren/$diagnostikId"
                params={{
                    diagnostikId: `${diagnostik.id}`
                }}
            >
                <p>{diagnostik.name}</p>   
                {
                    diagnostik.erstellungsDatum && <label>
                        Erstellt am: {new Date(diagnostik.erstellungsDatum).toLocaleDateString('de')}
                    </label> 
                }
                
            </Link>
            <div className="flex gap-4 items-center">
                { 
                    isVorlage && <Select 
                        value={`${diagnostik.sichtbarkeit}`}
                        onValueChange={async (val) => {
                            const sichtbarkeit = parseInt(val) as Sichtbarkeit
                            handleSichtbarkeitChange(sichtbarkeit)
                        }}
                    >
                        <SelectTrigger className="xl:w-[200px] w-min">
                            <SelectValue placeholder="Keine Rolle"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={`${Sichtbarkeit.PRIVAT}`}>
                                privat    
                            </SelectItem>  
                            <SelectItem value={`${Sichtbarkeit.ÖFFENTLICH}`}>
                                öffentlich
                            </SelectItem>                 
                        </SelectContent>
                    </Select>    
                }

                {
                    user?.rolle?.berechtigungen[Berechtigung.DiagnostikverfahrenRead] == 'alle' && <Select 
                        value={`${diagnostik.userId}`}
                        onValueChange={async (val) => {
                            setIsLoading(true)
                            console.log(val)

                            const res = await editDiagnostik({
                                ...diagnostik,
                                userId: parseInt(val)
                            }, [])
                            setResponseMsg(res.message)
                            
                            await new Promise(resolve => {
                                setTimeout(() => resolve(null), 500)
                            })
                            if (res.success) {
                                queryClient.invalidateQueries({
                                    queryKey: [DIAGNOSTIKEN_QUERY_KEY]
                                })
                            }
                            
                            
                            setIsLoading(false)
                        }}
                    >
                        <SelectTrigger className="xl:w-[200px] w-min">
                            <SelectValue placeholder="Keine Rolle"/>
                        </SelectTrigger>
                        <SelectContent>
                            {
                                users.filter(user => {
                                    const rolle = rollen?.find(rolle => rolle.rolle == user.rolle)
                                    if (rolle && ['alle', 'eigene'].includes(rolle.berechtigungen[Berechtigung.DiagnostikverfahrenRead])) {
                                        return true
                                    }
                                    return false;
                                }).map(user => <SelectItem value={`${user.id}`}>
                                    {user.vorname} {user.nachname}    
                                </SelectItem>)
                            }
                            <SelectItem value={`${Sichtbarkeit.PRIVAT}`}>
                                privat    
                            </SelectItem>  
                            <SelectItem value={`${Sichtbarkeit.ÖFFENTLICH}`}>
                                öffentlich
                            </SelectItem>                 
                        </SelectContent>
                    </Select>  
                }

                { 
                    isVorlage && <ButtonLight onClick={() => setIsSelectClassDialogShown(true)}>
                        Benutzen
                    </ButtonLight>
                }
                {
                    isShared && <ButtonLight onClick={() => handleCopy()}>
                        Kopieren
                    </ButtonLight>
                }
                <p>{klasse !== undefined && getTitle(klasse)}</p>
                {
                    !isShared && <>
                    <Tooltip content={'Info'}>
                        <button onClick={() => setIsInfoDialogShown(true)}>
                            <Info />
                        </button>
                    </Tooltip>
                    

                    <Tooltip content={'Bearbeiten'}>
                        <button onClick={() => setIsEditDialogShown(true)}>
                        <Edit2 />
                    </button>
                    </Tooltip>
                    
                    <Tooltip content={'Löschen'}>
                        <button onClick={() => setIsDeleteDialogShown(true)}>
                            <Trash2 />
                        </button>
                    </Tooltip>
                    </>
                }
            </div>
            
        </div>        
    
    </li>
}