import { List } from "@/components/List"
import { SchuelerErstellenDialog } from "../SchuelerErstellenDialog"
import { SchuelerListItem } from "./SchuelerListItem"
import { AnwesenheitTyp } from "@thesis/anwesenheiten"
import { useState, type ReactNode } from "react"
import type { Schueler } from "@thesis/schueler"
import { SchuelerListHeader } from "./SchuelerListHeader"
import { Input } from "@/components/Input"

interface SchuelerListProps {
    schueler: Schueler[],
    title?: string,
    leftHeader?: ReactNode,
    header?: ReactNode
    rightHeader?: ReactNode,
    className?: string,
    showDerzeitigeKlasse?: boolean
}
export const SchuelerList = (props: SchuelerListProps ) => {

    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
    const { showDerzeitigeKlasse = true, ...rest } = props; 

    const [schueler, setSchueler] = useState(props.schueler)
 
    function search(query: string) {
      setSchueler((_) => {
        return props.schueler.filter((schueler) => {
          return `${schueler.vorname} ${schueler.nachname}`.includes(query)
        })
      })
    }
    function sort() {

    }

    function filter() {

    }

    const rightHeader = <Input placeholder="Suche" onChange={({ target }) => search(target.value)}>

    </Input>
    
    return <div className="w-full">
    
      <List 
        leftHeader={<h1>Schüler</h1>}
        setIsCreateDialogShown={setIsCreateDialogShown} 
        createButonLabel='Schüler erstellen'
        rightHeader={rightHeader}
        header={<SchuelerListHeader/>}
        {...rest}
      >
        { isCreateDialogShown && <SchuelerErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}
        {
          schueler.map(schueler => {
            return <SchuelerListItem schueler={schueler} typ={AnwesenheitTyp.UNTERRICHT} showDerzeitigeKlasse={showDerzeitigeKlasse} />
          })
        }
      </List>   
    </div>
}