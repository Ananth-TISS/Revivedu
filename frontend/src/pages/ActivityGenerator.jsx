import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Sparkles, Loader2, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SUBJECTS = [
  "Mathematics",
  "Science",
  "Literature",
  "Arts",
  "Music",
  "History",
  "Geography",
  "Physical Education",
  "Technology",
  "Languages"
];

const INTELLIGENCES = [
  { name: "Linguistic", description: "Ability with words - reading, writing, speaking. Good for storytelling and discussions." },
  { name: "Logical-Mathematical", description: "Thinking in patterns and sequences. Good for puzzles, experiments, and problem-solving." },
  { name: "Spatial", description: "Thinking in pictures and 3D. Good for drawing, building, and visual learning." },
  { name: "Bodily-Kinesthetic", description: "Learning through movement and touch. Good for hands-on activities and sports." },
  { name: "Musical", description: "Sensitivity to rhythm, pitch, and melody. Learning is enhanced with music." },
  { name: "Interpersonal", description: "Understanding and working with others. Good for group activities and collaboration." },
  { name: "Intrapersonal", description: "Self-awareness and reflection. Good for independent work and goal-setting." },
  { name: "Naturalistic", description: "Connecting with nature and recognizing patterns in the natural world." }
];

const TOOLS = [
  "Art & Craft supplies",
  "Internet access",
  "Laptop/Tablet/Phone",
  "Paper and pencils",
  "Science experiment kits",
  "DIY kits",
  "Books",
  "Musical instruments",
  "Sports equipment",
  "Board games"
];

const ActivityGenerator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(searchParams.get("childId") || "");
  const [formData, setFormData] = useState({
    age: "",
    subjects: [],
    intelligences: [],
    tools: []
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchChildren();
    }
  }, [isAuthenticated]);

  const fetchChildren = async () => {
    try {
      const response = await axios.get(`${API}/children`, {
        headers: getAuthHeaders()
      });
      setChildren(response.data);
      
      const childId = searchParams.get("childId");
      if (childId) {
        const child = response.data.find(c => c.id === childId);
        if (child) {
          setFormData(prev => ({ ...prev, age: child.age.toString() }));
        }
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleIntelligenceToggle = (intelligence) => {
    setFormData(prev => ({
      ...prev,
      intelligences: prev.intelligences.includes(intelligence.name)
        ? prev.intelligences.filter(i => i !== intelligence.name)
        : [...prev.intelligences, intelligence.name]
    }));
  };

  const handleToolToggle = (tool) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.age) {
      toast.error("Please select the child's age");
      return;
    }
    if (formData.subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    if (formData.intelligences.length === 0) {
      toast.error("Please select at least one intelligence");
      return;
    }
    if (formData.tools.length === 0) {
      toast.error("Please select at least one available tool");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/activities/generate`, {
        age: parseInt(formData.age),
        subjects: formData.subjects,
        intelligences: formData.intelligences,
        tools: formData.tools,
        child_id: selectedChildId && selectedChildId !== "none" ? selectedChildId : null
      });
      
      toast.success("Activity generated successfully!");
      navigate(`/activity/${response.data.id}`);
    } catch (error) {
      console.error("Error generating activity:", error);
      toast.error("Failed to generate activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Button
          data-testid="back-home-btn"
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-4">
            Generate Learning Activity
          </h1>
          <p className="text-lg text-foreground/80">
            Tell us about your child and we'll create a personalized activity
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Child Selection (for logged-in users) */}
            {isAuthenticated && children.length > 0 && (
              <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="child-selection-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-secondary">Select Child (Optional)</CardTitle>
                  <CardDescription>Link this activity to a child profile for tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                    <SelectTrigger data-testid="child-select" className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Select a child or leave blank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific child</SelectItem>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name} (Age {child.age})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Age Selection */}
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="age-selection-card">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">Child's Age</CardTitle>
                <CardDescription>Select your child's age</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={formData.age} onValueChange={(value) => setFormData({ ...formData, age: value })}>
                  <SelectTrigger data-testid="age-select" className="h-12 rounded-xl border-2">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => i + 5).map((age) => (
                      <SelectItem key={age} value={age.toString()}>
                        {age} years old
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Subject Selection */}
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="subjects-card">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">Subjects</CardTitle>
                <CardDescription>Select subjects to focus on (choose at least one)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {SUBJECTS.map((subject) => (
                    <div key={subject} className="flex items-center space-x-3">
                      <Checkbox
                        data-testid={`subject-${subject.toLowerCase().replace(/\s+/g, '-')}`}
                        id={`subject-${subject}`}
                        checked={formData.subjects.includes(subject)}
                        onCheckedChange={() => handleSubjectToggle(subject)}
                      />
                      <Label htmlFor={`subject-${subject}`} className="cursor-pointer">
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Multiple Intelligences */}
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="intelligences-card">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">Multiple Intelligences</CardTitle>
                <CardDescription>Select intelligences to engage (choose at least one)</CardDescription>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {INTELLIGENCES.map((intelligence) => (
                      <div key={intelligence.name} className="flex items-center space-x-3">
                        <Checkbox
                          data-testid={`intelligence-${intelligence.name.toLowerCase().replace(/\s+/g, '-')}`}
                          id={`intelligence-${intelligence.name}`}
                          checked={formData.intelligences.includes(intelligence.name)}
                          onCheckedChange={() => handleIntelligenceToggle(intelligence)}
                        />
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`intelligence-${intelligence.name}`} className="cursor-pointer">
                            {intelligence.name}
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{intelligence.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>

            {/* Available Tools */}
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="tools-card">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">Available Tools</CardTitle>
                <CardDescription>Select tools available at home (choose at least one)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {TOOLS.map((tool) => (
                    <div key={tool} className="flex items-center space-x-3">
                      <Checkbox
                        data-testid={`tool-${tool.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        id={`tool-${tool}`}
                        checked={formData.tools.includes(tool)}
                        onCheckedChange={() => handleToolToggle(tool)}
                      />
                      <Label htmlFor={`tool-${tool}`} className="cursor-pointer">
                        {tool}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                data-testid="submit-generate-btn"
                type="submit"
                size="lg"
                disabled={loading}
                className="rounded-full px-12 py-6 text-lg font-bold shadow-pop hover:shadow-pop-hover transform hover:-translate-y-1 transition-all duration-300 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Activity
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityGenerator;