import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { NavItem as ListItem } from "./NavItem";
import { MoveLeft } from "lucide-react";
import { SchuelerIcons } from "@/components/schueler/SchuelerIcons";
import { DeleteIcon } from "@/components/icons/DeleteIcon";
import { SchuelerLoeschenDialog } from "@/components/schueler/SchuelerLoeschenDialog";
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SCHUELER_QUERY_KEY } from "@/reactQueryKeys";
import { getSchuelerComplete } from "@thesis/schueler";
import { userHasPermission } from "@/components/auth/userHasPermission";
import { Berechtigung } from "@thesis/rollen";
import { userContext } from "@/context/UserContext";
import { NachrichtNotification } from "@/components/shared/Nachricht/NachrichtNotification";
import { useNachrichten } from "@/components/shared/Nachricht/useNachrichten";
import { countUnreadMessages, NachrichtenTyp } from "@thesis/nachricht";

export const SchuelerNav = ({ schuelerId }: { schuelerId: string }) => {
  const { location } = useRouterState();
  const router = useRouter()
  const [isDeleteDialogShown, setIsDeleteDialogShown] = useState(false)
  const pathname = location.pathname;
  const { user } = use(userContext)

  const base = `/schueler/${schuelerId}`;
  const nachrichtenQuery = useNachrichten(NachrichtenTyp.SCHÜLER, parseInt(schuelerId))
  const isUnreadMessage = countUnreadMessages([...nachrichtenQuery.query.data]) > 0
  
  const { isPending, data: schueler } = useQuery({
        queryKey: [SCHUELER_QUERY_KEY, schuelerId],
        queryFn: ({ queryKey }) => {
        const [_key, schuelerId] = queryKey;
            return getSchuelerComplete(parseInt(schuelerId));
        },
        initialData: undefined,
        staleTime: 0
    });

  if (isPending) {
      return <p>Loading...</p>;
  }

  if (!schueler) {
      return <p>Kein Schüler gefunden.</p>;
  }

  return (

    
    <>
    {
      isDeleteDialogShown && <SchuelerLoeschenDialog schuelerId={schueler.id ?? -1} closeDialog={() => setIsDeleteDialogShown(false)}/>
    }
    <div className='flex justify-between items-center px-8'>
      <div className='flex gap-4 items-center pt-8'>
          <button onClick={() => router.history.back()}>
              <MoveLeft />
          </button>
          <h1>{schueler.vorname} {schueler.nachname}</h1>
          <div className='pt-2'>
              <SchuelerIcons schueler={schueler} />
          </div>
      </div>

      <button onClick={() => setIsDeleteDialogShown(true)}>
          <DeleteIcon />
      </button>

    </div>

    
    <nav className="my-2">
      <ul className="flex">
        <Link to="/schueler/$schuelerId" params={{ schuelerId }}>
          <ListItem isActive={pathname === base}>Stammdaten</ListItem>
        </Link>

        {
                (
                  userHasPermission(user, Berechtigung.DiagnostikverfahrenRead, "alle" ) || 
                  userHasPermission(user, Berechtigung.DiagnostikverfahrenRead, "eigene" )
                ) && <> <Link to="/schueler/$schuelerId/historie" params={{ schuelerId }}>
                  <ListItem isActive={pathname === `${base}/historie`}>Historie</ListItem>
                </Link>

                <Link to="/schueler/$schuelerId/monitoring" params={{ schuelerId }}>
                  <ListItem isActive={pathname === `${base}/monitoring`}>Monitoring</ListItem>
                </Link>
                </>

        }

        {
                userHasPermission(user, Berechtigung.NachrichtenRead, true ) && <Link to="/schueler/$schuelerId/brett" params={{ schuelerId }}>
                <ListItem isActive={pathname === `${base}/brett`}>
                <div className="flex gap-2 items-center">
                  <p>Schwarzes Brett</p>
                  { 
                      isUnreadMessage && <NachrichtNotification />
                  }
                </div>
                  
                </ListItem>
              </Link>
        }

        {
                userHasPermission(user, Berechtigung.AnwesenheitsstatusRead, true ) && <Link to="/schueler/$schuelerId/anwesenheiten" params={{ schuelerId }}>
                <ListItem isActive={pathname === `${base}/anwesenheiten`}>Anwesenheiten</ListItem>
              </Link>

        }
        
      </ul>
      <hr className="h-[1px] border-gray-800" />
    </nav>
    </>
  );
};
