import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { NavItem as ListItem } from "./NavItem";
import { useDiagnostik } from "@/components/diagnostik/useDiagnostik";
import { MoveLeft } from "lucide-react";
import { useState } from "react";
import { DiagnostikAddTestDialog } from "@/components/diagnostik/DiagnostikAddTestDialog";
import { ButtonLight } from "@/components/ButtonLight";

export const DiagnostikNav = ({ diagnostikId }: { diagnostikId: string }) => {

  const router = useRouter()
  const { location } = useRouterState();
  const pathname = location.pathname;
  const base = `/diagnostikverfahren/${diagnostikId}`;

  const [isAddTestDataDialogShown, setIsAddTestDataDialogShown] = useState(false)

  const query = useDiagnostik(parseInt(diagnostikId))
  if (query.isPending) {
      return <p>...Loading</p>
  }
  const diagnostik = query.data

  if (!diagnostik) {
    return <p>Ein Fehler ist aufgetreten, kontaktieren Sie den Admin.</p>
  }

  return (
    <div className="w-full">
    {
      isAddTestDataDialogShown && <DiagnostikAddTestDialog 
        diagnostikId={parseInt(diagnostikId)}
        closeDialog={() => setIsAddTestDataDialogShown(false)} 
        klasseId={typeof diagnostik.klasseId === 'number' ? diagnostik.klasseId : parseInt(diagnostik.klasseId)}
      />
    }
    
    <div className='flex justify-between px-8 pt-8'>
      <div className='flex gap-2 items-center'>
        <button onClick={() => router.history.back()}>
          <MoveLeft />
        </button>
        <h1>{diagnostik.name}</h1>
      </div>

      <div>
        <ButtonLight onClick={() => setIsAddTestDataDialogShown(true)}>
          Ergebnisse aktualisieren
        </ButtonLight>
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
