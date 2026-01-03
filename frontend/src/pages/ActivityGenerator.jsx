import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Sparkles, Loader2, Info, AlertTriangle, UserPlus, Eye, Clock, BookOpen } from "lucide-react";
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
  "Languages",
  "Economics"
];

// Multiple Intelligences with icons
const INTELLIGENCES = [
  { name: "Linguistic", icon: "📚", description: "Ability with words - reading, writing, speaking. Good for storytelling and discussions." },
  { name: "Logical-Mathematical", icon: "🔢", description: "Thinking in patterns and sequences. Good for puzzles, experiments, and problem-solving." },
  { name: "Spatial", icon: "🎨", description: "Thinking in pictures and 3D. Good for drawing, building, and visual learning." },
  { name: "Bodily-Kinesthetic", icon: "🏃", description: "Learning through movement and touch. Good for hands-on activities and sports." },
  { name: "Musical", icon: "🎵", description: "Sensitivity to rhythm, pitch, and melody. Learning is enhanced with music." },
  { name: "Interpersonal", icon: "👥", description: "Understanding and working with others. Good for group activities and collaboration." },
  { name: "Intrapersonal", icon: "🧘", description: "Self-awareness and reflection. Good for independent work and goal-setting." },
  { name: "Naturalistic", icon: "🌿", description: "Connecting with nature and recognizing patterns in the natural world." }
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

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Easy", description: "Introductory level, suitable for beginners or younger learners" },
  { value: "medium", label: "Medium", description: "Moderate challenge, appropriate for most learners" },
  { value: "difficult", label: "Difficult", description: "Advanced level, for experienced learners seeking a challenge" }
];

