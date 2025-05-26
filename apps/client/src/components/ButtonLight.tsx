import type { ButtonProps } from "./Button"
import { MainButton } from "./MainButton"

export function ButtonLight (props: ButtonProps) {
    return <MainButton className={`${props.className} bg-white hover:text-white! text-black! border-[1px] border-gray-200!`} onClick={props.onClick} type={props.type}>
        {props.children}
    </MainButton>
}