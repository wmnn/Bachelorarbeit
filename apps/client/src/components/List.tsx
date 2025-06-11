import type { ReactNode } from "@tanstack/react-router"
import { ButtonLight } from "./ButtonLight"

interface ListProps {
    setIsCreateDialogShown?: (newVal: boolean) => void
    children: ReactNode,
    createButonLabel?: string,
    title?: string,
    header?: ReactNode
    className?: string
}
export function List(props: ListProps ) {
    const { setIsCreateDialogShown, children, createButonLabel, className, header } = props;
    
    return <div className={`flex flex-col w-full ${className}`}>

        { header }

        <ul className='flex flex-col gap-2 border-[1px] border-gray-200 rounded-2xl divide-y divide-gray-200 w-full overflow-visible max-h-[80vh]'>
          { children }
        </ul>

        { setIsCreateDialogShown && <ButtonLight onClick={() => setIsCreateDialogShown(true)} className='mt-8'>
          {createButonLabel}
        </ButtonLight>}
        
    </div>
}