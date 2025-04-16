
// Define the types for the API responses
export interface CallRecord {
  id: string;
  callType: "outboundPhoneCall" | "inboundPhoneCall";
  customerPhone: string;
  assistantPhone: string;
  agentName: string;
  assistantId: string;
  date: string;
  time: string;
  duration: string;
  endReason: string;
  recordingUrl?: string;
  summary?: string;
  transcript?: {
    time: string;
    speaker: string;
    message: string;
  }[];
}

// Raw call data from the API
export interface VapiCallData {
  id: string;
  assistantId: string;
  phoneNumberId: string;
  type: string;
  startedAt: string;
  endedAt: string | null;
  transcript?: string;
  recordingUrl?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  cost: number;
  customer: {
    number: string;
  };
  status: string;
  endedReason: string;
  assistant: {
    id: string;
    name: string;
    phoneNumber?: string;
  };
  phoneNumber?: {
    number: string;
  };
}

// User-assistant mappings interface
export interface UserAssistantMapping {
  userEmail: string;
  assistantIds: string[];
}
