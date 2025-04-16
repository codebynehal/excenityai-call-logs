import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Plus, Search, Users, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserAssistantMappings, addUserAssistantMapping, removeUserAssistantMapping, UserAssistantMapping } from "@/services/vapiService";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPanel() {
  const { isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [userMappings, setUserMappings] = useState<UserAssistantMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [newAssistantId, setNewAssistantId] = useState("");
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/calls");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const loadMappings = async () => {
      setIsLoading(true);
      try {
        const mappings = await getUserAssistantMappings();
        setUserMappings(mappings);
      } catch (error) {
        console.error("Error loading mappings:", error);
        toast.error("Failed to load user mappings");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMappings();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_user_emails_for_admin');
        
        if (error) {
          throw error;
        }
        
        const emails = data.map(user => user.email);
        setUserEmails(emails);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users: " + (error.message || "Unknown error"));
        
        const existingEmails = userMappings.map(mapping => mapping.userEmail);
        if (existingEmails.length > 0) {
          setUserEmails(existingEmails);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, userMappings]);

  const handleAddMapping = async () => {
    if (!selectedUserEmail || !newAssistantId) {
      toast.error("Please select a user and enter an assistant ID");
      return;
    }

    setIsSaving(true);
    try {
      const success = await addUserAssistantMapping(selectedUserEmail, newAssistantId);
      if (success) {
        const mappings = await getUserAssistantMappings();
        setUserMappings(mappings);
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

  const handleRemoveMapping = async (userEmail: string, assistantId: string) => {
    setIsSaving(true);
    try {
      const success = await removeUserAssistantMapping(userEmail, assistantId);
      if (success) {
        const mappings = await getUserAssistantMappings();
        setUserMappings(mappings);
        toast.success("Mapping removed successfully");
      }
    } catch (error) {
      toast.error("Failed to remove mapping");
      console.error("Error removing mapping:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMappings = userMappings.filter(mapping => 
    mapping.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.assistantIds.some(id => id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container py-8 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>
              Manage user access to assistants
            </CardDescription>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium">Add New Assistant Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userEmail">User Email</Label>
                <Select value={selectedUserEmail} onValueChange={setSelectedUserEmail}>
                  <SelectTrigger id="userEmail" className="w-full">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">Loading users...</div>
                    ) : userEmails.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">No users found</div>
                    ) : (
                      userEmails.map(email => (
                        <SelectItem key={email} value={email}>
                          {email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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

          <Separator />

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
        </CardContent>
      </Card>
    </div>
  );
}
