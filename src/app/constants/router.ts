/**
 * Route Constants
 *
 * Centralized route path definitions for the entire application.
 * All route paths should be defined here to maintain consistency.
 */

export const ROUTES = {
  // Root
  ROOT: '/',

  // Auth Routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },

  // Public Routes
  PUBLIC: {
    CHECK_INSTITUTION: '/check-institution',
    INSTITUTION_SUBMISSION: '/institution-submission',
    CLAIM_ACCOUNT: '/claim-account',
    LEGACY_CLAIM: '/legacy-claim',
    VERIFY_OTP: '/verify-otp',
    CLAIM_SUCCESS: '/claim-success',
    PAYMENT: '/payment',
    PAYMENT_PENDING: '/payment-pending',
    DEBUG_VIEW: '/debug-view',
  },

  // Public Verification Routes
  VERIFICATION: {
    DIREKTORI: '/direktori',
    PESANTREN_PROFILE: '/pesantren/:nip',
    CREW_PROFILE: '/pesantren/:nip/crew/:niamSuffix',
  },

  // CMS Routes - Setiap menu punya routing sendiri
  CMS: {
    USER_BERANDA: '/cms/user-beranda',
    USER_IDENTITAS: '/cms/user-identitas',
    USER_ADMINISTRASI: '/cms/user-administrasi',
    USER_TIM: '/cms/user-tim',
    USER_EID: '/cms/user-eid',
    USER_EVENT: '/cms/user-event',
    USER_HUB: '/cms/user-hub',
    USER_PENGATURAN: '/cms/user-pengaturan',

    ADMIN_PUSAT_DASHBOARD: '/cms/admin-pusat-dashboard',
    ADMIN_PUSAT_ADMINISTRASI: '/cms/admin-pusat-administrasi',
    ADMIN_PUSAT_MASTER_DATA: '/cms/admin-pusat-master-data',
    ADMIN_PUSAT_MASTER_REGIONAL: '/cms/admin-pusat-master-regional',
    ADMIN_PUSAT_MANAJEMEN_EVENT: '/cms/admin-pusat-manajemen-event',
    ADMIN_PUSAT_MANAJEMEN_MILITANSI: '/cms/admin-pusat-manajemen-militansi',
    ADMIN_PUSAT_MPJ_HUB: '/cms/admin-pusat-mpj-hub',
    ADMIN_PUSAT_PENGATURAN: '/cms/admin-pusat-pengaturan',

    ADMIN_REGIONAL_DASHBOARD: '/cms/admin-regional-dashboard',
    ADMIN_REGIONAL_DATA_MASTER: '/cms/admin-regional-data-master',
    ADMIN_REGIONAL_VALIDASI_PENDAFTAR: '/cms/admin-regional-validasi-pendaftar',
    ADMIN_REGIONAL_MANAJEMEN_EVENT: '/cms/admin-regional-manajemen-event',
    ADMIN_REGIONAL_LAPORAN_DOKUMENTASI: '/cms/admin-regional-laporan-dokumentasi',
    ADMIN_REGIONAL_LATE_PAYMENT: '/cms/admin-regional-late-payment',
    ADMIN_REGIONAL_DOWNLOAD_CENTER: '/cms/admin-regional-download-center',
    ADMIN_REGIONAL_PENGATURAN: '/cms/admin-regional-pengaturan',

    ADMIN_FINANCE_DASHBOARD: '/cms/admin-finance-dashboard',
    ADMIN_FINANCE_VERIFIKASI: '/cms/admin-finance-verifikasi',
    ADMIN_FINANCE_LAPORAN: '/cms/admin-finance-laporan',
    ADMIN_FINANCE_HARGA: '/cms/admin-finance-harga',
    ADMIN_FINANCE_CLEARING: '/cms/admin-finance-clearing',
    ADMIN_FINANCE_REGIONAL_MONITORING: '/cms/admin-finance-regional-monitoring',
    ADMIN_FINANCE_PENGATURAN: '/cms/admin-finance-pengaturan',

    // SUPER_ADMIN_DASHBOARD: '/cms/super-admin-dashboard',
    SUPER_ADMIN_DASHBOARD: '/cms',
    SUPER_ADMIN_USER_MANAGEMENT: '/cms/super-admin-user-management',
    SUPER_ADMIN_SETTINGS: '/cms/super-admin-settings',
    SUPER_ADMIN_HIERARCHY: '/cms/super-admin-hierarchy',
    SUPER_ADMIN_FINANCE: '/cms/super-admin-finance',
    SUPER_ADMIN_HAK_AKSES: '/cms/super-admin-hak-akses',

    ADMIN_PUSAT_REGIONAL_DETAIL: '/cms/admin-pusat/regional/:id',
  },

  // Error Routes
  ERROR: {
    VERIFICATION_PENDING: '/verification-pending',
    ACCOUNT_REJECTED: '/account-rejected',
    FORBIDDEN: '/403',
    NOT_FOUND: '/404',
  },
} as const;

/**
 * Generate pesantren profile URL with specific nip
 */
export const pesantrenProfileUrl = (nip: string) => `/pesantren/${nip}`;

/**
 * Generate crew profile URL with specific nip and niamSuffix
 */
export const crewProfileUrl = (nip: string, niamSuffix: string) => `/pesantren/${nip}/crew/${niamSuffix}`;

/**
 * Generate admin pusat regional detail URL with specific id
 */
export const adminPusatRegionalDetailUrl = (id: string) => `/cms/admin-pusat/regional/${id}`;
