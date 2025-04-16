
import { toast } from "sonner";
import { CallRecord, VapiCallData, VapiAssistantData } from "../types/callTypes";
import { mapVapiCallToCallRecord } from "../utils/callUtils";
import { supabase } from "@/integrations/supabase/client";

// API Service
const VAPI_API_KEY = "67ee4ce1-384f-47f2-9b2d-2127fb658dc7";

// Cache for assistant details to avoid duplicate API calls
const assistantDetailsCache: Record<string, VapiAssistantData> = {};

// Helper function to get user's allowed assistant IDs
const getUserAssistantIds = async (userEmail: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_assistant_mappings')
      .select('assistant_id')
      .eq('user_email', userEmail.toLowerCase());
    
    if (error) {
      console.error("Error fetching user's assistant IDs:", error);
      return [];
    }
    
    return data.map(item => item.assistant_id);
  } catch (error) {
    console.error("Failed to get user's assistant IDs:", error);
    return [];
  }
};

// Fetch assistant details from Vapi API and cache the results
export const fetchAssistantDetails = async (assistantId: string): Promise<VapiAssistantData | null> => {
  try {
    // Check if we already have cached details for this assistant
    if (assistantDetailsCache[assistantId]) {
      console.log(`Using cached details for assistant ID: ${assistantId}`);
      return assistantDetailsCache[assistantId];
    }
    
    console.log(`Fetching details for assistant ID: ${assistantId}`);
    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        "Authorization": `Bearer ${VAPI_API_KEY}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Assistant with ID ${assistantId} not found`);
        return null;
      }
      throw new Error(`Failed to fetch assistant details. Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Retrieved assistant details for ${assistantId}:`, data);
    
    // Cache the assistant details for future use
    assistantDetailsCache[assistantId] = data;
    
    return data;
  } catch (error) {
    console.error(`Error fetching assistant details for ${assistantId}:`, error);
    return null;
  }
};

export const fetchCalls = async (userEmail?: string | null): Promise<CallRecord[]> => {
  try {
    // Get user's assistant IDs if email is provided
    let assistantIds: string[] = [];
    let queryParams = '';
    
    if (userEmail) {
      assistantIds = await getUserAssistantIds(userEmail);
      console.log("User's allowed assistant IDs:", assistantIds);
      
      // If user has no assigned assistants, return empty array
      if (assistantIds.length === 0) {
        console.log("User has no assigned assistants, returning empty call list");
        return [];
      }
      
      // Construct query parameters for filtering by assistant IDs
      queryParams = assistantIds.map(id => `assistantId=${id}`).join('&');
      if (queryParams) {
        queryParams = '?' + queryParams;
      }
    }
    
    // Make API call with assistant ID filter if available
    const url = `https://api.vapi.ai/call${queryParams}`;
    console.log("Fetching calls with URL:", url);
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${VAPI_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: VapiCallData[] = await response.json();
    console.log("API response data:", data); // Debug log
    
    // If assistantIds is not empty, double-check filtering on client side
    // (this is a safety check in case the API filtering doesn't work as expected)
    let filteredData = data;
    if (assistantIds.length > 0) {
      filteredData = data.filter(call => 
        assistantIds.includes(call.assistantId)
      );
    }
    
    // Pre-fetch all unique assistant details to avoid multiple API calls
    const uniqueAssistantIds = [...new Set(filteredData.map(call => call.assistantId))];
    console.log("Unique assistant IDs:", uniqueAssistantIds);
    
    // Fetch all assistant details in parallel and store in cache
    await Promise.all(
      uniqueAssistantIds.map(async (assistantId) => {
        if (!assistantDetailsCache[assistantId]) {
          await fetchAssistantDetails(assistantId);
        }
      })
    );
    
    // Process calls with cached assistant details
    const enrichedCalls = filteredData
      .filter(call => call && call.id) // Filter out any null or invalid calls
      .map(call => {
        // If the call doesn't already have assistant name/details
        if (!call.assistant?.name && call.assistantId) {
          const assistantDetails = assistantDetailsCache[call.assistantId];
          if (assistantDetails) {
            // Enrich the call data with assistant details
            call.assistant = {
              ...call.assistant,
              id: call.assistantId,
              name: assistantDetails.name || "Unnamed Assistant"
            };
          }
        }
        return mapVapiCallToCallRecord(call);
      });
    
    return enrichedCalls;
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
    
    // If the call doesn't have assistant details, get them from cache or fetch
    if (!data.assistant?.name && data.assistantId) {
      if (!assistantDetailsCache[data.assistantId]) {
        // If not in cache, fetch and cache it
        const assistantDetails = await fetchAssistantDetails(data.assistantId);
        if (assistantDetails) {
          // Cache for future use
          assistantDetailsCache[data.assistantId] = assistantDetails;
        }
      }
      
      // Get from cache (whether it was already there or just fetched)
      const cachedDetails = assistantDetailsCache[data.assistantId];
      if (cachedDetails) {
        // Enrich the call data with assistant details
        data.assistant = {
          ...data.assistant,
          id: data.assistantId,
          name: cachedDetails.name || "Unnamed Assistant"
        };
      }
    }
    
    return mapVapiCallToCallRecord(data);
  } catch (error) {
    console.error(`Failed to fetch call ${callId}:`, error);
    toast.error("Failed to load call details. Please try again later.");
    return null;
  }
};
