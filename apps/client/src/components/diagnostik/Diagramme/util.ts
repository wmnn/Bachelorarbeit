export const download = (id: string) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement | null;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${id}.png`;
    link.href = canvas.toDataURL();
    link.click();
};