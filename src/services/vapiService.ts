import { toast } from "sonner";

// Define the types for the API responses
export interface CallRecord {
  id: string;
  callType: "outboundPhoneCall" | "inboundPhoneCall";
  customerPhone: string;
  assistantPhone: string; // Added assistant phone number
  agentName: string;
  assistantId: string; // Added assistant ID for filtering
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
    phoneNumber?: string; // Phone number might be in assistant object
  };
  phoneNumber?: {
    number: string; // Phone number might be in phoneNumber object
  };
}

// Format the date for display
const formatDate = (dateString: string): { date: string; time: string } => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    
    return {
      date: date.toISOString().split('T')[0],
      time: new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(date)
    };
  } catch (error) {
    console.error("Error formatting date:", error);
    return {
      date: "N/A",
      time: "N/A"
    };
  }
};

// Format duration from seconds to MM:SS format
const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate call duration in seconds
const calculateDuration = (startedAt: string, endedAt: string | null): number => {
  if (!startedAt || !endedAt) return 0;
  
  try {
    const start = new Date(startedAt).getTime();
    const end = new Date(endedAt).getTime();
    
    if (isNaN(start) || isNaN(end)) return 0;
    
    return Math.max(0, (end - start) / 1000);
  } catch (error) {
    console.error("Error calculating duration:", error);
    return 0;
  }
};

// Process transcript string to structured format
const processTranscript = (transcriptString: string | undefined, startTime: number): {
  time: string;
  speaker: string;
  message: string;
}[] | undefined => {
  if (!transcriptString) return undefined;
  
  try {
    const lines = transcriptString.split('\n').filter(line => line.trim());
    return lines.map(line => {
      // Simple parsing based on "AI:" or "User:" prefixes
      const isSpeakerAI = line.startsWith('AI:');
      const isSpeakerUser = line.startsWith('User:');
      
      let speaker = "Unknown";
      let message = line;
      
      if (isSpeakerAI) {
        speaker = "AI";
        message = line.substring(3).trim();
      } else if (isSpeakerUser) {
        speaker = "Customer";
        message = line.substring(5).trim();
      }
      
      // Use a placeholder timestamp since the API doesn't provide per-message timestamps
      return {
        time: "0:00", // Placeholder
        speaker,
        message
      };
    });
  } catch (error) {
    console.error("Error processing transcript:", error);
    return undefined;
  }
};

// Map the API response to our app's format
const mapVapiCallToCallRecord = (vapiCall: VapiCallData): CallRecord => {
  // Use safe date formatting
  const { date, time } = formatDate(vapiCall.startedAt);
  
  // Determine call type from direction (inbound/outbound)
  // In the updated API, this is stored in the "type" field
  const callType = vapiCall.type === "inboundPhoneCall" ? "inboundPhoneCall" : "outboundPhoneCall";
  
  // Calculate duration
  const durationSeconds = calculateDuration(vapiCall.startedAt, vapiCall.endedAt);
  
  // Determine end reason based on status or endedReason
  let endReason = "completed";
  if (vapiCall.status === "no-answer" || vapiCall.endedReason === "no-answer") endReason = "missed";
  else if (vapiCall.status === "busy" || vapiCall.endedReason === "busy") endReason = "busy";
  else if (vapiCall.status === "failed" || vapiCall.endedReason === "failed") endReason = "failed";
  else if (vapiCall.endedReason === "customer-ended-call") endReason = "completed";
  
  // Parse transcript if available
  let transcript = undefined;
  if (vapiCall.transcript) {
    const startTime = new Date(vapiCall.startedAt).getTime();
    transcript = processTranscript(vapiCall.transcript, startTime);
  }
  
  // Determine the customer phone number
  const customerPhone = vapiCall.customer?.number || "Unknown";
  
  // Determine the assistant phone number
  const assistantPhone = vapiCall.phoneNumber?.number || 
                        vapiCall.assistant?.phoneNumber || 
                        "Unknown";

  return {
    id: vapiCall.id,
    callType,
    customerPhone,
    assistantPhone,
    agentName: vapiCall.assistant?.name || "Unknown",
    assistantId: vapiCall.assistantId || "Unknown",
    date,
    time,
    duration: formatDuration(durationSeconds),
    endReason,
    recordingUrl: vapiCall.recordingUrl,
    summary: vapiCall.summary,
    transcript
  };
};

