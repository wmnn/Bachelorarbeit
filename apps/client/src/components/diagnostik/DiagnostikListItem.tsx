import { Link } from "@tanstack/react-router"
import type { Diagnostik } from "@thesis/diagnostik"

export const DiagnostikListItem = ({ diagnostik }: { diagnostik: Diagnostik }) => {
    return <li className="px-2">
        <div className="flex justify-between items-center">
            <Link className="flex gap-2 w-full"
                to="/diagnostikverfahren/$diagnostikId"
                params={{
                    diagnostikId: `${diagnostik.id}`
                }}
            >
                <p>{diagnostik.name}</p>    
            </Link>
            
            <p>{diagnostik.klasseId}</p>
        </div>

        {/* {JSON.stringify(diagnostik)} */}

        <span>
            {diagnostik.beschreibung}
        </span>
        
        
    
    </li>
}