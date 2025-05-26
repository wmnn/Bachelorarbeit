export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input className={`p-2 border-gray-200 border-[1px] rounded-l ${props.className || ''}`} {...props} />;
}