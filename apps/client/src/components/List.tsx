import type { ReactNode } from "@tanstack/react-router"
import { ButtonLight } from "./ButtonLight"

interface ListProps<T> {
    setIsCreateDialogShown: (newVal: boolean) => void
    children: ReactNode,
    items?: T[],
    setItems?: (newItems: T[]) => void,
    createButonLabel: string,
    title?: string,
    leftHeader?: ReactNode,
    rightHeader?: ReactNode
}
export function List<T>({ setIsCreateDialogShown, children, createButonLabel, leftHeader, rightHeader}: ListProps<T> ) {
    return <div className='flex flex-col p-8 w-full'>
        <div className='flex justify-between mb-8'>
            { leftHeader }
            <div className='flex gap-2'>
                 { rightHeader }
                <ButtonLight>
                    Sortieren
                </ButtonLight>
                <ButtonLight>
                    Filtern
                </ButtonLight>
            </div>
        </div>

        <ul className='flex flex-col gap-2 border-[1px] border-gray-200 rounded-2xl divide-y divide-gray-200 w-full overflow-auto max-h-[80vh]'>
          { children }
        </ul>
    
        <ButtonLight onClick={() => setIsCreateDialogShown(true)} className='mt-8'>
          {createButonLabel}
        </ButtonLight>
    </div>
}