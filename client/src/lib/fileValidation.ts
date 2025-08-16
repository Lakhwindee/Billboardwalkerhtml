// File validation utilities for A3 paper size restrictions

// A3 paper size limit - matches server-side restriction
export const A3_MAX_SIZE = 15 * 1024 * 1024; // 15MB

// Convert bytes to human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if file size exceeds A3 limit
export function isFileSizeValid(file: File): boolean {
  return file.size <= A3_MAX_SIZE;
}

// Get file size validation error message
export function getFileSizeError(file: File): string | null {
  if (!isFileSizeValid(file)) {
    const fileSize = formatFileSize(file.size);
    const maxSize = formatFileSize(A3_MAX_SIZE);
    return `File बहुत बड़ी है! Size: ${fileSize}। कृपया A3 size (${maxSize}) से छोटी file upload करें।`;
  }
  return null;
}

// Check if file type is valid
export function isFileTypeValid(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
}

// Get file type validation error message
export function getFileTypeError(file: File): string | null {
  if (!isFileTypeValid(file)) {
    return 'केवल image files की अनुमति है! (JPEG, PNG, GIF, WebP)';
  }
  return null;
}

// Complete file validation
export function validateFile(file: File): string | null {
  // Check file type first
  const typeError = getFileTypeError(file);
  if (typeError) return typeError;
  
  // Then check file size
  const sizeError = getFileSizeError(file);
  if (sizeError) return sizeError;
  
  return null; // File is valid
}

// A3 paper size information for UI display
export const A3_INFO = {
  dimensions: '297mm × 420mm (11.7" × 16.5")',
  pixelsAt300DPI: '3508 × 4961 pixels',
  maxFileSize: formatFileSize(A3_MAX_SIZE),
  recommendedSizes: {
    jpeg: '2-4 MB (High Quality)',
    png: '8-15 MB (High Quality)'
  }
};