/**
 * Audit Log Utility
 * 
 * Tracks all critical admin actions across the system for transparency.
 * Format: [Siapa, Melakukan Apa, Kapan]
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_name: string;
  actor_role: 'admin_pusat' | 'admin_regional' | 'admin_finance' | 'user';
  action: AuditAction;
  target_type: 'claim' | 'payment' | 'pesantren' | 'crew' | 'admin' | 'system';
  target_id: string;
  target_name: string;
  details: string;
  region_id?: string;
  region_name?: string;
}

export type AuditAction = 
  // Claim actions
  | 'claim_approved'
  | 'claim_rejected'
  | 'claim_regional_approved'
  // Payment actions
  | 'payment_verified'
  | 'payment_rejected'
  | 'nip_issued'
  | 'niam_issued'
  // Admin actions
  | 'admin_added'
  | 'admin_removed'
  | 'role_changed'
  // Data actions
  | 'pesantren_updated'
  | 'crew_updated'
  | 'crew_deleted'
  | 'pesantren_deleted'
  // System actions
  | 'settings_updated'
  | 'price_changed';

// In-memory store for debug mode
let auditLogs: AuditLogEntry[] = [];

/**
 * Generate unique ID for audit entries
 */
const generateAuditId = (): string => {
  return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Log an audit entry
 */
export const logAuditEntry = (
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): AuditLogEntry => {
  const fullEntry: AuditLogEntry = {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  auditLogs.unshift(fullEntry); // Add to beginning for reverse chronological order
  
  // Keep only last 100 entries in memory
  if (auditLogs.length > 100) {
    auditLogs = auditLogs.slice(0, 100);
  }

  // Log to console in debug mode
  console.log('[AUDIT]', {
    time: new Date(fullEntry.timestamp).toLocaleString('id-ID'),
    actor: `${fullEntry.actor_name} (${fullEntry.actor_role})`,
    action: fullEntry.action,
    target: `${fullEntry.target_type}: ${fullEntry.target_name}`,
    details: fullEntry.details,
  });

  return fullEntry;
};

/**
 * Get all audit logs
 */
export const getAuditLogs = (): AuditLogEntry[] => {
  return [...auditLogs];
};

/**
 * Get audit logs filtered by action type
 */
export const getAuditLogsByAction = (action: AuditAction): AuditLogEntry[] => {
  return auditLogs.filter(log => log.action === action);
};

/**
 * Get audit logs filtered by actor
 */
export const getAuditLogsByActor = (actorId: string): AuditLogEntry[] => {
  return auditLogs.filter(log => log.actor_id === actorId);
};

/**
 * Get audit logs filtered by region
 */
export const getAuditLogsByRegion = (regionId: string): AuditLogEntry[] => {
  return auditLogs.filter(log => log.region_id === regionId);
};

/**
 * Clear all audit logs (for testing)
 */
export const clearAuditLogs = (): void => {
  auditLogs = [];
};

/**
 * Format action for display in Indonesian
 */
export const formatActionLabel = (action: AuditAction): string => {
  const labels: Record<AuditAction, string> = {
    claim_approved: 'Klaim Disetujui',
    claim_rejected: 'Klaim Ditolak',
    claim_regional_approved: 'Klaim Disetujui Regional',
    payment_verified: 'Pembayaran Diverifikasi',
    payment_rejected: 'Pembayaran Ditolak',
    nip_issued: 'NIP Diterbitkan',
    niam_issued: 'NIAM Diterbitkan',
    admin_added: 'Admin Ditambahkan',
    admin_removed: 'Admin Dihapus',
    role_changed: 'Role Diubah',
    pesantren_updated: 'Data Pesantren Diperbarui',
    crew_updated: 'Data Kru Diperbarui',
    crew_deleted: 'Kru Dihapus',
    pesantren_deleted: 'Pesantren Dihapus',
    settings_updated: 'Pengaturan Diperbarui',
    price_changed: 'Harga Diubah',
  };
  return labels[action] || action;
};

/**
 * Get action badge color class
 */
export const getActionBadgeColor = (action: AuditAction): string => {
  if (action.includes('approved') || action.includes('verified') || action.includes('issued')) {
    return 'bg-green-100 text-green-700';
  }
  if (action.includes('rejected') || action.includes('deleted') || action.includes('removed')) {
    return 'bg-red-100 text-red-700';
  }
  if (action.includes('updated') || action.includes('changed')) {
    return 'bg-blue-100 text-blue-700';
  }
  if (action.includes('added')) {
    return 'bg-purple-100 text-purple-700';
  }
  return 'bg-gray-100 text-gray-700';
};
