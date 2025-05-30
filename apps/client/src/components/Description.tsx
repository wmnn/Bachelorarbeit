import type { ReactNode } from "@tanstack/react-router";

export function Description({ children }: { children: ReactNode}) {
    return <span className='text-gray-400'>
        { children }
    </span>
}