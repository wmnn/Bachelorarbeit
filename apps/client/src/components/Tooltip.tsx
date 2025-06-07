import type { ReactNode } from "@tanstack/react-router";
import { Tooltip as RadixTooltip} from "radix-ui";

interface TooltipProps {
    children: ReactNode,
    content: ReactNode
}
export const Tooltip = ({ children, content }: TooltipProps) => <RadixTooltip.Provider delayDuration={200}>
    <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
            <button className="IconButton">
                { children }
            </button>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
            <RadixTooltip.Content className="TooltipContent bg-gray-800 text-white rounded-xl p-2" sideOffset={5}>
                { content }
                <RadixTooltip.Arrow className="TooltipArrow" />
            </RadixTooltip.Content>
        </RadixTooltip.Portal>
    </RadixTooltip.Root>
</RadixTooltip.Provider>