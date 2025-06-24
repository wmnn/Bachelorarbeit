import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { NavItem as ListItem } from "./NavItem";
import { ButtonLight } from "@/components/ButtonLight";

export const DiagnostikenNav = () => {

  const router = useRouter()
  const { location } = useRouterState();
  const pathname = location.pathname;
  const base = `/diagnostikverfahren`;


  return (
    <div className="w-full">

    
    <div className='flex justify-start px-8 pt-8'>
        <h1>Diagnostikverfahren</h1>
    </div>


    <nav className="my-2">
      <ul className="flex">
        <Link to="/diagnostikverfahren">
          <ListItem isActive={pathname === base}>Laufende Verfahren</ListItem>
        </Link>

        <Link to="/diagnostikverfahren/vorlagen">
          <ListItem isActive={pathname === `${base}/vorlagen`}>Vorlagen</ListItem>
        </Link>

        <Link to="/diagnostikverfahren/shared">
          <ListItem isActive={pathname === `${base}/shared`}>Mit dir geteilt</ListItem>
        </Link>

      </ul>
      <hr className="h-[1px] border-gray-800" />
    </nav>
    </div>
  );
};
