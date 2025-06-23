import { UploadedFile } from '@thesis/diagnostik';
import { promises as fs } from 'fs';
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