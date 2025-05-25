import type { ReactNode } from "@tanstack/react-router";
import { createPortal } from 'react-dom';

interface DialogProps {
  children: ReactNode,
  className?: string
}
export function Dialog({ children, className }: DialogProps) {

  return <div>
    {createPortal(
      <div className='w-[100vw] h-[100vh] bg-black/20 absolute top-0 left-0 flex justify-center items-center'>
        <div className={className + ' bg-white md:rounded-xl md:min-w-[50%] min-w-[100%] min-h-[100%] md:min-h-[50%] shadow-2xl overflow-hidden max-h-[100vh]'}>
           { children }
        </div>
      </div>,
      document.body
    )}
  </div>
}
