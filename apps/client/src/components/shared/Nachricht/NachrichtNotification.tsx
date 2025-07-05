export enum NachrichtNotificationColor {
    WHITE = "bg-white",
    BLUE = "bg-sky-500"
}

export const NachrichtNotification = ({ color = NachrichtNotificationColor.BLUE }: { color?: NachrichtNotificationColor }) => {

    const pingColor = color === NachrichtNotificationColor.BLUE ? "bg-sky-400" : "bg-gray-200";

    return (
        <span className="relative flex size-3">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pingColor} opacity-75`}></span>
            <span className={`relative inline-flex size-3 rounded-full ${color}`}></span>
        </span>
    );
};