import Button, { type ButtonProps } from "@/components/Button"
import { userContext } from "@/context/UserContext"
import { Link, Outlet, useNavigate } from "@tanstack/react-router"
import { Berechtigung } from "@thesis/auth"
import { useContext, type FC } from "react"

const LayoutButton: FC<ButtonProps> = (props) => {
    return <Button className="hover:bg-black text-white text-xl rounded-xl px-4 py-2 cursor-pointer transition-all w-full flex justify-start hover:text-gray-200" {...props} />
}

export const AppLayout = () => {

    const navigate = useNavigate();
    const { user } = useContext(userContext)
    if (!user) {
        return navigate({ to: "/" });
    }

    if (typeof user.rolle === "string") {
        return;
    }
    
    return <div className="xl:flex min-h-[100vh]">
        <header className="w-[20%] bg-abcd shadow-2xl flex flex-col justify-between py-12 px-8 bg-main">
            <nav className="flex flex-col gap-4">
                <LayoutButton>
                    <Link to="/dashboard">Diagnostikverfahren</Link>
                </LayoutButton>
                {
                    user.rolle?.berechtigungen[Berechtigung.RollenVerwalten] === true && 
                    <LayoutButton>
                        <Link to="/rollenmanagement">Rollenmanagement</Link>
                    </LayoutButton>
                }
                
            </nav>
            <menu className="flex flex-col gap-4">
                <LayoutButton>
                    <div className="flex justify-start gap-2 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                        <Link to="/settings">Einstellungen</Link>
                    </div>
                </LayoutButton>

                <a href="/logout">
                    <LayoutButton>
                    <div className="flex justify-start gap-2 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>


                        <p>Logout</p>
                    </div>
                </LayoutButton>        
                </a>
                
            </menu>
            
        </header>
        
        <div className="w-[2px]"/>

        <div className="flex justify-center flex-col items-center w-full">
            <Outlet />
        </div>
    </div>
}