import { List } from "@/components/List"
import { SchuelerErstellenDialog } from "../SchuelerErstellenDialog"
import { SchuelerListItem } from "./SchuelerListItem"
import { AnwesenheitTyp } from "@thesis/anwesenheiten"
import { useState, type ReactNode } from "react"
import type { Schueler } from "@thesis/schueler"
import { SchuelerListHeader } from "./SchuelerListHeader"

interface SchuelerListProps {
    schueler: Schueler[] | number[],
    title?: string,
    leftHeader?: ReactNode,
    header?: ReactNode
    rightHeader?: ReactNode,
    className?: string,
    showDerzeitigeKlasse?: boolean
}
export const SchuelerList = (props: SchuelerListProps ) => {

    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
    const { schueler, showDerzeitigeKlasse = true, ...rest } = props; 
    
    return <div className="w-full">
    
      <List 
        leftHeader={<h1>Schüler</h1>}
        setIsCreateDialogShown={setIsCreateDialogShown} 
        createButonLabel='Schüler erstellen'
        header={<SchuelerListHeader/>}
        {...rest}
      >
        { isCreateDialogShown && <SchuelerErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}
        {
          schueler.map(schueler => {
            return <SchuelerListItem schuelerId={typeof schueler === 'number' ? schueler : schueler.id ?? -1} typ={AnwesenheitTyp.UNTERRICHT} showDerzeitigeKlasse={showDerzeitigeKlasse} />
          })
        }
      </List>   
    </div>
}