import type { ReactNode } from "@tanstack/react-router";
import type { FC } from "react";

export interface ButtonProps {
  children: ReactNode;
  type?: "submit" | "reset" | "button";
  onClick?: ((e: React.MouseEvent<HTMLButtonElement>) => any);
  className?: string
}

const Button: FC<ButtonProps> = ({ children, type, onClick, className }) => {

    const preventDefault = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
    }
    return <button type={type ?? "button"} onClick={onClick ? onClick : preventDefault} className={className}>
        { children }
    </button>
}
export default Button;