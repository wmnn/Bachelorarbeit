import { UploadedFile } from '@thesis/diagnostik';
import { promises as fs, statSync } from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';

export const saveDiagnostikFiles = async (diagnostikId: number, files: UploadedFile[]) => {
  const uploadDir = path.resolve(__dirname, '../../protected/diagnostik', diagnostikId.toString());
  await fs.mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    const safeFileName = sanitize(file.name);
    const filePath = path.join(uploadDir, safeFileName);
    await fs.writeFile(filePath, file.data);
  }
};

export const getDiagnostikFiles = async (diagnostikId: number): Promise<UploadedFile[]> => {
  const dirPath = path.resolve(__dirname, '../../protected/diagnostik', `${diagnostikId}`);

  try {
    const fileNames = await fs.readdir(dirPath);

    const files: UploadedFile[] = await Promise.all(
      fileNames.map(async (fileName) => {
        const filePath = path.join(dirPath, fileName);
        const stat = statSync(filePath);
        const data = await fs.readFile(filePath);

        return {
          name: fileName,
          size: stat.size,
          mimetype: getMimeType(fileName),
          data,
        };
      })
    );

    return files;
  } catch (err) {
    console.error(`Fehler beim Lesen der Dateien von Diagnostik ${diagnostikId}:`, err);
    return [];
  }
};
const getMimeType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.txt': return 'text/plain';
    case '.json': return 'application/json';
    default: return 'application/octet-stream';
  }
};