import { Link, useRouterState } from "@tanstack/react-router";
import { NavItem as ListItem } from "./NavItem";

export const KlasseNav = ({ klassenId }: { klassenId: string }) => {
  const { location } = useRouterState();
  const pathname = location.pathname;

  const base = `/klassen/${klassenId}`;

  return (
    <nav className="my-2">
      <ul className="flex">
        <Link to="/klassen/$klassenId" params={{ klassenId }}>
          <ListItem isActive={pathname === base}>Klasse</ListItem>
        </Link>

        <Link to="/klassen/$klassenId/tests" params={{ klassenId }}>
          <ListItem isActive={pathname === `${base}/historie`}>Tests</ListItem>
        </Link>

        <Link to="/klassen/$klassenId/brett" params={{ klassenId }}>
          <ListItem isActive={pathname === `${base}/brett`}>Schwarzes Brett</ListItem>
        </Link>
      </ul>
      <hr className="h-[1px] border-gray-800" />
    </nav>
  );
};
