import { Link, useRouterState } from "@tanstack/react-router";
import { NavItem as ListItem } from "./NavItem";
import { Edit, MoveLeft } from "lucide-react";
import { getTitle } from "@thesis/schule";
import { useKlasse } from "@/components/shared/useKlasse";

export const KlasseNav = ({ klassenId }: { klassenId: string }) => {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const klasseQuery = useKlasse(parseInt(klassenId))

  if (klasseQuery.isPending) {
    return <p>Loading...</p>
  }

  const klasse = klasseQuery.data

  if (!klasse) {
    return <p>Ein Fehler ist aufgetreten.</p>
  }

  const base = `/klassen/${klassenId}`;

  return (
    <>
      <div className='flex justify-between px-8 pt-8'>
        <div className='flex gap-2 items-center'>
          <Link to="/klassen">
            <MoveLeft />
          </Link>
          <h1>{getTitle(klasse)}</h1>
        </div>

        <Link
          to='/klassen/$klassenId/edit'
          params={{
            klassenId
          }}
        >
          <Edit />
        </Link>
      </div>
    
    <nav className="my-2">
      <ul className="flex">
        <Link to="/klassen/$klassenId" params={{ klassenId }}>
          <ListItem isActive={pathname === base}>Klasse</ListItem>
        </Link>

        <Link to="/klassen/$klassenId/tests" params={{ klassenId }}>
          <ListItem isActive={pathname === `${base}/tests`}>Tests</ListItem>
        </Link>

        <Link to="/klassen/$klassenId/brett" params={{ klassenId }}>
          <ListItem isActive={pathname === `${base}/brett`}>Schwarzes Brett</ListItem>
        </Link>
      </ul>
      <hr className="h-[1px] border-gray-800" />
    </nav>
    </>
  );
};
