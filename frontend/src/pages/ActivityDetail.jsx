import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Loader2, CheckCircle2, Upload, Lightbulb, Volume2, Play, Pause, Printer, Download, Info, CircleCheck, Circle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [activeTab, setActiveTab] = useState("activity");
  const [artifacts, setArtifacts] = useState([]);
  
  // Enhanced Feedback form with Likert scale and outcome assessments
  const [feedbackForm, setFeedbackForm] = useState({
    experience: "",
    additional_comments: "",
    completion_status: "",
    likert_rating: 0,
    outcome_assessments: {} // Maps outcome -> {achieved: bool, notes: string}
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Artifact upload with title and portfolio consent
  const [uploadingArtifact, setUploadingArtifact] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [artifactTitle, setArtifactTitle] = useState("");
  const [includeInPortfolio, setIncludeInPortfolio] = useState(false);
  
  // Audio state
  const [audioData, setAudioData] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchActivity();
    fetchArtifacts();
  }, [id]);

  const fetchActivity = async () => {
    try {
      const response = await axios.get(`${API}/activities/${id}`);
      setActivity(response.data);
    } catch (error) {
      console.error("Error fetching activity:", error);
      toast.error("Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  const fetchArtifacts = async () => {
    try {
      const response = await axios.get(`${API}/artifacts/${id}`);
      setArtifacts(response.data);
    } catch (error) {
      console.error("Error fetching artifacts:", error);
    }
  };

  const generateAudio = async () => {
    setLoadingAudio(true);
    try {
      const response = await axios.get(`${API}/activities/${id}/audio`);
      setAudioData(response.data);
      toast.success("Audio summary generated!");
    } catch (error) {
      console.error("Error generating audio:", error);
      toast.error("Failed to generate audio summary");
    } finally {
      setLoadingAudio(false);
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Create printable content
    const printContent = document.getElementById('activity-content');
    if (!printContent) return;
    
    // Use browser print dialog with PDF option
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${activity.title} - Revivedu</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1a365d; margin-bottom: 20px; }
          h2 { color: #2d3748; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
          h3 { color: #4a5568; margin-top: 20px; }
          p { line-height: 1.6; color: #4a5568; }
          ul, ol { margin-left: 20px; line-height: 1.8; }
          li { margin-bottom: 8px; }
          .tag { display: inline-block; background: #edf2f7; padding: 4px 12px; border-radius: 20px; margin: 4px; font-size: 14px; }
          .section { margin-bottom: 30px; }
          .objective-box { background: #f7fafc; border-left: 4px solid #3182ce; padding: 15px; margin: 15px 0; }
          .header-info { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${activity.title}</h1>
        <div class="header-info">
          <span class="tag">Age: ${activity.age}</span>
          ${activity.estimated_time ? `<span class="tag">Duration: ${activity.estimated_time}</span>` : ''}
          ${activity.difficulty ? `<span class="tag">Difficulty: ${activity.difficulty}</span>` : ''}
        </div>
        
        ${activity.objective ? `
        <div class="section">
          <h2>Objective</h2>
          <div class="objective-box">${activity.objective}</div>
        </div>
        ` : ''}
        
        <div class="section">
          <h2>Description</h2>
          <p>${activity.description}</p>
        </div>
        
        ${activity.expected_outcome ? `
        <div class="section">
          <h2>Expected Outcome</h2>
          <p>${activity.expected_outcome}</p>
        </div>
        ` : ''}
        
        ${activity.materials_required && activity.materials_required.length > 0 ? `
        <div class="section">
          <h2>Materials Required</h2>
          <ul>
            ${activity.materials_required.map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div class="section">
          <h2>Step-by-Step Process</h2>
          <ol>
            ${activity.instructions.map(i => `<li>${i}</li>`).join('')}
          </ol>
        </div>
        
        ${activity.success_metrics && activity.success_metrics.length > 0 ? `
        <div class="section">
          <h2>Success Metrics</h2>
          <ul>
            ${activity.success_metrics.map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${activity.reflection_question ? `
        <div class="section">
          <h2>Reflection Question</h2>
          <p><em>"${activity.reflection_question}"</em></p>
        </div>
        ` : ''}
        
        ${activity.learning_outcomes && activity.learning_outcomes.length > 0 ? `
        <div class="section">
          <h2>Learning Outcomes</h2>
          <ul>
            ${activity.learning_outcomes.map(o => `<li>${o}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${activity.real_world_connection ? `
        <div class="section">
          <h2>Real-World Connection</h2>
          <p>${activity.real_world_connection}</p>
        </div>
        ` : ''}
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096; font-size: 12px;">
          Generated by Revivedu - Reviving the joy of learning
        </footer>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (feedbackForm.likert_rating === 0) {
      toast.error("Please provide an activity rating (1-5)");
      return;
    }
    if (!feedbackForm.completion_status) {
      toast.error("Please select a completion status");
      return;
    }
    if (!feedbackForm.experience) {
      toast.error("Please describe the experience");
      return;
    }

    setSubmittingFeedback(true);
    try {
      await axios.post(`${API}/feedback`, {
        activity_id: id,
        child_id: activity?.child_id || null,
        rating: feedbackForm.likert_rating,
        experience: feedbackForm.experience,
        outcomes: feedbackForm.outcomes_achieved.join(", "),
        suggestions: feedbackForm.additional_comments,
        completion_status: feedbackForm.completion_status,
        outcomes_achieved: feedbackForm.outcomes_achieved
      });
      toast.success("Feedback submitted successfully!");
      setFeedbackForm({
        experience: "",
        additional_comments: "",
        completion_status: "",
        likert_rating: 0,
        outcomes_achieved: []
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setUploadingArtifact(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("activity_id", id);
      if (activity?.child_id) {
        formData.append("child_id", activity.child_id);
      }
      
      await axios.post(`${API}/artifacts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      toast.success("Artifact uploaded successfully!");
      setSelectedFile(null);
      fetchArtifacts();
    } catch (error) {
      console.error("Error uploading artifact:", error);
      toast.error("Failed to upload artifact");
    } finally {
      setUploadingArtifact(false);
    }
  };

  const handleOutcomeToggle = (outcome) => {
    setFeedbackForm(prev => ({
      ...prev,
      outcomes_achieved: prev.outcomes_achieved.includes(outcome)
        ? prev.outcomes_achieved.filter(o => o !== outcome)
        : [...prev.outcomes_achieved, outcome]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-foreground/60 mb-4">Activity not found</p>
          <Button onClick={() => navigate("/library")} className="rounded-full">
            Go to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12" id="activity-content">
        <Button
          data-testid="back-library-btn"
          variant="ghost"
          onClick={() => navigate("/library")}
          className="mb-6 rounded-full print:hidden"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>

        <div className="mb-8" data-testid="activity-header">
          {/* Title */}
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold text-secondary">
                {activity.title}
              </h1>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 print:hidden">
              <Button
                data-testid="print-btn"
                onClick={handlePrint}
                variant="outline"
                className="rounded-full border-2"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button
                data-testid="download-pdf-btn"
                onClick={handleDownloadPDF}
                variant="outline"
                className="rounded-full border-2"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                data-testid="generate-audio-btn"
                onClick={generateAudio}
                disabled={loadingAudio}
                variant="outline"
                className="rounded-full border-2 border-accent text-accent hover:bg-accent hover:text-white"
              >
                {loadingAudio ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Listen
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Audio Player */}
          {audioData && (
            <Card className="rounded-3xl border-accent/50 bg-accent/5 shadow-sm mb-4 print:hidden" data-testid="audio-player">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Button
                    data-testid="play-pause-btn"
                    onClick={handlePlayPause}
                    size="lg"
                    className="rounded-full bg-accent hover:bg-accent/90"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  
                  <div className="flex-1">
                    <p className="text-sm text-foreground/60 mb-2">Activity Audio Summary</p>
                    <audio
                      ref={audioRef}
                      src={`data:audio/mp3;base64,${audioData.audio_base64}`}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full"
                      controls
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <p className="text-sm text-foreground/60 mr-2">Speed:</p>
                    {[1.0, 1.5, 2.0].map((speed) => (
                      <Button
                        key={speed}
                        data-testid={`speed-${speed}x`}
                        onClick={() => handleSpeedChange(speed)}
                        variant={playbackSpeed === speed ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                      >
                        {speed}×
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activity.objective && (
            <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-lg mb-4">
              <h3 className="font-bold text-accent-foreground mb-2">Objective</h3>
              <p className="text-foreground/80">{activity.objective}</p>
            </div>
          )}
          
          <p className="text-lg text-foreground/80 mb-4">{activity.description}</p>
          
          {activity.expected_outcome && (
            <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-lg mb-4">
              <h3 className="font-bold text-primary mb-2">Expected Outcome</h3>
              <p className="text-foreground/80">{activity.expected_outcome}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-4 py-2 bg-accent/20 text-accent-foreground rounded-full text-sm font-semibold">
              Age: {activity.age}
            </span>
            {activity.difficulty && (
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                activity.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
              </span>
            )}
            {activity.estimated_time && (
              <span className="px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-semibold">
                Duration: {activity.estimated_time}
              </span>
            )}
            {activity.subjects.map((subject) => (
              <span key={subject} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm">
                {subject}
              </span>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full print:hidden">
          <TabsList className="grid w-full grid-cols-3 rounded-full p-1 bg-muted" data-testid="activity-tabs">
            <TabsTrigger value="activity" className="rounded-full" data-testid="tab-activity">
              Activity
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-full" data-testid="tab-feedback">
              Learner Engagement
            </TabsTrigger>
            <TabsTrigger value="artifacts" className="rounded-full" data-testid="tab-artifacts">
              Upload ({artifacts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-8">
            <div className="space-y-8">
              {activity.materials_required && activity.materials_required.length > 0 && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="materials-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Materials Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {activity.materials_required.map((material, index) => (
                        <li key={index} className="flex gap-2 items-start">
                          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                          <span className="text-foreground/80">{material}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {activity.curricular_areas && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="curricular-areas-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Curricular Alignment</CardTitle>
                    <CardDescription>Standards and framework alignment for educational compliance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activity.curricular_areas.ncf_se_2023 && activity.curricular_areas.ncf_se_2023.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">NCF-SE 2023</h4>
                        <div className="flex flex-wrap gap-2">
                          {activity.curricular_areas.ncf_se_2023.map((area, idx) => (
                            <span key={idx} className="px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {activity.curricular_areas.nios_subjects && activity.curricular_areas.nios_subjects.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">NIOS Subjects</h4>
                        <div className="flex flex-wrap gap-2">
                          {activity.curricular_areas.nios_subjects.map((subject, idx) => (
                            <span key={idx} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {activity.curricular_areas.learning_domains && activity.curricular_areas.learning_domains.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Learning Domains</h4>
                        <div className="flex flex-wrap gap-2">
                          {activity.curricular_areas.learning_domains.map((domain, idx) => (
                            <span key={idx} className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm">
                              {domain}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="instructions-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-secondary">Step-by-Step Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {activity.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span className="text-foreground/80 flex-1 pt-1">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {activity.success_metrics && activity.success_metrics.length > 0 && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="success-metrics-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Success Metrics</CardTitle>
                    <CardDescription>Indicators to assess performance and engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {activity.success_metrics.map((metric, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                          <span className="text-foreground/80">{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {activity.reflection_question && (
                <Card className="rounded-3xl border-border/50 shadow-sm bg-gradient-to-r from-accent/5 to-primary/5" data-testid="reflection-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Reflection Question</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-foreground/80 italic">"{activity.reflection_question}"</p>
                  </CardContent>
                </Card>
              )}

              {activity.learning_outcomes && activity.learning_outcomes.length > 0 && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="outcomes-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Learning Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {activity.learning_outcomes.map((outcome, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                          <span className="text-foreground/80">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {activity.skills && activity.skills.length > 0 && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="skills-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Skills Developed</CardTitle>
                    <CardDescription>Skills directly exercised by this activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TooltipProvider>
                      <div className="flex flex-wrap gap-3">
                        {activity.skills.map((skill, index) => (
                          <div key={index} className="relative group">
                            <span className="px-6 py-3 bg-secondary/10 text-secondary rounded-full font-semibold inline-flex items-center gap-2">
                              {skill}
                              {activity.skill_explanations && activity.skill_explanations[skill] && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button type="button" className="text-secondary/60 hover:text-secondary">
                                      <Info className="h-4 w-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="font-semibold mb-1">How this skill is developed:</p>
                                    <p className="text-sm">{activity.skill_explanations[skill]}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TooltipProvider>
                  </CardContent>
                </Card>
              )}

              {/* Outcome Analysis Section */}
              {activity.outcome_analysis && activity.outcome_analysis.length > 0 && (
                <Card className="rounded-3xl border-border/50 shadow-sm bg-gradient-to-r from-primary/5 to-accent/5" data-testid="outcome-analysis-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Outcome Analysis</CardTitle>
                    <CardDescription>Track whether learning outcomes were achieved</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {activity.outcome_analysis.map((item, index) => (
                        <div key={index} className="p-4 bg-background rounded-2xl border border-border/50">
                          <h4 className="font-semibold text-secondary mb-2">{item.outcome}</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-foreground/60 mb-1">Success Criteria:</p>
                              <p className="text-foreground/80">{item.criteria}</p>
                            </div>
                            {item.evidence_cues && item.evidence_cues.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-foreground/60 mb-1">Evidence Cues (what "good job" looks like):</p>
                                <ul className="space-y-1">
                                  {item.evidence_cues.map((cue, cueIndex) => (
                                    <li key={cueIndex} className="flex items-start gap-2 text-sm text-foreground/80">
                                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                      {cue}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activity.extensions && activity.extensions.length > 0 && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="extensions-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Extensions & Modifications</CardTitle>
                    <CardDescription>Ways to adapt or extend this activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {activity.extensions.map((extension, index) => (
                        <li key={index} className="flex gap-3">
                          <Lightbulb className="h-6 w-6 text-accent flex-shrink-0" />
                          <span className="text-foreground/80">{extension}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {activity.discussion_questions && activity.discussion_questions.length > 0 && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="discussion-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Discussion Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {activity.discussion_questions.map((question, index) => (
                        <li key={index} className="text-foreground/80">
                          <span className="font-semibold text-primary">Q{index + 1}:</span> {question}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {activity.real_world_connection && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="real-world-card">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Real-World Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">{activity.real_world_connection}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="mt-8">
            <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="feedback-form-card">
              <CardHeader>
                <CardTitle className="text-2xl text-secondary">Learner Engagement</CardTitle>
                <CardDescription>Share your experience and track learning outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-8">
                  {/* Completion Status */}
                  <div>
                    <Label className="text-base mb-3 block font-semibold">Completion Status *</Label>
                    <Select 
                      value={feedbackForm.completion_status} 
                      onValueChange={(value) => setFeedbackForm({ ...feedbackForm, completion_status: value })}
                    >
                      <SelectTrigger data-testid="completion-status-select" className="h-12 rounded-xl border-2">
                        <SelectValue placeholder="Select completion status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">✅ Completed</SelectItem>
                        <SelectItem value="partially_completed">🔄 Partially Completed</SelectItem>
                        <SelectItem value="not_engaged">❌ Not Engaged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 1-5 Likert Scale Rating */}
                  <div>
                    <Label className="text-base mb-3 block font-semibold">Activity Rating (1-5) *</Label>
                    <p className="text-sm text-foreground/60 mb-3">How would you rate this activity overall?</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          data-testid={`likert-rating-${num}`}
                          onClick={() => setFeedbackForm({ ...feedbackForm, likert_rating: num })}
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                            feedbackForm.likert_rating === num 
                              ? 'bg-primary text-white border-primary' 
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-foreground/60">
                      <span>Not helpful</span>
                      <span>Very helpful</span>
                    </div>
                  </div>

                  {/* Learning Outcomes Checklist */}
                  {activity.learning_outcomes && activity.learning_outcomes.length > 0 && (
                    <div>
                      <Label className="text-base mb-3 block font-semibold">Learning Outcomes Achieved</Label>
                      <p className="text-sm text-foreground/60 mb-3">Mark which learning outcomes were observed</p>
                      <div className="space-y-3 bg-muted/50 rounded-2xl p-4">
                        {activity.learning_outcomes.map((outcome, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Checkbox
                              id={`outcome-${index}`}
                              data-testid={`outcome-checkbox-${index}`}
                              checked={feedbackForm.outcomes_achieved.includes(outcome)}
                              onCheckedChange={() => handleOutcomeToggle(outcome)}
                            />
                            <Label htmlFor={`outcome-${index}`} className="cursor-pointer text-foreground/80 leading-tight">
                              {outcome}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="experience" className="text-base mb-2 block font-semibold">Experience *</Label>
                    <Textarea
                      id="experience"
                      data-testid="feedback-experience"
                      placeholder="How was the overall experience? What worked well?"
                      value={feedbackForm.experience}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, experience: e.target.value })}
                      className="min-h-[100px] rounded-xl border-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional_comments" className="text-base mb-2 block">Additional Observations & Suggestions</Label>
                    <Textarea
                      id="additional_comments"
                      data-testid="feedback-additional-comments"
                      placeholder="Any additional observations about your child's learning or suggestions to improve this activity?"
                      value={feedbackForm.additional_comments}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, additional_comments: e.target.value })}
                      className="min-h-[120px] rounded-xl border-2"
                    />
                  </div>

                  <Button
                    data-testid="submit-feedback-btn"
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full rounded-full py-6 text-lg font-bold bg-primary hover:bg-primary/90"
                  >
                    {submittingFeedback ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artifacts" className="mt-8">
            <div className="space-y-8">
              <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="upload-artifact-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-secondary">Upload</CardTitle>
                  <CardDescription>Upload a photo or file of the learner's creation</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="file" className="text-base mb-2 block">
                        Choose file (photos, videos, documents)
                      </Label>
                      <Input
                        id="file"
                        data-testid="artifact-file-input"
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="h-12 rounded-xl border-2"
                      />
                      {selectedFile && (
                        <p className="mt-2 text-sm text-foreground/60">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                    <Button
                      data-testid="upload-artifact-btn"
                      type="submit"
                      disabled={uploadingArtifact || !selectedFile}
                      className="w-full rounded-full py-6 text-lg font-bold bg-primary hover:bg-primary/90"
                    >
                      {uploadingArtifact ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-5 w-5" />
                          Upload
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {artifacts.length > 0 && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="artifacts-list">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Uploaded Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {artifacts.map((artifact) => (
                        <div
                          key={artifact.id}
                          data-testid={`artifact-${artifact.id}`}
                          className="p-4 bg-muted rounded-2xl"
                        >
                          {artifact.content_type.startsWith('image/') ? (
                            <img
                              src={`data:${artifact.content_type};base64,${artifact.file_data}`}
                              alt={artifact.filename}
                              className="w-full h-48 object-cover rounded-xl mb-2"
                            />
                          ) : (
                            <div className="w-full h-48 bg-secondary/10 rounded-xl mb-2 flex items-center justify-center">
                              <Upload className="h-12 w-12 text-secondary/40" />
                            </div>
                          )}
                          <p className="text-sm font-semibold text-foreground truncate">
                            {artifact.filename}
                          </p>
                          <p className="text-xs text-foreground/60">
                            {new Date(artifact.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ActivityDetail;
