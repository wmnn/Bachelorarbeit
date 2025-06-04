import { ButtonLight } from '@/components/ButtonLight'
import { SchuelerErstellenDialog } from '@/components/schueler/SchuelerErstellenDialog'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/(app)/schueler/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isCreateDialogShown, setIsCreateDialogShown] = useState(true)

  // Fetching pupils


  return <div className='flex flex-col'>Hello "/(app)/schueler/"!

    {
      isCreateDialogShown && <SchuelerErstellenDialog />
    }
    <ul>

    </ul>
    

    <ButtonLight>
      Schüler erstellen
    </ButtonLight>
  </div>
}
