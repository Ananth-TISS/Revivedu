import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    
    const result = await signup(formData.name, formData.email, formData.password);
    
    if (result.success) {
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 py-12">
        <Button
          data-testid="back-home-btn"
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="rounded-3xl border-border/50 shadow-pop" data-testid="signup-card">
          <CardHeader>
            <CardTitle className="text-3xl text-secondary">Create Account</CardTitle>
            <CardDescription>Join Revivedu and start your child's learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base mb-2 block">Full Name</Label>
                <Input
                  id="name"
                  data-testid="name-input"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-xl border-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-base mb-2 block">Email</Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  placeholder="parent@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 rounded-xl border-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-base mb-2 block">Password</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 rounded-xl border-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-base mb-2 block">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  data-testid="confirm-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-12 rounded-xl border-2"
                  required
                />
              </div>

              <Button
                data-testid="signup-btn"
                type="submit"
                disabled={loading}
                className="w-full rounded-full py-6 text-lg font-bold bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-foreground/60">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Log in
                </Link>
              </div>

              <div className="text-center text-sm text-foreground/60 pt-4 border-t border-border">
                <Link to="/generate" className="text-secondary hover:underline font-semibold">
                  Continue as guest
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
