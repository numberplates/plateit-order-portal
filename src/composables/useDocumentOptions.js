const options = {
  id: [
    { label: 'Driving Licence', value: 'driving_licence' },
    { label: 'Passport', value: 'passport' }
  ],
  entitlement: [
    { label: 'V5C Registration Certificate', value: 'v5c' },
    { label: 'V750 Certificate', value: 'v750' },
    { label: 'V778 Retention Document', value: 'v778' },
    { label: 'Fleet Authorisation', value: 'fleet_auth' }
  ]
}

/**
 * Provides document subtype options.
 *
 * Adjust these values to mirror the canonical options used by the API.
 *
 * @returns {object}
 */
export function useDocumentOptions() {
  /**
   * Returns subtype options for a requirement type.
   *
   * @param {string|null|undefined} type
   * @returns {Array<object>}
   */
  function getSubtypeOptions(type) {
    return options[type] ?? []
  }

  return {
    getSubtypeOptions
  }
}
