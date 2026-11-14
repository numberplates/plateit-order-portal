const defaults = {
  loginTitle: 'Access Your Order',
  loginButtonText: 'Access Order',
  loginIntroduction: 'View your order details and use the secure document portal to upload any supporting documents we require.',
  logoUrl: null,
  logoAlt: ''
}

const localDefaultsModules = import.meta.glob('../../config/defaults.js', {
  eager: true,
  import: 'default'
})
const localDefaults = localDefaultsModules['../../config/defaults.js'] ?? {}

// Optional local overrides: one default-exported object per company ID.
// Vite includes matching files at build time; an absent directory is fine.
const modules = import.meta.glob('../../config/companies/*.js', {
  eager: true,
  import: 'default'
})

export const companies = Object.fromEntries(
  Object.entries(modules).map(([path, config]) => [
    path.split('/').pop().replace(/\.js$/, ''),
    config
  ])
)

export function getCompanyConfig(companyId) {
  const overrides = Object.hasOwn(companies, companyId) ? companies[companyId] : {}
  return { ...defaults, ...localDefaults, ...overrides }
}
