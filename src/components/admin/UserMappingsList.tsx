
import { X, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAssistantMapping, removeUserAssistantMapping } from "@/services/vapiService";
import { toast } from "sonner";

interface UserMappingsListProps {
  mappings: UserAssistantMapping[];
  filteredMappings: UserAssistantMapping[];
  userEmails: string[];
  searchTerm: string;
  isLoading: boolean;
  isSaving: boolean;
  onMappingRemoved: () => void;
}

export function UserMappingsList({
  mappings,
  filteredMappings,
  userEmails,
  searchTerm,
  isLoading,
  isSaving,
  onMappingRemoved
}: UserMappingsListProps) {
  const handleRemoveMapping = async (userEmail: string, assistantId: string) => {
    try {
      const success = await removeUserAssistantMapping(userEmail, assistantId);
      if (success) {
        onMappingRemoved();
        toast.success("Mapping removed successfully");
      }
    } catch (error) {
      toast.error("Failed to remove mapping");
      console.error("Error removing mapping:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">User Access Mappings</h3>
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {userEmails.length} users
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading mappings...
        </div>
      ) : filteredMappings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "No matching mappings found" : "No mappings yet"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMappings.map((mapping) => (
            <div key={mapping.userEmail} className="bg-muted/30 p-4 rounded-lg">
              <div className="flex flex-wrap justify-between items-center mb-2">
                <h4 className="font-medium">{mapping.userEmail}</h4>
                <span className="text-xs text-muted-foreground">
                  {mapping.assistantIds.length} assistant{mapping.assistantIds.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {mapping.assistantIds.map((assistantId) => (
                  <Badge key={assistantId} variant="secondary" className="flex items-center gap-1">
                    {assistantId}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveMapping(mapping.userEmail, assistantId)}
                      disabled={isSaving}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
