import type { FC } from "react"
import type { ButtonProps } from "./Button"
import Button from "./Button"

export const MainButton: FC<ButtonProps> = (props) => {
    return <Button {...props} className={props.className + " hover:bg-black text-white text-lg bg-main rounded-lg px-2 text-nowrap md:px-4 py-2 cursor-pointer transition-all w-full flex justify-center hover:text-gray-200 text-center md:min-w-[140px] shadow-xl"} />
}