import { List } from "@/components/List"
import { SchuelerErstellenDialog } from "../SchuelerErstellenDialog"
import { SchuelerListItem } from "./SchuelerListItem"
import { AnwesenheitTyp } from "@thesis/anwesenheiten"
import { useState, type ReactNode } from "react"
import type { Schueler } from "@thesis/schueler"
import { SchuelerListHeader } from "./SchuelerListHeader"
import { Input } from "@/components/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Button from "@/components/Button"
import { GeprüftDialog } from "@/components/anwesenheitsstatus/GeprüftDialog"

interface SchuelerListProps {
    schueler: Schueler[],
    title?: string,
    leftHeader?: ReactNode,
    header?: ReactNode
    rightHeader?: ReactNode,
    className?: string,
    showDerzeitigeKlasse?: boolean,
    typ: AnwesenheitTyp
}

export const SchuelerList = (props: SchuelerListProps ) => {

    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
    const [isGeprüftDialogShown, setIsGeprüftDialogShown] = useState(false)
    const { showDerzeitigeKlasse = true, typ, ...rest } = props; 

    const [schueler, setSchueler] = useState(props.schueler)
    const [selectedSortItem, setSelectedSortItem] = useState('');
    // Wenn ein Wert in filteredShown wahr ist, dann wird er angezeigt, sonst versteckt.
    const [filteredShown, setFilteredShown] = useState<Record<number, boolean>>(props.schueler.reduce((prev, current) => {
      prev[current.id ?? -1] = true
      return prev;
    }, {} as Record<number, boolean>));
 
    function search(query: string) {
      setSchueler((_) => {
        return props.schueler.filter((schueler) => {
          return `${schueler.vorname} ${schueler.nachname}`.includes(query)
        })
      })
    }

    const sortSelect = [
      {
        title: 'Nachname aufsteigend',
      },
      {
        title: 'Nachname absteigend',
      }
    ];

    const sort = (selectedSortItem: string, schueler: Schueler[]) => {
      if (selectedSortItem == 'Nachname aufsteigend') {
        return schueler.sort((a, b) => {
          return a.nachname.localeCompare(b.nachname);
        });
        

      } else {
        return schueler.sort((a, b) => {
          return b.nachname.localeCompare(a.nachname);
        });

      }
    }

    const handleSortChange = (value: string) => {
        setSelectedSortItem(value);
        setSchueler(prev => sort(value, prev))
    };


    const rightHeader = <div className="flex gap-2 items-center">
      <div>
        <Button className="border-[1px] max-h-[36px] flex justify-center items-center px-2 py-4 rounded-lg hover:bg-gray-200" onClick={() => setIsGeprüftDialogShown(true)}>
          <p>Alle auf geprüft setzen</p>
        </Button>
      </div>

      {
        isGeprüftDialogShown && <GeprüftDialog 
          closeDialog={() => setIsGeprüftDialogShown(false)} 
          schuelerIds={schueler.map(schueler => schueler.id ?? -1)}
          typ={typ}
        />
      }
      

      <Input placeholder="Suche" onChange={({ target }) => search(target.value)} className="max-h-[36px]"></Input>
      <Select 
        value={selectedSortItem}
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

      <DropdownMenu>
        <DropdownMenuTrigger className="border-[1px] px-2 rounded-lg py-[6px] hover:bg-gray-200">Filtern</DropdownMenuTrigger>
        <DropdownMenuContent>
          { props.schueler.map(schueler => {
            return <DropdownMenuItem key={schueler.id} className="cursor-pointer" onClick={() => {

              let newValue = !filteredShown[schueler.id ?? -1]     
              setFilteredShown(prev => ({
                ...prev,
                [schueler.id ?? -1]: newValue
              }))

              if (newValue) {
                setSchueler(prev => sort(selectedSortItem, [...prev, schueler]))
              } else {
                setSchueler(prev => sort(selectedSortItem, prev.filter(item => item.id !== schueler.id)))
              }
            }}>
              <input type="checkbox" checked={filteredShown[schueler.id ?? -1] === true} />
              {schueler.vorname} {schueler.nachname}
            </DropdownMenuItem>
          }) }
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    const header = <>
      <div className='flex justify-between mb-8 items-center'>
        { props.leftHeader }
        { rightHeader }
          
      </div>
      <SchuelerListHeader/>
    </>
    
    return <div className="w-full">
    
      <List 
        header={header}
        {...rest}
        createButonLabel="Schüler erstellen"
        setIsCreateDialogShown={setIsCreateDialogShown}
      >
        { isCreateDialogShown && <SchuelerErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>}
        {
          schueler.map(schueler => {
            return <SchuelerListItem key={schueler.id} schueler={schueler} typ={typ} showDerzeitigeKlasse={showDerzeitigeKlasse} />
          })
        }
      </List>   
    </div>
}