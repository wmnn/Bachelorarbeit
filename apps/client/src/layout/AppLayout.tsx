import { userHasPermission } from "@/components/auth/userHasPermission"
import Button, { type ButtonProps } from "@/components/Button"
import { NachrichtNotification, NachrichtNotificationColor } from "@/components/shared/Nachricht/NachrichtNotification"
import { useAllNachrichten } from "@/components/shared/Nachricht/useAllNachrichten"
import { userContext } from "@/context/UserContext"
import { Link, Outlet, useNavigate } from "@tanstack/react-router"
import { logout } from "@thesis/auth"
import { countUnreadMessages, NachrichtenTyp } from "@thesis/nachricht"
import { Berechtigung } from "@thesis/rollen"
import { HelpCircle } from "lucide-react"
import { useContext, useEffect, useMemo, useState, type Dispatch, type FC } from "react"

const LayoutButton: FC<ButtonProps> = (props) => {
    return <Button className="hover:bg-black text-white text-xl rounded-xl px-4 py-2 cursor-pointer transition-all w-full flex justify-start hover:text-gray-200" {...props} />
}

export const AppLayout = () => {

    const [isNavShown, setIsNavShown] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(userContext)

    if (typeof user?.rolle === "string") {
        return <p>Ein Fehler ist aufgetreten. Kontaktieren Sie den Admin. (Fehler: AppLayout)</p>;
    }

    async function handleLogout() {
        const isLoggedOut = await logout();
        if (isLoggedOut) {
            navigate({
                to: '/'
            })
        }
    }

    useEffect(() => {
        if (!user) {
            navigate({ to: "/" });
        }
    }, [user])
    
    return <div className="xl:flex min-h-[100%] max-h-[100%]">
        
        <button className="absolute top-12 right-12 xl:hidden" onClick={() => setIsNavShown(prev => !prev)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>
        <header className={`${isNavShown ? 'block' : 'hidden xl:flex'} xl:w-[20%] bg-abcd shadow-2xl flex flex-col justify-between xl:pb-12 pt-24 xl:pt-16 pb-16 px-8 md:px-24 xl:px-8 bg-main xl:fixed top-0 left-0 h-[100vh] transition-all`}>
            <nav className="flex flex-col gap-4">
                {
                    user?.rolle?.berechtigungen[Berechtigung.NachrichtenRead] === true && 
                    user?.rolle?.berechtigungen[Berechtigung.SchuelerRead] === true && 
                    user?.rolle?.berechtigungen[Berechtigung.KlasseRead] != 'keine' &&
                    <SchwartesBrettButton setIsNavShown={setIsNavShown} />
                }
                {
                    (userHasPermission(user, Berechtigung.KlasseRead, "alle") || userHasPermission(user, Berechtigung.KlasseRead, "eigene")) && 
                    <LayoutButton onClick={() => setIsNavShown(false)}>
                        <Link className="w-[100%] text-left" to="/klassen">Klassen</Link>
                    </LayoutButton>
                }
                {
                    user?.rolle?.berechtigungen[Berechtigung.SchuelerRead] === true && 
                    <LayoutButton onClick={() => setIsNavShown(false)}>
                        <Link className="w-[100%] text-left" to="/schueler">Schüler</Link>
                    </LayoutButton>
                }
                {
                    user?.rolle?.berechtigungen[Berechtigung.GanztagsangebotRead] === "alle" && 
                    <LayoutButton onClick={() => setIsNavShown(false)}>
                        <Link className="w-[100%] text-left" to="/ganztagsangebote">Ganztagsangebote</Link>
                    </LayoutButton>
                }
                {
                    (
                        user?.rolle?.berechtigungen[Berechtigung.DiagnostikverfahrenRead] === "alle" || 
                        user?.rolle?.berechtigungen[Berechtigung.DiagnostikverfahrenRead] === "eigene" 
                    ) && 
                    <LayoutButton onClick={() => setIsNavShown(false)}>
                        <Link className="w-[100%] text-left" to="/diagnostikverfahren">Diagnostikverfahren</Link>
                    </LayoutButton>
                }
                {
                    user?.rolle?.berechtigungen[Berechtigung.RollenVerwalten] === true && 
                    <LayoutButton onClick={() => setIsNavShown(false)}>
                        <Link className="w-[100%] text-left" to="/rollenmanagement">Rollenmanagement</Link>
                    </LayoutButton>
                }
                
            </nav>
            <menu className="flex flex-col gap-4">
                <LayoutButton onClick={() => setIsNavShown(false)}>
                    <div className="flex justify-start gap-2 items-center grow">
                        <HelpCircle />
                        <Link className="w-[100%] text-left" to="/hilfe">Hilfe</Link>
                    </div>
                </LayoutButton>

                <LayoutButton onClick={() => setIsNavShown(false)}>
                    <div className="flex justify-start gap-2 items-center grow">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                        <Link className="w-[100%] text-left" to="/settings">Einstellungen</Link>
                    </div>
                </LayoutButton>

            
                <LayoutButton onClick={() => {
                    setIsNavShown(false)
                    handleLogout()
                }}>
                    <div className="flex justify-start gap-2 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                        <p>Logout</p>
                    </div>
                </LayoutButton>        
              
                
            </menu>
            
        </header>
        
        
        <div className=""/>

        <div className={`${isNavShown ? 'hidden xl:flex' : 'flex'} justify-center flex-col items-center w-full xl:ml-[20%] pt-[80px] xl:pt-0 max-w-full overflow-hidden`}>
            <Outlet />
        </div>
    </div>
}

const SchwartesBrettButton = ({ setIsNavShown } : { setIsNavShown: Dispatch<React.SetStateAction<boolean>>}) => {

    const klassenQuery = useAllNachrichten(NachrichtenTyp.KLASSE)
    const schuelerQuery = useAllNachrichten(NachrichtenTyp.SCHÜLER)
    const isUnreadMessage = useMemo(() => {
        const klassenData = Array.isArray(klassenQuery.query?.data) ? klassenQuery.query.data : [];
        const schuelerData = Array.isArray(schuelerQuery.query?.data) ? schuelerQuery.query.data : [];

        return countUnreadMessages([...klassenData, ...schuelerData]) > 0;
    }, [klassenQuery.query?.data, schuelerQuery.query?.data]);

    return <LayoutButton onClick={() => setIsNavShown(false)}>
        <Link className="w-[100%] text-left flex justify-between items-center" to="/brett">
        <p>Schwarzes Brett</p>
        { isUnreadMessage && <NachrichtNotification color={NachrichtNotificationColor.WHITE} /> }
        </Link>
    </LayoutButton>
}