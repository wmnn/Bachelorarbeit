import { Link, useRouterState } from "@tanstack/react-router";
import { NavItem as ListItem } from "./NavItem";
import { useDiagnostik } from "@/components/diagnostik/useDiagnostik";
import { MoveLeft, Share2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import { DiagnostikAddTestDialog } from "@/components/diagnostik/DiagnostikAddTestDialog";
import { ButtonLight } from "@/components/ButtonLight";
import { DialogWithButtons } from "@/components/dialog/DialogWithButtons";
import { editDiagnostik, Erhebungszeitraum, type Diagnostik } from "@thesis/diagnostik";
import { SelectedUserCtrl } from "@/components/shared/SelectedUserCtrl";
import { Berechtigung } from "@thesis/rollen";
import { useSelectedUserStore } from "@/components/shared/SelectedUserStore";
import { DIAGNOSTIKEN_QUERY_KEY } from "@/reactQueryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useAllUsers } from "@/components/shared/useAllUsers";
import { userContext } from "@/context/UserContext";

export const DiagnostikNav = ({ diagnostikId }: { diagnostikId: string }) => {

  const { location } = useRouterState();
  const pathname = location.pathname;
  const base = `/diagnostikverfahren/${diagnostikId}`;

  const [isAddTestDataDialogShown, setIsAddTestDataDialogShown] = useState(false)
  const [isShareDialogShown, setIsShareDialogShown] = useState(false)
  const { user } = use(userContext)

  const query = useDiagnostik(parseInt(diagnostikId))
  if (query.isPending) {
      return <p>...Loading</p>
  }
  const diagnostik = query.data

  if (!diagnostik || !user) {
    return <p>Ein Fehler ist aufgetreten, kontaktieren Sie den Admin.</p>
  }

  const isShared = (diagnostik.geteiltMit ?? []).includes(user.id ?? -1)

  return (
    <div className="w-full">
    {
      isShareDialogShown && <ShareDialog closeDialog={() => setIsShareDialogShown(false)} diagnostik={diagnostik} />
    }
    {
      isAddTestDataDialogShown && <DiagnostikAddTestDialog 
        diagnostikId={parseInt(diagnostikId)}
        erhebungszeitraum={diagnostik.erhebungszeitraum ?? Erhebungszeitraum.TAG}
        closeDialog={() => setIsAddTestDataDialogShown(false)} 
        klasseId={typeof diagnostik.klasseId === 'number' ? diagnostik.klasseId : parseInt(diagnostik.klasseId)}
      />
    }
    
    <div className='flex flex-col md:flex-row mb-8 md:mb-0 justify-between px-8 pt-8'>
      <div className='flex gap-2 items-center'>
        <Link to="/diagnostikverfahren">
          <MoveLeft />
        </Link>
        <h1>{diagnostik.name}</h1>
      </div>

      <div className="flex items-center gap-4">
        {
          !isShared && <>
          <ButtonLight onClick={() => setIsAddTestDataDialogShown(true)}>
            Ergebnisse aktualisieren
          </ButtonLight>

          <button onClick={() => setIsShareDialogShown(true)}>
            <Share2 />
          </button>
          </>
        }   
      </div>
    </div>


    <nav className="my-2">
      <ul className="flex">
        <Link to="/diagnostikverfahren/$diagnostikId" params={{ diagnostikId }}>
          <ListItem isActive={pathname === base}>Dashboard</ListItem>
        </Link>

        <Link to="/diagnostikverfahren/$diagnostikId/daten" params={{ diagnostikId }}>
          <ListItem isActive={pathname === `${base}/daten`}>Daten</ListItem>
        </Link>

        <Link to="/diagnostikverfahren/$diagnostikId/info" params={{ diagnostikId }}>
          <ListItem isActive={pathname === `${base}/info`}>Info</ListItem>
        </Link>
      </ul>
      <hr className="h-[1px] border-gray-800" />
    </nav>
    </div>
  );
};

const ShareDialog = ({ closeDialog, diagnostik }: { closeDialog: () => void, diagnostik: Diagnostik }) => {

  const selectedUser = useSelectedUserStore(store => store.selectedUser)
  const setSelectedUsers = useSelectedUserStore(store => store.setSelectedUser)
  const userQuery = useAllUsers()
  const queryClient = useQueryClient()

  async function handleSubmit() {
    const res = await editDiagnostik({
      ...diagnostik,
      geteiltMit: selectedUser.map(user => user.id ?? -1)
    }, [])
    alert(res.message)
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: [DIAGNOSTIKEN_QUERY_KEY] })
      closeDialog()
    }
  }

  useEffect(() => {
    if (!userQuery.data) {
      return;
    }
    const users = userQuery.data.users
    setSelectedUsers(_ => (
      ((diagnostik.geteiltMit ?? [])
        .map(userId => users.find(user => user.id === userId)))
        .filter(user => user != undefined)
    ))
  }, [diagnostik, userQuery.data])

  // if (userQuery.isPending) {
  //   return <p>...Loading</p>
  // }

  return <DialogWithButtons closeDialog={closeDialog} onSubmit={handleSubmit} submitButtonText="Speichern">
    <h2>Diagnostik teilen</h2>

    <SelectedUserCtrl 
      berechtigung={Berechtigung.DiagnostikverfahrenRead}
      berechtigungValue={['alle', 'eigene']}
      label="Nutzer"
      placeholder="Max Mustermann"
    
    />
  </DialogWithButtons>
}