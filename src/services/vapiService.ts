
import { toast } from "sonner";

// Define the types for the API responses
export interface CallRecord {
  id: string;
  callType: "outboundPhoneCall" | "inboundPhoneCall";
  customerPhone: string;
  agentName: string;
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
  assistant_id: string;
  server_kind: string;
  phone_number_id: string;
  from: string;
  to: string;
  direction: string;
  status: string;
  duration: number;
  started_at: string;
  ended_at: string | null;
  minutes_used: number;
  assistant: {
    id: string;
    name: string;
  };
  recording_url?: string;
  transcript?: {
    role: string;
    content: string;
    timestamp: number;
  }[];
  summary?: string;
}

// Format the date for display
const formatDate = (dateString: string): { date: string; time: string } => {
  const date = new Date(dateString);
  return {
    date: date.toISOString().split('T')[0],
    time: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  };
};

// Format duration from seconds to MM:SS format
const formatDuration = (seconds: number): string => {
  if (seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Map the API response to our app's format
const mapVapiCallToCallRecord = (vapiCall: VapiCallData): CallRecord => {
  const { date, time } = formatDate(vapiCall.started_at);
  
  // Determine call type from direction
  const callType = vapiCall.direction === "inbound" ? "inboundPhoneCall" : "outboundPhoneCall";
  
  // Determine end reason based on status
  let endReason = "completed";
  if (vapiCall.status === "no-answer") endReason = "missed";
  else if (vapiCall.status === "busy") endReason = "busy";
  else if (vapiCall.status === "failed") endReason = "failed";
  
  // Map transcript format if available
  let transcript = undefined;
  if (vapiCall.transcript && vapiCall.transcript.length > 0) {
    const startTime = new Date(vapiCall.started_at).getTime();
    
    transcript = vapiCall.transcript.map(entry => {
      // Calculate the timestamp in MM:SS format
      const elapsedSeconds = (entry.timestamp - startTime) / 1000;
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = Math.floor(elapsedSeconds % 60);
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      return {
        time: timeString,
        speaker: entry.role === "assistant" ? "AI" : "Customer",
        message: entry.content
      };
    });
  }
  
  return {
    id: vapiCall.id,
    callType,
    customerPhone: callType === "inboundPhoneCall" ? vapiCall.from : vapiCall.to,
    agentName: vapiCall.assistant.name,
    date,
    time,
    duration: formatDuration(vapiCall.duration || 0),
    endReason,
    recordingUrl: vapiCall.recording_url,
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
    return data.map(mapVapiCallToCallRecord);
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
    return mapVapiCallToCallRecord(data);
  } catch (error) {
    console.error(`Failed to fetch call ${callId}:`, error);
    toast.error("Failed to load call details. Please try again later.");
    return null;
  }
};
