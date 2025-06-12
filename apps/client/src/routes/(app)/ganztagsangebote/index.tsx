import { ErrorDialog } from '@/components/dialog/MessageDialog'
import { GanztagsangebotErstellenDialog } from '@/components/ganztagsangebot/GanztagsangebotErstellenDialog'
import { KlasseListItem } from '@/components/klasse/KlasseListItem'
import { List } from '@/components/List'
import { HalbjahrSelect } from '@/components/schuljahr/HalbjahrSelect'
import { SchuljahrSelect } from '@/components/schuljahr/SchuljahrSelect'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/(app)/ganztagsangebote/')({
  component: RouteComponent,
})

function RouteComponent() {

  const [isCreateDialogShown, setIsCreateDialogShown] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')

  const header = <div className='flex justify-between'>
    <h1>
      Ganztagsangebote
    </h1>
    <div className='flex gap-2'>
        <SchuljahrSelect />
        <HalbjahrSelect />
      </div>
  </div>

  return <div className='w-full'>

    { isCreateDialogShown && <GanztagsangebotErstellenDialog closeDialog={() => setIsCreateDialogShown(false)} setResponseMessage={setResponseMessage} />}
    {(responseMessage !== '') && <ErrorDialog message={responseMessage} closeDialog={() => setResponseMessage('')}/>}

    <List 
      setIsCreateDialogShown={setIsCreateDialogShown} 
      createButonLabel='Ganztagsangebot erstellen'
      header={header}
      className='p-8'
    >
      {
        [].map((item) => {
          return <KlasseListItem klasse={item} key={-1}/>
        })
      }

    </List>

  </div>
}
