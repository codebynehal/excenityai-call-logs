
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserAssistantMapping } from "../types/callTypes";

// Get all user-assistant mappings from Supabase
export const getUserAssistantMappings = async (): Promise<UserAssistantMapping[]> => {
  try {
    const { data, error } = await supabase
      .from('user_assistant_mappings')
      .select('user_email, assistant_id');
    
    if (error) {
      console.error("Error fetching user mappings:", error);
      toast.error("Failed to load user mappings");
      return [];
    }
    
    // Group by user_email
    const mappings: UserAssistantMapping[] = [];
    const emailMap: Record<string, string[]> = {};
    
    data.forEach(item => {
      if (!emailMap[item.user_email]) {
        emailMap[item.user_email] = [];
      }
      emailMap[item.user_email].push(item.assistant_id);
    });
    
    // Convert to array format
    Object.keys(emailMap).forEach(userEmail => {
      mappings.push({
        userEmail,
        assistantIds: emailMap[userEmail]
      });
    });
    
    return mappings;
  } catch (error) {
    console.error("Error in getUserAssistantMappings:", error);
    toast.error("Failed to load user mappings");
    return [];
  }
};

// Get allowed assistant IDs for a specific user
export const getUserAllowedAssistantIds = async (userEmail: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_assistant_mappings')
      .select('assistant_id')
      .eq('user_email', userEmail.toLowerCase());
    
    if (error) {
      console.error("Error fetching user allowed assistants:", error);
      return [];
    }
    
    return data.map(item => item.assistant_id);
  } catch (error) {
    console.error("Error in getUserAllowedAssistantIds:", error);
    return [];
  }
};

// Add a new user-assistant mapping
export const addUserAssistantMapping = async (userEmail: string, assistantId: string): Promise<boolean> => {
  try {
    // Check if mapping already exists
    const { data: existingData, error: checkError } = await supabase
      .from('user_assistant_mappings')
      .select('id')
      .eq('user_email', userEmail.toLowerCase())
      .eq('assistant_id', assistantId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("Error checking existing mapping:", checkError);
      toast.error("Failed to check existing mapping");
      return false;
    }
    
    // If mapping already exists, just return success
    if (existingData) {
      return true;
    }
    
    // Insert new mapping
    const { error } = await supabase
      .from('user_assistant_mappings')
      .insert({
        user_email: userEmail.toLowerCase(),
        assistant_id: assistantId
      });
    
    if (error) {
      console.error("Error adding user mapping:", error);
      toast.error("Failed to add user mapping");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in addUserAssistantMapping:", error);
    toast.error("Failed to add user mapping");
    return false;
  }
};

// Remove a user-assistant mapping
export const removeUserAssistantMapping = async (userEmail: string, assistantId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_assistant_mappings')
      .delete()
      .eq('user_email', userEmail.toLowerCase())
      .eq('assistant_id', assistantId);
    
    if (error) {
      console.error("Error removing user mapping:", error);
      toast.error("Failed to remove user mapping");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removeUserAssistantMapping:", error);
    toast.error("Failed to remove user mapping");
    return false;
  }
};
