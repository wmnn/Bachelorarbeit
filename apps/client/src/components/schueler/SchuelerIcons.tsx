import type { SchuelerSimple } from "@thesis/schueler";
import { Tooltip } from "../Tooltip";
import { CarFront, Users } from "lucide-react";

export function SchuelerIcons ({ schueler }: { schueler: SchuelerSimple}) {
    return <div className="flex gap-2 items-center w-min h-full">
        <p>{schueler.verlaesstSchuleAllein == true ? 
                   
            <Tooltip content="Der Schüler verlässt die Schule alleine">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
            </Tooltip>
            
            : 
            <Tooltip content="Der Schüler wird abgeholt">
                <CarFront />
            </Tooltip>
        
            
            }</p>
        <p>{schueler.hatSonderpaedagogischeKraft == true ? <Tooltip content="Der Schüler hat eine sonderpädagogische Hilfskraft">
                <Users />
            </Tooltip> : null}
        </p>
    </div>

}