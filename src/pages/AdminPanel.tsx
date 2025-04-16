
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserAssistantMappings, UserAssistantMapping } from "@/services/vapiService";
import { supabase } from "@/integrations/supabase/client";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { AddAssistantAccess } from "@/components/admin/AddAssistantAccess";
import { UserMappingsList } from "@/components/admin/UserMappingsList";

export default function AdminPanel() {
  const { isAdmin, adminSignOut } = useAuth();
  const navigate = useNavigate();
  const [userMappings, setUserMappings] = useState<UserAssistantMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/calls");
    }
  }, [isAdmin, navigate]);

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

  useEffect(() => {
    loadMappings();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Simplify the user fetching - just get existing mappings
        const { data: mappingsData, error: mappingsError } = await supabase
          .from('user_assistant_mappings')
          .select('user_email')
          .order('user_email');

        if (mappingsError) throw mappingsError;
        
        const mappingEmails = [...new Set(mappingsData.map(item => item.user_email))];
        
        if (mappingEmails.length > 0) {
          setUserEmails(mappingEmails);
          console.log("Using mapping emails:", mappingEmails);
        } else {
          setUserEmails([]);
          console.log("No existing user emails found");
        }
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users: " + (error.message || "Unknown error"));
        setUserEmails([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, userMappings]);

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
            onClick={adminSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <AdminSearch 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />

          <AddAssistantAccess 
            userEmails={userEmails}
            onMappingAdded={loadMappings}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
          />

          <Separator />

          <UserMappingsList 
            mappings={userMappings}
            filteredMappings={filteredMappings}
            userEmails={userEmails}
            searchTerm={searchTerm}
            isLoading={isLoading}
            isSaving={isSaving}
            onMappingRemoved={loadMappings}
          />
        </CardContent>
      </Card>
    </div>
  );
}
