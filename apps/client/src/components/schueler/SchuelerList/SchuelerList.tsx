import { List } from "@/components/List"
import { SchuelerErstellenDialog } from "../SchuelerErstellenDialog"
import { SchuelerListItem } from "./SchuelerListItem"
import { AnwesenheitTyp } from "@thesis/anwesenheiten"
import { useState, type ReactNode } from "react"
import type { Schueler } from "@thesis/schueler"
import { SchuelerListHeader } from "./SchuelerListHeader"
import { Input } from "@/components/Input"
import { ButtonLight } from "@/components/ButtonLight"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

interface Action {
    title: string,
    onClick: () => void
}

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
    const [selectedValue, setSelectedValue] = useState('');
 
    function search(query: string) {
      setSchueler((_) => {
        return props.schueler.filter((schueler) => {
          return `${schueler.vorname} ${schueler.nachname}`.includes(query)
        })
      })
    }

    const sortSelect: Action[] = [
      {
        title: 'Nachname aufsteigend',
        onClick: () => {
          setSchueler(_ => {
            const sorted = [...props.schueler].sort((a, b) => {
              return a.nachname.localeCompare(b.nachname); // ASCENDING
            });
            return sorted;
          });
        }
      },
      {
        title: 'Nachname absteigend',
        onClick: () => {
          setSchueler(_ => {
            const sorted = [...props.schueler].sort((a, b) => {
              return b.nachname.localeCompare(a.nachname); // DESCENDING
            });
            return sorted;
          });
        }
      }
    ];

    const handleSortChange = (value: string) => {
        setSelectedValue(value);
        const selectedItem = sortSelect.find(item => item.title === value);
        selectedItem?.onClick?.();
    };


    const rightHeader = <div className="flex gap-2">
      <Input placeholder="Suche" onChange={({ target }) => search(target.value)}></Input>
      <Select 
        value={selectedValue}
        onValueChange={handleSortChange}
    >
        <SelectTrigger className="xl:w-[180px] w-min">
            <SelectValue placeholder="Sortieren"/>
        </SelectTrigger>
        <SelectContent>
            {
                sortSelect.map((item, index) => {
                    return <SelectItem key={index} value={item.title}>{item.title}</SelectItem>                                                            
                })
            }
        </SelectContent>
      </Select>  
      
      <ButtonLight>
        Filtern
      </ButtonLight>
      </div>

    const header = <>
      <div className='flex justify-between mb-8'>
        <h1>Schüler</h1>
          { rightHeader }
      </div>
      <SchuelerListHeader/>
    </>
    
    return <div className="w-full">
    
      <List 
        header={header}
        setIsCreateDialogShown={setIsCreateDialogShown} 
        createButonLabel='Schüler erstellen'
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