// API Service
const VAPI_API_KEY = "67ee4ce1-384f-47f2-9b2d-2127fb658dc7";

export const fetchCalls = async (): Promise<CallRecord[]> => {
  try {
    const response = await fetch("https://api.vapi.ai/call", {
      headers: {
        "Authorization": `Bearer ${VAPI_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: VapiCallData[] = await response.json();
    console.log("API response data:", data); // Debug log
    
    return data
      .filter(call => call && call.id) // Filter out any null or invalid calls
      .map(mapVapiCallToCallRecord);
  } catch (error) {
    console.error("Failed to fetch calls:", error);
    toast.error("Failed to load calls. Please try again later.");
    return [];
  }
};

export const fetchCallById = async (callId: string): Promise<CallRecord | null> => {
  try {
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: {
        "Authorization": `Bearer ${VAPI_API_KEY}`
      }
    });
    
    if (!response.ok) {
      // If it's a 404, we return null rather than throwing
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: VapiCallData = await response.json();
    console.log("Call detail response:", data); // Debug log
    
    return mapVapiCallToCallRecord(data);
  } catch (error) {
    console.error(`Failed to fetch call ${callId}:`, error);
    toast.error("Failed to load call details. Please try again later.");
    return null;
  }
};

// Local storage functions for user-assistant mappings
export interface UserAssistantMapping {
  userEmail: string;
  assistantIds: string[];
}

const USER_ASSISTANT_MAPPINGS_KEY = 'user_assistant_mappings';

export const getUserAssistantMappings = (): UserAssistantMapping[] => {
  const mappingsStr = localStorage.getItem(USER_ASSISTANT_MAPPINGS_KEY);
  return mappingsStr ? JSON.parse(mappingsStr) : [];
};

export const saveUserAssistantMappings = (mappings: UserAssistantMapping[]): void => {
  localStorage.setItem(USER_ASSISTANT_MAPPINGS_KEY, JSON.stringify(mappings));
};

export const getUserAllowedAssistantIds = (userEmail: string): string[] => {
  const mappings = getUserAssistantMappings();
  const userMapping = mappings.find(m => m.userEmail.toLowerCase() === userEmail.toLowerCase());
  return userMapping?.assistantIds || [];
};

export const addUserAssistantMapping = (userEmail: string, assistantId: string): void => {
  const mappings = getUserAssistantMappings();
  const existingIndex = mappings.findIndex(m => m.userEmail.toLowerCase() === userEmail.toLowerCase());
  
  if (existingIndex >= 0) {
    // User exists, add assistant if not already mapped
    if (!mappings[existingIndex].assistantIds.includes(assistantId)) {
      mappings[existingIndex].assistantIds.push(assistantId);
    }
  } else {
    // New user
    mappings.push({
      userEmail,
      assistantIds: [assistantId]
    });
  }
  
  saveUserAssistantMappings(mappings);
};

export const removeUserAssistantMapping = (userEmail: string, assistantId: string): void => {
  const mappings = getUserAssistantMappings();
  const existingIndex = mappings.findIndex(m => m.userEmail.toLowerCase() === userEmail.toLowerCase());
  
  if (existingIndex >= 0) {
    // Filter out the assistant ID
    mappings[existingIndex].assistantIds = mappings[existingIndex].assistantIds.filter(
      id => id !== assistantId
    );
    
    // Remove the user if they have no assistants left
    if (mappings[existingIndex].assistantIds.length === 0) {
      mappings.splice(existingIndex, 1);
    }
    
    saveUserAssistantMappings(mappings);
  }
};
