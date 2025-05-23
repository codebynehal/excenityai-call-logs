import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, name);
      
      if (error) {
        toast.error("Sign up failed", {
          description: error.message
        });
      } else {
        toast.success("Account created successfully", {
          description: "Please check your email to verify your account"
        });
      }
    } catch (err: any) {
      toast.error("Sign up failed", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-zinc-900">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="orange-gradient rounded-full p-3 mb-2">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-white">
            Excenity AI
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-Powered Call Monitoring Dashboard
          </p>
        </div>

        <Card className="border-0 card-gradient shadow-xl">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full orange-gradient hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
              <p className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/" className="font-medium text-orange-400 hover:text-orange-300">
                  Login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
