
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
    // Try to parse as JSON first
    const parsed = JSON.parse(rawTranscript);
    
    // Check if it's the artifact.messagesOpenAIFormatted format
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      // If it has the expected openAI format properties, process accordingly
      if (parsed[0] && (parsed[0].role !== undefined || parsed[0].speaker !== undefined)) {
        // Skip the first item if it exists and return properly formatted transcript
        const skippedFirstItem = parsed.slice(1);
        
        return skippedFirstItem.map((item: any, index: number) => {
          // Handle role-based format (OpenAI)
          if (item.role !== undefined && item.content !== undefined) {
            return {
              time: new Date(Date.now() - (skippedFirstItem.length - index) * 30000).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }),
              speaker: item.role === "assistant" ? "AI" : "Customer",
              message: item.content
            };
          }
          
          // Handle speaker-based format
          return {
            time: item.time || new Date(Date.now() - (skippedFirstItem.length - index) * 30000).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            speaker: item.speaker || (item.role === "assistant" ? "AI" : "Customer"),
            message: item.message || item.content || ""
          };
        });
      }
    }
    
    // If parsed but not in expected format, return basic format
    return parsed;
  } catch (error) {
    console.warn("Failed to parse transcript as JSON:", error);
    
    // Check if it's a text-based format with AI/Customer prefixes
    if (typeof rawTranscript === "string") {
      // Pattern matching for "AI: " or "Customer: " prefixed lines
      const lines = rawTranscript.split(/\n+/);
      const messages = [];
      
      for (const line of lines) {
        if (line.trim()) {
          const aiMatch = line.match(/^AI:\s*(.*)/i);
          const customerMatch = line.match(/^Customer:\s*(.*)/i);
          
          if (aiMatch) {
            messages.push({
              time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              speaker: "AI",
              message: aiMatch[1].trim()
            });
          } else if (customerMatch) {
            messages.push({
              time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              speaker: "Customer",
              message: customerMatch[1].trim()
            });
          } else {
            // If no match, add as customer message
            messages.push({
              time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              speaker: "Unknown",
              message: line.trim()
            });
          }
        }
      }
      
      return messages.length ? messages : [{
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        speaker: "Unknown",
        message: rawTranscript
      }];
    }
    
    return rawTranscript ? [{
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
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
