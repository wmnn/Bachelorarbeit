import type { ReactNode } from "@tanstack/react-router"
import { ButtonLight } from "./ButtonLight"

interface ListProps {
    setIsCreateDialogShown: (newVal: boolean) => void
    children: ReactNode,
    createButonLabel: string,
    title?: string,
    leftHeader?: ReactNode,
    header?: ReactNode
    rightHeader?: ReactNode,
    className?: string
    sort?: () => void
    filter?: () => void
}
export function List(props: ListProps ) {
    const { setIsCreateDialogShown, children, createButonLabel, leftHeader, rightHeader, className, header } = props;
    
    return <div className={`flex flex-col w-full ${className}`}>
        <div className='flex justify-between mb-8'>
            { leftHeader }
            <div className='flex gap-2'>
                 { rightHeader }
                <ButtonLight className="text-sm" onClick={() => props.sort ? props.sort() : null}>
                    Sortieren
                </ButtonLight>
                <ButtonLight onClick={() => props.filter ? props.filter() : null}>
                    Filtern
                </ButtonLight>
            </div>
        </div>

        { header }

        <ul className='flex flex-col gap-2 border-[1px] border-gray-200 rounded-2xl divide-y divide-gray-200 w-full overflow-visible max-h-[80vh]'>
          { children }
        </ul>
    
        <ButtonLight onClick={() => setIsCreateDialogShown(true)} className='mt-8'>
          {createButonLabel}
        </ButtonLight>
    </div>
}