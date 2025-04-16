
import { toast } from "sonner";
import { CallRecord, VapiCallData } from "../types/callTypes";
import { mapVapiCallToCallRecord } from "../utils/callUtils";

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
