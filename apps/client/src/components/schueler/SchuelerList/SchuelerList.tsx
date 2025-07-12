import { List } from "@/components/List"
import { SchuelerErstellenDialog } from "../SchuelerErstellenDialog"
import { SchuelerListItem } from "./SchuelerListItem"
import { Anwesenheitstyp } from "@thesis/anwesenheiten"
import { use, useEffect, useState, type ReactNode } from "react"
import type { Schueler } from "@thesis/schueler"
import { SchuelerListHeader } from "./SchuelerListHeader"
import { Input } from "@/components/Input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Button from "@/components/Button"
import { GeprüftDialog } from "@/components/anwesenheitsstatus/GeprüftDialog"
import { SortOption, SortSelect } from "@/components/shared/SortSelect"
import { userHasPermission } from "@/components/auth/userHasPermission"
import { userContext } from "@/context/UserContext"
import { Berechtigung } from "@thesis/rollen"

interface SchuelerListProps {
    schueler: Schueler[],
    title?: string,
    leftHeader?: ReactNode,
    header?: ReactNode
    rightHeader?: ReactNode,
    className?: string,
    showDerzeitigeKlasse?: boolean,
    typ: Anwesenheitstyp
}

export const SchuelerList = (props: SchuelerListProps ) => {

    const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
    const [isGeprüftDialogShown, setIsGeprüftDialogShown] = useState(false)
    const { showDerzeitigeKlasse = true, typ, ...rest } = props; 

    const [schueler, setSchueler] = useState(props.schueler)
    const [selectedSortItem, setSelectedSortItem] = useState(SortOption.ABSTEIGEND);

    const klassen = Array.from(
      new Set(
        props.schueler
          .map(s => s.derzeitigeKlasse)
          .filter((k): k is string => typeof k === "string")
      )
    )
    const [shownClasses, setShownClasses] = useState<string[]>(klassen)
    const { user } = use(userContext)

    useEffect(() => {
      setSchueler(props.schueler)
    }, [props.schueler])
 
    function search(query: string) {
      setSchueler((_) => {
        return props.schueler.filter((schueler) => {
          return `${schueler.vorname} ${schueler.nachname}`.includes(query)
        })
      })
    }

    const sort = (selectedSortItem: SortOption, schueler: Schueler[]) => {
      if (selectedSortItem == SortOption.AUFSTEIGEND) {
        return schueler.sort((a, b) => {
          return a.nachname.localeCompare(b.nachname);
        });
        

      } else {
        return schueler.sort((a, b) => {
          return b.nachname.localeCompare(a.nachname);
        });

      }
    }

    const handleSortChange = (value: SortOption) => {
        setSelectedSortItem(value);
        setSchueler(prev => sort(value, prev))
    };

    const rightHeader = <div className="flex flex-col md:flex-row gap-2 items-center">
      {
        userHasPermission(user, Berechtigung.AnwesenheitsstatusRead, true ) && <div>
          <Button className="border-[1px] max-h-[36px] flex justify-center items-center px-2 py-4 rounded-lg hover:bg-gray-200" onClick={() => setIsGeprüftDialogShown(true)}>
            <p>Alle auf geprüft setzen</p>
          </Button>
        </div>
      }
      

      {
        isGeprüftDialogShown && <GeprüftDialog 
          closeDialog={() => setIsGeprüftDialogShown(false)} 
          schuelerIds={schueler.map(schueler => schueler.id ?? -1)}
          typ={typ}
        />
      }
      

      <Input placeholder="Suche" onChange={({ target }) => search(target.value)} className="max-h-[36px]"></Input>
      <SortSelect selectedSortItem={selectedSortItem} handleSortChange={handleSortChange} />


      <DropdownMenu>
        <DropdownMenuTrigger className="border-[1px] px-2 rounded-lg py-[6px] hover:bg-gray-200">
          Filtern
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {klassen.map(klasse => {

            const isActive = shownClasses.includes(klasse)

            return (
              <DropdownMenuItem
                key={klasse}
                className="cursor-pointer"
                onClick={() => {
                  const isShown = !isActive
                  let newShownClasses = [] as string[]
                  if (isShown) {
                    newShownClasses = [...shownClasses, klasse]
                  } else {
                    newShownClasses = shownClasses.filter(o => o !== klasse)
                  }
                  
                  const filteredSchueler = props.schueler.filter(schueler => newShownClasses.includes(schueler.derzeitigeKlasse ?? ''))
                  setShownClasses(newShownClasses)
                  setSchueler(sort(selectedSortItem, filteredSchueler))
                }}
              >
                <input type="checkbox" className="mr-2" checked={isActive} readOnly />
                Klasse {klasse}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <DropdownMenu>
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
      </DropdownMenu> */}
    </div>

    const header = <>
      <div className='flex flex-col items-start md:flex-row justify-between mb-8 md:items-center '>
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