
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserAssistantMappings, addUserAssistantMapping, removeUserAssistantMapping, UserAssistantMapping } from "@/services/vapiService";

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userMappings, setUserMappings] = useState<UserAssistantMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newAssistantId, setNewAssistantId] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/calls");
    }
  }, [isAdmin, navigate]);

  // Load user mappings
  useEffect(() => {
    setUserMappings(getUserAssistantMappings());
  }, []);

  const handleAddMapping = () => {
    if (!newUserEmail || !newAssistantId) {
      toast.error("Please enter both email and assistant ID");
      return;
    }

    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(newUserEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      addUserAssistantMapping(newUserEmail, newAssistantId);
      setUserMappings(getUserAssistantMappings());
      toast.success(`Assistant added for ${newUserEmail}`);
      setNewAssistantId("");
    } catch (error) {
      toast.error("Failed to add mapping");
    }
  };

  const handleRemoveMapping = (userEmail: string, assistantId: string) => {
    try {
      removeUserAssistantMapping(userEmail, assistantId);
      setUserMappings(getUserAssistantMappings());
      toast.success("Mapping removed successfully");
    } catch (error) {
      toast.error("Failed to remove mapping");
    }
  };

  // Filter mappings based on search term
  const filteredMappings = userMappings.filter(mapping => 
    mapping.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.assistantIds.some(id => id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>
            Manage user access to assistants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users or assistant IDs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Add new mapping */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium">Add New Assistant Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userEmail">User Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
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
            <Button onClick={handleAddMapping} className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Access
            </Button>
          </div>

          <Separator />

          {/* User mappings list */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">User Access Mappings</h3>
            
            {filteredMappings.length === 0 ? (
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
        </CardContent>
      </Card>
    </div>
  );
}
