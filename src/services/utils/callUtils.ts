
import { CallRecord, VapiCallData } from "../types/callTypes";

// Format date from ISO string to MM/DD/YYYY
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

// Format time from ISO string to HH:MM AM/PM
export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Calculate duration between two ISO timestamps
export const calculateDuration = (startTime: string, endTime: string | null): string => {
  if (!endTime) return "In progress";
  
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Process transcript data from API
export const processTranscript = (rawTranscript: string | undefined): any[] => {
  if (!rawTranscript) return [];
  
  try {
    // Try to parse the transcript as JSON
    return JSON.parse(rawTranscript);
  } catch (error) {
    // If parsing fails, return the raw transcript as a single message
    console.warn("Failed to parse transcript as JSON:", error);
    return rawTranscript ? [{
      time: new Date().toISOString(),
      speaker: "Unknown",
      message: rawTranscript
    }] : [];
  }
};

// Map API call data to our CallRecord format
export const mapVapiCallToCallRecord = (call: VapiCallData): CallRecord => {
  const formattedDate = formatDate(call.startedAt);
  const formattedTime = formatTime(call.startedAt);
  const duration = calculateDuration(call.startedAt, call.endedAt || "");
  const transcript = processTranscript(call.transcript);
  
  return {
    id: call.id,
    callType: call.type as "inboundPhoneCall" | "outboundPhoneCall",
    customerPhone: call.customer?.number || "Unknown",
    assistantPhone: call.phoneNumber?.number || "Unknown",
    agentName: call.assistant?.name || "Unknown Agent",
    assistantId: call.assistantId,
    assistantName: call.assistant?.name || "Unknown Assistant", // Map assistant name
    date: formattedDate,
    time: formattedTime,
    duration,
    endReason: call.endedReason || "Unknown",
    recordingUrl: call.recordingUrl,
    summary: call.summary,
    transcript
  };
};
