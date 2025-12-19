import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Search, BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ActivityLibrary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [children, setChildren] = useState([]);
  const [childFilter, setChildFilter] = useState(searchParams.get("childId") || "");

  useEffect(() => {
    if (isAuthenticated) {
      fetchChildren();
    }
    fetchActivities();
  }, [isAuthenticated]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, ageFilter, childFilter]);

  const fetchChildren = async () => {
    try {
      const response = await axios.get(`${API}/children`, {
        headers: getAuthHeaders()
      });
      setChildren(response.data);
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      let url = `${API}/activities`;
      const params = new URLSearchParams();
      
      const childId = searchParams.get("childId");
      if (childId) {
        params.append("child_id", childId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      setActivities(response.data);
      setFilteredActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Age filter
    if (ageFilter) {
      filtered = filtered.filter(activity => activity.age === parseInt(ageFilter));
    }

    // Child filter
    if (childFilter && childFilter !== "all") {
      filtered = filtered.filter(activity => activity.child_id === childFilter);
    }

    setFilteredActivities(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <Button
            data-testid="back-home-btn"
            variant="ghost"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            data-testid="new-activity-btn"
            onClick={() => navigate("/generate")}
            className="rounded-full bg-primary hover:bg-primary/90"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            New Activity
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-4">
            Activity Library
          </h1>
          <p className="text-lg text-foreground/80">
            Browse and revisit all your generated activities
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid sm:grid-cols-3 gap-4" data-testid="filter-section">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
            <Input
              data-testid="search-input"
              type="text"
              placeholder="Search by title, description, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl border-2"
            />
          </div>
          <Select value={ageFilter} onValueChange={setAgeFilter}>
            <SelectTrigger data-testid="age-filter" className="h-12 rounded-xl border-2">
              <SelectValue placeholder="Filter by age" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ages</SelectItem>
              {Array.from({ length: 14 }, (_, i) => i + 5).map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age} years old
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAuthenticated && children.length > 0 && (
            <Select value={childFilter} onValueChange={setChildFilter}>
              <SelectTrigger data-testid="child-filter" className="h-12 rounded-xl border-2">
                <SelectValue placeholder="Filter by child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All children</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-16" data-testid="no-activities">
            <BookOpen className="h-24 w-24 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-secondary mb-2">
              {activities.length === 0 ? "No activities yet" : "No activities found"}
            </h3>
            <p className="text-foreground/60 mb-6">
              {activities.length === 0
                ? "Start by generating your first activity"
                : "Try adjusting your filters"}
            </p>
            {activities.length === 0 && (
              <Button
                data-testid="create-first-activity-btn"
                onClick={() => navigate("/generate")}
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Create First Activity
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="activities-grid">
            {filteredActivities.map((activity) => (
              <Card
                key={activity.id}
                data-testid={`activity-card-${activity.id}`}
                className="rounded-3xl border-border/50 shadow-sm hover:shadow-pop transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/activity/${activity.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm font-semibold">
                      Age {activity.age}
                    </span>
                    <span className="text-xs text-foreground/40">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-secondary line-clamp-2">
                    {activity.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {activity.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {activity.subjects.slice(0, 3).map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs"
                      >
                        {subject}
                      </span>
                    ))}
                    {activity.subjects.length > 3 && (
                      <span className="px-3 py-1 bg-muted text-foreground/60 rounded-full text-xs">
                        +{activity.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLibrary;