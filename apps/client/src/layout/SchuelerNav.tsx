import { Link, useRouterState } from "@tanstack/react-router";
import { NavItem as ListItem } from "./NavItem";

export const SchuelerNav = ({ schuelerId }: { schuelerId: string }) => {
  const { location } = useRouterState();
  const pathname = location.pathname;

  const base = `/schueler/${schuelerId}`;

  return (
    <nav className="my-2">
      <ul className="flex">
        <Link to="/schueler/$schuelerId" params={{ schuelerId }}>
          <ListItem isActive={pathname === base}>Stammdaten</ListItem>
        </Link>

        <Link to="/schueler/$schuelerId/historie" params={{ schuelerId }}>
          <ListItem isActive={pathname === `${base}/historie`}>Historie</ListItem>
        </Link>

        <Link to="/schueler/$schuelerId/monitoring" params={{ schuelerId }}>
          <ListItem isActive={pathname === `${base}/monitoring`}>Monitoring</ListItem>
        </Link>

        <Link to="/schueler/$schuelerId/brett" params={{ schuelerId }}>
          <ListItem isActive={pathname === `${base}/brett`}>Schwarzes Brett</ListItem>
        </Link>

        <Link to="/schueler/$schuelerId/anwesenheiten" params={{ schuelerId }}>
          <ListItem isActive={pathname === `${base}/brett`}>Anwesenheiten</ListItem>
        </Link>
      </ul>
      <hr className="h-[1px] border-gray-800" />
    </nav>
  );
};
