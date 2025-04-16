
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addUserAssistantMapping } from "@/services/vapiService";

interface AddAssistantAccessProps {
  userEmails: string[];
  onMappingAdded: () => void;
  isSaving: boolean;
  setIsSaving: (value: boolean) => void;
}

export function AddAssistantAccess({ 
  userEmails, 
  onMappingAdded, 
  isSaving, 
  setIsSaving 
}: AddAssistantAccessProps) {
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [newAssistantId, setNewAssistantId] = useState("");

  const handleAddMapping = async () => {
    if (!selectedUserEmail || !newAssistantId) {
      toast.error("Please enter a user email and an assistant ID");
      return;
    }

    setIsSaving(true);
    try {
      const success = await addUserAssistantMapping(selectedUserEmail, newAssistantId);
      if (success) {
        onMappingAdded();
        toast.success(`Assistant added for ${selectedUserEmail}`);
        setNewAssistantId("");
      }
    } catch (error) {
      toast.error("Failed to add mapping");
      console.error("Error adding mapping:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
      <h3 className="text-sm font-medium">Add New Assistant Access</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="userEmail">User Email</Label>
          <Input
            id="userEmail"
            placeholder="user@example.com"
            value={selectedUserEmail}
            onChange={(e) => setSelectedUserEmail(e.target.value)}
            list="user-emails"
          />
          <datalist id="user-emails">
            {userEmails.map(email => (
              <option key={email} value={email} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="assistantId">Assistant ID</Label>
          <Input
            id="assistantId"
            placeholder="assistant-123"
            value={newAssistantId}
            onChange={(e) => setNewAssistantId(e.target.value)}
          />
        </div>
      </div>
      <Button 
        onClick={handleAddMapping} 
        className="w-full" 
        size="sm"
        disabled={isSaving || !selectedUserEmail || !newAssistantId}
      >
        {isSaving ? "Adding..." : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add Access
          </>
        )}
      </Button>
    </div>
  );
}
