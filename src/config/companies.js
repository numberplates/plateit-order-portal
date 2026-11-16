const defaults = {
  loginTitle: 'Access Your Order',
  loginButtonText: 'Access Order',
  loginOrderNumberLabel: 'Order Number',
  loginEmailLabel: 'Email Address',
  loginRequireConfirmationLink: false,
  loginMalformedLinkMessage: 'You have followed a malformed link. Please use the complete confirmation link you have been sent.',
  // Null uses the appropriate default for editable or link-only login.
  loginExpiryMessage: null,
  loginIntroduction: 'View your order details and use the secure document portal to upload any supporting documents we require.',
  logoUrl: null,
  logoAlt: '',
  faviconUrl: '/favicon.svg'
}

const localDefaultsModules = import.meta.glob('../../overrides/shared/config.js', {
  eager: true,
  import: 'default'
})
const localDefaults = localDefaultsModules['../../overrides/shared/config.js'] ?? {}

// Optional company overrides: one default-exported config object per company directory.
// Vite includes matching files at build time; an absent directory is fine.
const modules = import.meta.glob('../../overrides/companies/*/config.js', {
  eager: true,
  import: 'default'
})

export const companies = Object.fromEntries(
  Object.entries(modules).map(([path, config]) => [
    path.split('/').at(-2),
    config
  ])
)

export function getCompanyConfig(companyId) {
  const overrides = Object.hasOwn(companies, companyId) ? companies[companyId] : {}
  return { ...defaults, ...localDefaults, ...overrides }
}
