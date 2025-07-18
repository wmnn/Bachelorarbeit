import { Ernährung, type SchuelerSimple } from "@thesis/schueler";
import { Tooltip } from "../Tooltip";

export function SchuelerIcons ({ schueler }: { schueler: SchuelerSimple}) {
    return <div className="flex gap-2 items-center w-min h-full">
        <p>{schueler.verlaesstSchuleAllein == true ? 
                   
            <Tooltip content="Der Schüler verlässt die Schule alleine">
                🚶🏽‍➡️
            </Tooltip>
            
            : 
            <Tooltip content="Der Schüler wird abgeholt">
                🚗
            </Tooltip>
        
            
            }</p>
        {
            (schueler.medikamente ?? []).length > 0 && <p>
                <Tooltip content="Der Schüler nimmt Medikamente zu sich.">
                    💉
                </Tooltip>
            </p>
        }
        {schueler.hatSonderpaedagogischeKraft == true ? <Tooltip content="Der Schüler hat eine Integrationskraft">
            🧑‍🧒
        </Tooltip> : null}

        {
            schueler.ernährung === Ernährung.VEGAN && <Tooltip content="Der Schüler ernährt sich vegan">
                🥛
            </Tooltip>
        }
        {
            schueler.ernährung === Ernährung.VEGETARISCH && <Tooltip content="Der Schüler ernährt sich vegetarisch">
                🥩
            </Tooltip>
        }
        
    </div>

}