
// Re-export all types and functions from the refactored modules
// This maintains backward compatibility with existing code

// Re-export types
export type {
  CallRecord,
  VapiCallData,
  VapiAssistantData,
  UserAssistantMapping
} from './types/callTypes';

// Re-export calls API functions
export {
  fetchCalls,
  fetchCallById,
  fetchAssistantDetails
} from './api/callsApi';

// Re-export user-assistant mappings API functions
export {
  getUserAssistantMappings,
  getUserAllowedAssistantIds,
  addUserAssistantMapping,
  removeUserAssistantMapping
} from './api/userAssistantApi';

// Re-export utility functions if needed elsewhere
export {
  formatDate,
  calculateDuration,
  processTranscript,
  mapVapiCallToCallRecord
} from './utils/callUtils';
