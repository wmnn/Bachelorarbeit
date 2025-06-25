import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export enum SortOption {
    AUFSTEIGEND,
    ABSTEIGEND
}

export const PersonSortLabel: Record<SortOption, string> = {
    [SortOption.ABSTEIGEND]: 'Nachname absteigend',
    [SortOption.AUFSTEIGEND]: 'Nachname aufsteigend',
}

export const SortSelect = ({selectedSortItem, handleSortChange, labels = PersonSortLabel}: {
    selectedSortItem: SortOption, 
    handleSortChange: (val: SortOption) => void,
    labels?: Record<SortOption, string>
}) => {
    return <Select 
        value={`${selectedSortItem}`}
        onValueChange={(val) => {
            handleSortChange(parseInt(val))
        }}
    >
        <SelectTrigger className="xl:w-[180px] w-min">
            <SelectValue placeholder="Sortieren"/>
        </SelectTrigger>
        <SelectContent>
            <SelectItem value={`${SortOption.AUFSTEIGEND}`}>{labels[SortOption.AUFSTEIGEND]}</SelectItem>         
            <SelectItem value={`${SortOption.ABSTEIGEND}`}>{labels[SortOption.ABSTEIGEND]}</SelectItem>          
        </SelectContent>
    </Select>  
}