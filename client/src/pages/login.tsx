import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple hardcoded authentication
    if (username === "leoneves484" && password === "leonevesforever") {
      // Store authentication in localStorage
      localStorage.setItem("isAuthenticated", "true");
      
      // Show success toast
      toast({
        title: "Login successful",
        description: "Welcome to the store management."
      });
      
      // Redirect to store management
      setLocation("/store");
    } else {
      // Show error toast
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 border border-white/20">
        <div className="text-center">
          <h1 className="logo text-2xl mb-6">Store Management</h1>
          <p className="text-white/70">Please login to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent border-white/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-white/20"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-zinc-700 hover:bg-zinc-600"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
} 