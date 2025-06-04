export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`p-2 border-gray-200 border-[1px] rounded-l ${props.className || ''}`} />;
}