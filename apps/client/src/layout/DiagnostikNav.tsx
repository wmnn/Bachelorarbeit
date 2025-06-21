import { Link, useRouterState } from "@tanstack/react-router";
import { NavItem as ListItem } from "./NavItem";

export const DiagnostikNav = ({ diagnostikId }: { diagnostikId: string }) => {
  const { location } = useRouterState();
  const pathname = location.pathname;

  const base = `/diagnostikverfahren/${diagnostikId}`;

  return (
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
  );
};
