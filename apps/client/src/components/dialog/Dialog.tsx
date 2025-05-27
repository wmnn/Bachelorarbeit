import type { ReactNode } from "@tanstack/react-router";
import { createPortal } from 'react-dom';

interface DialogProps {
  children: ReactNode,
  className?: string
}
export function Dialog({ children, className }: DialogProps) {

  return <>
    {createPortal(
      <div className='w-[100vw] h-[100vh] bg-black/20 top-0 left-0 flex justify-center items-center fixed'>
        <div className={className + ' bg-white md:rounded-xl min-w-[100%] xl:min-w-[50%] min-h-[100%] xl:min-h-[50%] shadow-2xl overflow-hidden max-h-[100vh]'}>
           { children }
        </div>
      </div>,
      document.body
    )}
  </>
}
