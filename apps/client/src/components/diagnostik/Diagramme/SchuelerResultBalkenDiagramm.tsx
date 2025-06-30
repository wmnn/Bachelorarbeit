import { Tooltip } from "@/components/Tooltip"

interface SchuelerResultBalkenDiagrammProps {
    obereGrenze: number,
    untereGrenze: number,
    mindeststandard: number,
    ergebnis: number,
    label?: string
}
export const SchuelerResultBalkenDiagramm = (props: SchuelerResultBalkenDiagrammProps) => {

    const { obereGrenze, untereGrenze, mindeststandard, ergebnis, label = '2025-02-28'} = props;
    // const obereGrenze = 100
    // const untereGrenze = 0
    // const mindestStandard = 50
    // const sample: Ergebnis = {
    //     datum: '2025-02-25',
    //     ergebnis: '80',
    //     schuelerId: -1
    // } 

    const widthInPx = 50
    const heightInPx = 250

    const heightGreenDivInPercent = 1 - ((mindeststandard - untereGrenze) / (obereGrenze - untereGrenze))
    const heightResultInPercent = (ergebnis - untereGrenze) / (obereGrenze - untereGrenze)
    const heightResultBarInPx = 2
    return <div className="flex flex-col items-center min-w-[100px]">
        <Tooltip content={`Ergebnis: ${ergebnis} Mindeststandard: ${mindeststandard}`}>
            <div style={{ 
                height: `${heightInPx}px`,
                width: `${widthInPx}px`
            }} 
            className={`flex flex-col relative`}>
                <div style={{ 
                    minHeight: `${heightGreenDivInPercent * 100}%`,
                    width: `${widthInPx /2}px`,
                    marginLeft: `${Math.floor(widthInPx /4)}px`
                }} className="bg-green-500">
                    
                </div>

                <div style={{ 
                    minHeight: `${(1-heightGreenDivInPercent) * 100}%`,
                    width: `${widthInPx /2}px`,
                    marginLeft: `${Math.floor(widthInPx /4)}px`
                }} className="bg-red-400">
                </div>

                <div
                    className="absolute bg-black w-full"
                    style={{
                        top: `${heightInPx * (1 - heightResultInPercent) - heightResultBarInPx / 2}px`,
                        height: `${heightResultBarInPx}px`,
                    }}
                ></div>
            </div>
        </Tooltip>
        <label>
            {label}
        </label>
    </div>
}