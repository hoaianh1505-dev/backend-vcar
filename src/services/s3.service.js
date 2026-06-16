/**
 * Maps a local file name to its static web asset path.
 * Since multer diskStorage already handles writing the file, we simply return the public URL path.
 * @param {Express.Multer.File} file 
 * @returns {Promise<string>} Static web asset path (e.g., /uploads/car-123.jpg)
 */
export const uploadToS3 = async (file) => {
  return `/uploads/${file.filename}`;
};

/**
 * Maps multiple local files to their static web asset paths.
 * @param {Express.Multer.File[]} files 
 * @returns {Promise<string[]>} Array of static web asset paths
 */
export const uploadMultipleToS3 = async (files) => {
  if (!files || files.length === 0) return [];
  return files.map(file => `/uploads/${file.filename}`);
};
