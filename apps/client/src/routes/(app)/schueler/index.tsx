import { ButtonLight } from '@/components/ButtonLight'
import { SchuelerErstellenDialog } from '@/components/schueler/SchuelerErstellenDialog'
import { SchuelerListItem } from '@/components/schueler/SchuelerListItem'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type SchuelerSimple } from '@thesis/schueler';
import { getSchueler } from '@thesis/schueler'
import { useState } from 'react'

export const Route = createFileRoute('/(app)/schueler/')({
  component: RouteComponent,
})

function RouteComponent() {

  const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)

  const { isPending, data: schuelerArr } = useQuery<SchuelerSimple[]>({
    queryKey: ['schueler'],
    queryFn: getSchueler,
    initialData: [],  
  })
  if (isPending) {
    return <p>Loading ...</p>
  }

  // Fetching pupils
  return <div className='flex flex-col p-8 w-full'>
    <div className='flex justify-between mb-8'>
      <h1>Schüler</h1>
      <div className='flex gap-2'>
        <ButtonLight>
          Sortieren
        </ButtonLight>
        <ButtonLight>
          Filtern
        </ButtonLight>
      </div>
    </div>
    
    {
      isCreateDialogShown && <SchuelerErstellenDialog closeDialog={() => setIsCreateDialogShown(false)}/>
    }
    <ul className='flex flex-col gap-2 border-[1px] border-gray-200 rounded-2xl divide-y divide-gray-200 w-full overflow-auto max-h-[80vh]'>
      {
        schuelerArr.map(schueler => {
          return <SchuelerListItem schueler={schueler}/>
        })
      }
    </ul>
    

    <ButtonLight onClick={() => setIsCreateDialogShown(true)} className='mt-8'>
      Schüler erstellen
    </ButtonLight>
  </div>
}
