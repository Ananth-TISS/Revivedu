import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, Edit, Trash2, Eye, Sparkles, BarChart3, Loader2, Flame, Calendar, FileText, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Calendar Component
const ActivityCalendar = ({ activityDates }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  
  // Create a Set of dates that have activities
  const activitySet = new Set(activityDates);
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8"></div>);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasActivity = activitySet.has(dateStr);
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    
    days.push(
      <div 
        key={day} 
        className={`h-8 w-8 flex items-center justify-center rounded-full text-sm
          ${hasActivity ? 'bg-primary text-white font-bold' : ''}
          ${isToday && !hasActivity ? 'border-2 border-primary' : ''}
          ${!hasActivity && !isToday ? 'text-foreground/60' : ''}
        `}
      >
        {day}
      </div>
    );
  }
  
  return (
    <div className="bg-background rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth} className="rounded-full p-2">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-secondary">{monthNames[month]} {year}</span>
        <Button variant="ghost" size="sm" onClick={nextMonth} className="rounded-full p-2">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-xs font-semibold text-foreground/40">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 place-items-center">
        {days}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    grade: "",
    interests: ""
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    total_activities: 0,
    total_artifacts: 0,
    total_feedbacks: 0,
    activity_dates: [],
    current_streak: 0,
    longest_streak: 0
  });

  useEffect(() => {
    fetchChildren();
    fetchDashboardStats();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await axios.get(`${API}/children`, {
        headers: getAuthHeaders()
      });
      setChildren(response.data);
    } catch (error) {
      console.error("Error fetching children:", error);
      toast.error("Failed to load child profiles");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const data = {
        name: formData.name,
        age: parseInt(formData.age),
        grade: formData.grade || null,
        interests: formData.interests ? formData.interests.split(",").map(i => i.trim()) : []
      };
      
      if (editingChild) {
        await axios.put(`${API}/children/${editingChild.id}`, data, {
          headers: getAuthHeaders()
        });
        toast.success("Child profile updated successfully!");
      } else {
        await axios.post(`${API}/children`, data, {
          headers: getAuthHeaders()
        });
        toast.success("Child profile created successfully!");
      }
      
      setShowAddChild(false);
      setEditingChild(null);
      setFormData({ name: "", age: "", grade: "", interests: "" });
      fetchChildren();
    } catch (error) {
      console.error("Error saving child:", error);
      toast.error("Failed to save child profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (child) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      age: child.age.toString(),
      grade: child.grade || "",
      interests: child.interests.join(", ")
    });
    setShowAddChild(true);
  };

  const handleDelete = async (childId) => {
    if (!window.confirm("Are you sure you want to delete this child profile?")) {
      return;
    }
    
    try {
      await axios.delete(`${API}/children/${childId}`, {
        headers: getAuthHeaders()
      });
      toast.success("Child profile deleted successfully");
      fetchChildren();
      fetchDashboardStats();
    } catch (error) {
      console.error("Error deleting child:", error);
      toast.error("Failed to delete child profile");
    }
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-lg text-foreground/80">Manage your children's learning journey</p>
        </div>

        {/* Stats Summary Section */}
        {children.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl border-border/50 shadow-sm" data-testid="stats-activities">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{stats.total_activities}</p>
                    <p className="text-sm text-foreground/60">Completed Activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl border-border/50 shadow-sm" data-testid="stats-artifacts">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/20 w-12 h-12 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{stats.total_artifacts}</p>
                    <p className="text-sm text-foreground/60">Artefacts Uploaded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl border-border/50 shadow-sm" data-testid="stats-streak">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{stats.current_streak} day{stats.current_streak !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-foreground/60">Current Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl border-border/50 shadow-sm" data-testid="stats-best-streak">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <Flame className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{stats.longest_streak} day{stats.longest_streak !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-foreground/60">Best Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Child Profiles */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-secondary">Learner Profiles</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {children.map((child) => (
                <Card
                  key={child.id}
                  data-testid={`child-card-${child.id}`}
                  className="rounded-3xl border-border/50 shadow-sm hover:shadow-pop transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-secondary mb-1">{child.name}</CardTitle>
                        <CardDescription>
                          Age {child.age} {child.grade && `• ${child.grade}`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          data-testid={`edit-child-${child.id}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(child)}
                          className="rounded-full"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          data-testid={`delete-child-${child.id}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(child.id)}
                          className="rounded-full text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {child.interests.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-foreground/60 mb-2">Interests:</p>
                        <div className="flex flex-wrap gap-2">
                          {child.interests.map((interest, idx) => (
                            <span key={idx} className="px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-xs">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button
                        data-testid={`generate-activity-${child.id}`}
                        onClick={() => navigate(`/generate?childId=${child.id}`)}
                        className="rounded-full bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                      <Button
                        data-testid={`view-activities-${child.id}`}
                        onClick={() => navigate(`/library?childId=${child.id}`)}
                        variant="outline"
                        className="rounded-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                        size="sm"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Activities
                      </Button>
                    </div>
                    <Button
                      data-testid={`view-report-${child.id}`}
                      onClick={() => navigate(`/report/${child.id}`)}
                      variant="outline"
                      className="w-full rounded-full border-2 border-accent text-accent-foreground hover:bg-accent"
                      size="sm"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Exposure Report
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {children.length === 0 && (
                <div className="col-span-2 text-center py-16">
                  <div className="bg-muted rounded-3xl p-12 max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-secondary mb-4">No child profiles yet</h3>
                    <p className="text-foreground/80 mb-6">
                      Create a child profile to start generating personalized learning activities and track their progress.
                    </p>
                    <Button
                      onClick={() => setShowAddChild(true)}
                      className="rounded-full px-8 py-6 text-lg font-bold bg-primary hover:bg-primary/90"
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Add Your First Child
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Calendar & Add Child */}
          <div className="space-y-6">
            {/* Calendar/Streak Widget */}
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="calendar-widget">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-secondary flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Activity Calendar
                </CardTitle>
                <CardDescription>
                  Track your learning engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityCalendar activityDates={stats.activity_dates} />
                
                {/* Streak Info */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-semibold">{stats.current_streak} day streak!</span>
                  </div>
                  <span className="text-xs text-foreground/60">Best: {stats.longest_streak} days</span>
                </div>
              </CardContent>
            </Card>

            {/* Add Child Card (moved to bottom-right as per spec) */}
            {children.length > 0 && (
              <Dialog open={showAddChild} onOpenChange={(open) => {
                setShowAddChild(open);
                if (!open) {
                  setEditingChild(null);
                  setFormData({ name: "", age: "", grade: "", interests: "" });
                }
              }}>
                <DialogTrigger asChild>
                  <Card
                    data-testid="add-child-card"
                    className="rounded-3xl border-2 border-dashed border-primary/40 shadow-sm hover:shadow-pop hover:border-primary transition-all duration-300 cursor-pointer"
                  >
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                        <UserPlus className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary mb-1">Add Child Profile</h3>
                      <p className="text-sm text-foreground/60 text-center">Create a new learning profile</p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-secondary">
                      {editingChild ? "Edit Child Profile" : "Add New Child"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingChild ? "Update your child's information" : "Create a learning profile for your child"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="child-name">Name *</Label>
                      <Input
                        id="child-name"
                        data-testid="child-name-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="child-age">Age *</Label>
                      <Input
                        id="child-age"
                        data-testid="child-age-input"
                        type="number"
                        min="5"
                        max="18"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="child-grade">Grade (Optional)</Label>
                      <Input
                        id="child-grade"
                        data-testid="child-grade-input"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="e.g., Grade 5"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="child-interests">Interests (Optional, comma-separated)</Label>
                      <Input
                        id="child-interests"
                        data-testid="child-interests-input"
                        value={formData.interests}
                        onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                        placeholder="e.g., Science, Music, Art"
                        className="rounded-xl"
                      />
                    </div>
                    <Button
                      data-testid="submit-child-btn"
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full bg-primary hover:bg-primary/90"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingChild ? "Update Profile" : "Create Profile"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {/* First-time Add Child Dialog (when no children) */}
            {children.length === 0 && (
              <Dialog open={showAddChild} onOpenChange={(open) => {
                setShowAddChild(open);
                if (!open) {
                  setEditingChild(null);
                  setFormData({ name: "", age: "", grade: "", interests: "" });
                }
              }}>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-secondary">
                      {editingChild ? "Edit Child Profile" : "Add New Child"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingChild ? "Update your child's information" : "Create a learning profile for your child"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="child-name">Name *</Label>
                      <Input
                        id="child-name"
                        data-testid="child-name-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="child-age">Age *</Label>
                      <Input
                        id="child-age"
                        data-testid="child-age-input"
                        type="number"
                        min="5"
                        max="18"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="child-grade">Grade (Optional)</Label>
                      <Input
                        id="child-grade"
                        data-testid="child-grade-input"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="e.g., Grade 5"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="child-interests">Interests (Optional, comma-separated)</Label>
                      <Input
                        id="child-interests"
                        data-testid="child-interests-input"
                        value={formData.interests}
                        onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                        placeholder="e.g., Science, Music, Art"
                        className="rounded-xl"
                      />
                    </div>
                    <Button
                      data-testid="submit-child-btn"
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full bg-primary hover:bg-primary/90"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingChild ? "Update Profile" : "Create Profile"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
