
import { CallRecord, VapiCallData } from "../types/callTypes";

// Format the date for display
export const formatDate = (dateString: string): { date: string; time: string } => {
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
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate call duration in seconds
export const calculateDuration = (startedAt: string, endedAt: string | null): number => {
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
export const processTranscript = (transcriptString: string | undefined, startTime: number): {
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
export const mapVapiCallToCallRecord = (vapiCall: VapiCallData): CallRecord => {
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
