/**
 * Privacy utilities for data masking
 */

/**
 * Masks a phone number for privacy
 * Example: 081234567890 -> 0812****890
 */
export const maskPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return "-";
  
  // Remove non-digit characters for processing
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 6) return phone; // Too short to mask meaningfully
  
  // Show first 4 and last 3 digits
  const firstPart = cleanPhone.slice(0, 4);
  const lastPart = cleanPhone.slice(-3);
  const maskedPart = '****';
  
  return `${firstPart}${maskedPart}${lastPart}`;
};

/**
 * Masks an email address for privacy
 * Example: example@email.com -> exa***@email.com
 */
export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return "-";
  
  const atIndex = email.indexOf('@');
  if (atIndex < 1) return email; // Invalid email format
  
  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex);
  
  if (localPart.length <= 3) {
    return `${localPart[0]}***${domainPart}`;
  }
  
  // Show first 3 characters and mask the rest
  return `${localPart.slice(0, 3)}***${domainPart}`;
};

/**
 * Masks a name for privacy
 * Example: Ahmad Fauzi -> Ahm** Fau**
 */
export const maskName = (name: string | null | undefined): string => {
  if (!name) return "-";
  
  const parts = name.split(" ");
  return parts.map(part => {
    if (part.length <= 2) return part;
    return part.slice(0, 3) + "**" + (part.length > 4 ? part.slice(-2) : "");
  }).join(" ");
};
