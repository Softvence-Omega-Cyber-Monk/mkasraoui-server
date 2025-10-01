export const buildFileUrl = (filename: string): string => {
  return `${process.env.SERVER_URL}/uploads/${filename}`;
};
