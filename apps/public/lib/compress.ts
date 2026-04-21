import imageCompression from 'browser-image-compression';

const MAX_DIMENSION_PX = 1280;
const MAX_SIZE_MB = 2;

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_DIMENSION_PX,
    useWebWorker: true,
    fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    initialQuality: 0.85,
  });

  return new File([compressed], compressed.name || file.name, {
    type: compressed.type || file.type,
    lastModified: Date.now(),
  });
}
