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

    return <li className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
  {isLoading && <LoadingSpinner isLoading={isLoading} />}

  {isSelectClassDialogShown && (
    <DiagnostikVorlageSelectClassDialog
      closeDialog={() => setIsSelectClassDialogShown(false)}
      setResponseMsg={setResponseMsg}
      diagnostik={diagnostik}
    />
  )}
  {isInfoDialogShown && (
    <DiagnostikListItemInfoDialog
      closeDialog={() => setIsInfoDialogShown(false)}
      diagnostik={diagnostik}
    />
  )}
  {isDeleteDialogShown && (
    <DeleteDiagnostikDialog
      diagnostikId={`${diagnostik.id ?? -1}`}
      setResponseMsg={setResponseMsg}
      closeDialog={() => setIsDeleteDialogShown(false)}
    />
  )}
  {isEditDialogShown && (
    <DiagnostikEditDialog
      closeDialog={() => setIsEditDialogShown(false)}
      diagnostik={diagnostik}
      setResponseMsg={setResponseMsg}
    />
  )}

  {responseMessage !== '' && (
    <ErrorDialog message={responseMessage} closeDialog={() => setResponseMsg('')} />
  )}

  {/* Main content grid: Two columns on medium screens and up */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
    {/* Left Column (Labels) - This structure will naturally align content */}
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-gray-600 font-medium min-w-[120px]">Name:</label>
        <p className="font-semibold text-gray-800 text-right flex-grow">{diagnostik.name}</p>
      </div>
      <div className="flex justify-between items-center">
        <label className="text-gray-600 font-medium min-w-[120px]">Klasse:</label>
        <p className="text-gray-700 text-right flex-grow">{klasse !== undefined && getTitle(klasse)}</p>
      </div>
      <div className="flex justify-between items-center">
        <label className="text-gray-600 font-medium min-w-[120px]">Erstellt am:</label>
        <p className="text-gray-700 text-right flex-grow">
          {diagnostik.erstellungsDatum &&
            new Date(diagnostik.erstellungsDatum).toLocaleDateString('de')}
        </p>
      </div>
    </div>

    {/* Right Column (More Details and Selects) */}
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-gray-600 font-medium min-w-[120px]">Aktualisiert am:</label>
        <p className="text-gray-700 text-right flex-grow">
          {diagnostik.aktualisiertAm &&
            new Date(diagnostik.aktualisiertAm).toLocaleDateString('de')}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <label className="text-gray-600 font-medium min-w-[120px]">Besitzer:</label>
        {user?.rolle?.berechtigungen[Berechtigung.DiagnostikverfahrenRead] === 'alle' && (
          <Select
            value={`${diagnostik.userId}`}
            onValueChange={async (val) => {
              setIsLoading(true);
              const res = await editDiagnostik(
                { ...diagnostik, userId: parseInt(val) },
                []
              );
              setResponseMsg(res.message);
              await new Promise((resolve) => setTimeout(() => resolve(null), 500));
              if (res.success) {
                queryClient.invalidateQueries({
                  queryKey: [DIAGNOSTIKEN_QUERY_KEY],
                });
              }
              setIsLoading(false);
            }}
          >
            <SelectTrigger className="w-full md:w-[200px] bg-white border-gray-300">
              <SelectValue placeholder="Keine Rolle" />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter((user) => {
                  const rolle = rollen?.find((r) => r.rolle === user.rolle);
                  return (
                    rolle &&
                    ['alle', 'eigene'].includes(
                      rolle.berechtigungen[Berechtigung.DiagnostikverfahrenRead]
                    )
                  );
                })
                .map((user) => (
                  <SelectItem key={user.id} value={`${user.id}`}>
                    {user.vorname} {user.nachname}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isVorlage && (
        <div className="flex justify-between items-center">
          <label className="text-gray-600 font-medium min-w-[120px]">Sichtbarkeit:</label>
          <Select
            value={`${diagnostik.sichtbarkeit}`}
            onValueChange={(val) => handleSichtbarkeitChange(parseInt(val) as Sichtbarkeit)}
          >
            <SelectTrigger className="w-full md:w-[200px] bg-white border-gray-300">
              <SelectValue placeholder="Keine Rolle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={`${Sichtbarkeit.PRIVAT}`}>privat</SelectItem>
              <SelectItem value={`${Sichtbarkeit.ÖFFENTLICH}`}>öffentlich</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  </div>

  {/* Action Buttons Section */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 pt-4 border-t border-gray-200">
    <div className="flex gap-3 items-center flex-wrap">
      {isVorlage && (
        <ButtonLight className="min-w-[100px]" onClick={() => setIsSelectClassDialogShown(true)}>Benutzen</ButtonLight>
      )}
      {isShared && <ButtonLight className="min-w-[100px]" onClick={handleCopy}>Kopieren</ButtonLight>}
      {!isShared && (
        <>
          <Tooltip content="Info">
            <ButtonLight className="p-2 h-auto" onClick={() => setIsInfoDialogShown(true)}>
              <Info size={20} />
            </ButtonLight>
          </Tooltip>

          <Tooltip content="Bearbeiten">
            <ButtonLight className="p-2 h-auto" onClick={() => setIsEditDialogShown(true)}>
              <Edit2 size={20} />
            </ButtonLight>
          </Tooltip>

          <Tooltip content="Löschen">
            <ButtonLight className="p-2 h-auto" onClick={() => setIsDeleteDialogShown(true)}>
              <Trash2 size={20} />
            </ButtonLight>
          </Tooltip>
        </>
      )}
    </div>
  </div>
</li>

}