import type { ReactNode } from "@tanstack/react-router";

export function AuthForm({ children }: { children: ReactNode}) {
    return <div className="flex justify-center items-center flex-col h-[100vh] w-[100vw]">
        <form className="text-start flex flex-col gap-2 min-w-[100vw] px-4 md:min-w-[50vw] xl:min-w-[400px]">
            { children }
        </form>
    </div>
}