const ActivityGenerator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(searchParams.get("childId") || "");
  const [originalChildAge, setOriginalChildAge] = useState(null);
  const [ageChanged, setAgeChanged] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    subjects: [],
    intelligences: [],
    tools: [],
    difficulty: "medium"
  });
  
  // Similar activities state
  const [similarActivities, setSimilarActivities] = useState([]);
  const [searchingSimilar, setSearchingSimilar] = useState(false);
  const [showSimilarDialog, setShowSimilarDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChildren();
    }
  }, [isAuthenticated]);

  // Search for similar activities when form data changes
  useEffect(() => {
    const searchSimilar = async () => {
      if (formData.age && formData.subjects.length > 0) {
        setSearchingSimilar(true);
        try {
          const response = await axios.post(`${API}/activities/similar`, {
            age: parseInt(formData.age),
            subjects: formData.subjects,
            intelligences: formData.intelligences,
            difficulty: formData.difficulty
          });
          setSimilarActivities(response.data);
        } catch (error) {
          console.error("Error searching similar activities:", error);
        } finally {
          setSearchingSimilar(false);
        }
      } else {
        setSimilarActivities([]);
      }
    };
    
    const debounceTimer = setTimeout(searchSimilar, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.age, formData.subjects, formData.intelligences, formData.difficulty]);

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
          setOriginalChildAge(child.age);
        }
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  const handleAgeChange = (value) => {
    setFormData({ ...formData, age: value });
    if (originalChildAge !== null && parseInt(value) !== originalChildAge) {
      setAgeChanged(true);
    } else {
      setAgeChanged(false);
    }
  };

  const handleChildChange = (childId) => {
    setSelectedChildId(childId);
    if (childId && childId !== "none") {
      const child = children.find(c => c.id === childId);
      if (child) {
        setFormData(prev => ({ ...prev, age: child.age.toString() }));
        setOriginalChildAge(child.age);
        setAgeChanged(false);
      }
    } else {
      setOriginalChildAge(null);
      setAgeChanged(false);
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
    
    // If there are similar activities, show the dialog first
    if (similarActivities.length > 0 && !showSimilarDialog) {
      setShowSimilarDialog(true);
      return;
    }
    
    await generateNewActivity();
  };

  const generateNewActivity = async () => {
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
      toast.error("Please select at least one intelligence type");
      return;
    }
    if (formData.tools.length === 0) {
      toast.error("Please select at least one available tool");
      return;
    }

    setLoading(true);
    setShowSimilarDialog(false);
    try {
      const response = await axios.post(`${API}/activities/generate`, {
        age: parseInt(formData.age),
        subjects: formData.subjects,
        intelligences: formData.intelligences,
        tools: formData.tools,
        difficulty: formData.difficulty,
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

        {/* FOMO message for non-logged-in users */}
        {!isAuthenticated && (
          <Alert className="mb-8 rounded-2xl border-2 border-accent bg-accent/10">
            <UserPlus className="h-5 w-5 text-accent" />
            <AlertDescription className="ml-2">
              <span className="font-semibold">Want to track your child's progress?</span>{" "}
              <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link> to unlock Exposure Reports, activity history, and personalized recommendations. 
              Creating a profile helps us generate better activities for your child!
            </AlertDescription>
          </Alert>
        )}

        {/* Similar Activities Dialog */}
        <Dialog open={showSimilarDialog} onOpenChange={setShowSimilarDialog}>
          <DialogContent className="rounded-3xl max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-secondary">Similar Activities Found</DialogTitle>
              <DialogDescription>
                We found {similarActivities.length} existing activit{similarActivities.length === 1 ? 'y' : 'ies'} matching your criteria. 
                You can use one of these or create a new activity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {similarActivities.slice(0, 5).map((activity) => (
                <Card 
                  key={activity.id} 
                  className="rounded-2xl border-border/50 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/activity/${activity.id}`)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary mb-1">{activity.title}</h4>
                        <p className="text-sm text-foreground/60 line-clamp-2">{activity.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-accent/20 text-accent-foreground rounded-full text-xs">
                            Age {activity.age}
                          </span>
                          {activity.subjects.slice(0, 2).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => setShowSimilarDialog(false)}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateNewActivity}
                  disabled={loading}
                  className="flex-1 rounded-full bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create New Activity
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                  <Select value={selectedChildId} onValueChange={handleChildChange}>
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
                <Select value={formData.age} onValueChange={handleAgeChange}>
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
                
                {/* Age change warning */}
                {ageChanged && selectedChildId && selectedChildId !== "none" && (
                  <Alert className="mt-4 rounded-xl border-2 border-yellow-500 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="ml-2 text-yellow-800">
                      <span className="font-semibold">Note:</span> You've changed the age from the child's profile (Age {originalChildAge}). 
                      This activity will be generated for age {formData.age}, but won't update the child's profile.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Difficulty Selection */}
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="difficulty-selection-card">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">Difficulty Level *</CardTitle>
                <CardDescription>Select the challenge level for the activity</CardDescription>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <div 
                        key={level.value}
                        data-testid={`difficulty-${level.value}`}
                        onClick={() => setFormData({ ...formData, difficulty: level.value })}
                        className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
                          formData.difficulty === level.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold ${formData.difficulty === level.value ? 'text-primary' : 'text-secondary'}`}>
                            {level.label}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{level.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {formData.difficulty === level.value && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>

            {/* Subject Selection */}
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="subjects-card">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">Subjects *</CardTitle>
                <CardDescription>Select one or more subjects for the activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {SUBJECTS.map((subject) => (
                    <div
                      key={subject}
                      data-testid={`subject-${subject}`}
                      onClick={() => handleSubjectToggle(subject)}
                      className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                        formData.subjects.includes(subject)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{subject}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Multiple Intelligences Theory - Icon Grid */}
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="intelligences-card">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">Multiple Intelligences Theory *</CardTitle>
                <CardDescription>Select the intelligence types that match your child's strengths</CardDescription>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {INTELLIGENCES.map((intelligence) => (
                      <div
                        key={intelligence.name}
                        data-testid={`intelligence-${intelligence.name}`}
                        onClick={() => handleIntelligenceToggle(intelligence)}
                        className={`relative cursor-pointer rounded-2xl border-2 p-4 text-center transition-all duration-200 ${
                          formData.intelligences.includes(intelligence.name)
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-4xl mb-2">{intelligence.icon}</div>
                        <span className={`text-sm font-medium block ${
                          formData.intelligences.includes(intelligence.name) ? 'text-primary' : 'text-secondary'
                        }`}>
                          {intelligence.name}
                        </span>
                        
                        {/* Info tooltip */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold mb-1">{intelligence.name}</p>
                            <p className="text-sm">{intelligence.description}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Selection indicator */}
                        {formData.intelligences.includes(intelligence.name) && (
                          <div className="absolute top-2 left-2 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>

            {/* Tools Selection */}
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="tools-card">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">Available Tools *</CardTitle>
                <CardDescription>Select the materials and tools you have available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TOOLS.map((tool) => (
                    <div
                      key={tool}
                      data-testid={`tool-${tool}`}
                      onClick={() => handleToolToggle(tool)}
                      className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                        formData.tools.includes(tool)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{tool}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Similar Activities Preview */}
            {similarActivities.length > 0 && (
              <Alert className="rounded-2xl border-2 border-blue-200 bg-blue-50">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <AlertDescription className="ml-2 text-blue-800">
                  <span className="font-semibold">{similarActivities.length} similar activit{similarActivities.length === 1 ? 'y' : 'ies'} found!</span>{" "}
                  Based on your selections, we found existing activities that might work for you.
                  Click "Generate Activity" to see them before creating a new one.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              data-testid="generate-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-8 text-xl font-bold shadow-pop hover:shadow-pop-hover transform hover:-translate-y-1 transition-all duration-300 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Generating Activity...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-6 w-6" />
                  {similarActivities.length > 0 ? 'View Similar or Generate New' : 'Generate Activity'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityGenerator;
