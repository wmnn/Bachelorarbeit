import { FILES_ENDPOINT } from "../../../../../../libs/config/config";

export const download = (id: string) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${id}.png`;
    link.href = canvas.toDataURL();
    link.click();
};

export const downloadDateien = async (diagnostikId: string, files: string[]) => {
    for (const fileName of files) {
        try {
            const res = await fetch(`${FILES_ENDPOINT}/diagnostik/${diagnostikId}/${fileName}`);
            if (!res.ok) {
                continue;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`Error downloading ${fileName}:`, err);
        }
    }
};