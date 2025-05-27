import { ClipLoader } from "react-spinners";

export function LoadingSpinner({ isLoading }: { isLoading: boolean}) {
    return <div className="absolute h-full w-full flex justify-center items-center">
        <ClipLoader
            color={'gray'}
            loading={isLoading}
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
        />
    </div>
}