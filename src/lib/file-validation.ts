// Global file validation utility
// Standard limit: 350KB for all uploads across the system

export const MAX_FILE_SIZE_KB = 350;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFileSize = (file: File, maxSizeKB: number = MAX_FILE_SIZE_KB): FileValidationResult => {
  const maxSizeBytes = maxSizeKB * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Ukuran file terlalu besar (${(file.size / 1024).toFixed(1)}KB). Maksimal yang diizinkan adalah ${maxSizeKB}KB.`,
    };
  }
  
  return { isValid: true };
};

export const validateFileType = (file: File, allowedTypes: string[]): FileValidationResult => {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Format file tidak didukung.",
    };
  }
  
  return { isValid: true };
};

export const validateFile = (
  file: File, 
  options: {
    maxSizeKB?: number;
    allowedTypes?: string[];
  } = {}
): FileValidationResult => {
  const { maxSizeKB = MAX_FILE_SIZE_KB, allowedTypes } = options;
  
  // Validate size first
  const sizeValidation = validateFileSize(file, maxSizeKB);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }
  
  // Validate type if specified
  if (allowedTypes && allowedTypes.length > 0) {
    const typeValidation = validateFileType(file, allowedTypes);
    if (!typeValidation.isValid) {
      return typeValidation;
    }
  }
  
  return { isValid: true };
};
