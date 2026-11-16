import { computed } from 'vue'
import { snakeCaseToTitleCase } from '../utils/formatters'

/**
 * Provides shared presentation and requirement logic for order documents.
 *
 * @param {import('vue').Ref<Array<object>>} documents
 * @param {import('vue').Ref<Array<object>>} requirements
 * @returns {object}
 */
export function useOrderDocuments(
  documents,
  requirements
) {
  const missingDocuments = computed(() => {
    return requirements.value.filter((requirement) => {
      return !documents.value.some((document) => {
        return documentSatisfiesRequirement(
          document,
          requirement
        )
      })
    })
  })

  const tableRows = computed(() => {
    const missing = missingDocuments.value.map((document) => ({
      id: `missing:${getMissingDocumentKey(document)}`,
      status: 'missing',
      isMissing: true,
      resource: document
    }))

    const provided = documents.value.map((document) => ({
      id: `document:${document.id}`,
      status: document.status,
      isMissing: false,
      resource: document
    }))

    return [
      ...missing,
      ...provided
    ]
  })

  /**
   * Determines whether a provided document satisfies a requirement.
   *
   * @param {object} document
   * @param {object} requirement
   * @returns {boolean}
   */
  function documentSatisfiesRequirement(
    document,
    requirement
  ) {
    if (requirement.type === 'id') {
      return document.type === 'id'
    }

    return (
      normalizeRegistration(
        getDocumentRegistration(document)
      ) ===
      normalizeRegistration(
        getDocumentRegistration(requirement)
      )
    )
  }

  /**
   * Returns badge options for a document status.
   *
   * @param {string|null|undefined} status
   * @returns {object}
   */
  function getStatusBadge(status) {
    const options = {
      approved: {
        label: 'Approved',
        className: 'badge-success'
      },
      missing: {
        label: 'Missing',
        className: 'badge-error'
      },
      rejected: {
        label: 'Rejected',
        className: 'badge-error'
      },
      pending: {
        label: 'Pending',
        className: 'badge-warning'
      }
    }

    return options[status] ?? {
      label: snakeCaseToTitleCase(status ?? 'unknown'),
      className: 'badge-neutral'
    }
  }

  /**
   * Returns a display label for a document type.
   *
   * @param {string|null|undefined} type
   * @returns {string}
   */
  function formatDocumentType(type) {
    return type
      ? snakeCaseToTitleCase(type)
      : 'Document'
  }

  /**
   * Returns the registration associated with a document or requirement.
   *
   * @param {object} document
   * @returns {string|null}
   */
  function getDocumentRegistration(document) {
    return (
      document?.registration ??
      document?.registration_index ??
      null
    )
  }

  /**
   * Returns the reference displayed for a document.
   *
   * @param {object} document
   * @returns {string}
   */
  function getDocumentReference(document) {
    if (document.type === 'id') {
      return document.subtype
        ? snakeCaseToTitleCase(document.subtype)
        : '—'
    }

    return getDocumentRegistration(document) ?? '—'
  }

  /**
   * Returns a stable key for a missing document requirement.
   *
   * @param {object} document
   * @returns {string}
   */
  function getMissingDocumentKey(document) {
    return [
      document.type,
      getDocumentRegistration(document) ?? 'none'
    ].join(':')
  }

  /**
   * Returns an upload requirement for the given resource.
   *
   * @param {object|null} document
   * @returns {object|null}
   */
  function getUploadRequirement(document) {
    if (!document) {
      return null
    }

    return {
      type: document.type,
      registration: getDocumentRegistration(document)
    }
  }

  /**
   * Returns a rejected document when it represents a replacement upload.
   *
   * @param {object|null} document
   * @returns {object|null}
   */
  function getReplacementDocument(document) {
    if (
      !document?.id ||
      document.status !== 'rejected'
    ) {
      return null
    }

    return document
  }

  /**
   * Normalises a registration for comparisons.
   *
   * @param {string|null|undefined} registration
   * @returns {string}
   */
  function normalizeRegistration(registration) {
    return String(registration ?? '')
      .toUpperCase()
      .replace(/\s+/g, '')
  }

  return {
    missingDocuments,
    tableRows,
    getStatusBadge,
    formatDocumentType,
    getDocumentRegistration,
    getDocumentReference,
    getMissingDocumentKey,
    getUploadRequirement,
    getReplacementDocument
  }
}
