import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, CheckCircle2, Upload, Star, Lightbulb, Volume2, Play, Pause } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [activeTab, setActiveTab] = useState("activity");
  const [artifacts, setArtifacts] = useState([]);
  
  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    experience: "",
    outcomes: "",
    suggestions: ""
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Artifact upload
  const [uploadingArtifact, setUploadingArtifact] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Audio state
  const [audioData, setAudioData] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useState(null);

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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (feedbackForm.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!feedbackForm.experience || !feedbackForm.outcomes) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmittingFeedback(true);
    try {
      await axios.post(`${API}/feedback`, {
        activity_id: id,
        child_id: activity?.child_id || null,
        ...feedbackForm
      });
      toast.success("Feedback submitted successfully!");
      setFeedbackForm({
        rating: 0,
        experience: "",
        outcomes: "",
        suggestions: ""
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Button
          data-testid="back-library-btn"
          variant="ghost"
          onClick={() => navigate("/library")}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>

        <div className="mb-8" data-testid="activity-header">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-4">
            {activity.title}
          </h1>
          
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-full p-1 bg-muted" data-testid="activity-tabs">
            <TabsTrigger value="activity" className="rounded-full" data-testid="tab-activity">
              Activity
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-full" data-testid="tab-feedback">
              Feedback
            </TabsTrigger>
            <TabsTrigger value="artifacts" className="rounded-full" data-testid="tab-artifacts">
              Artifacts ({artifacts.length})
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
                    <CardTitle className="text-2xl text-secondary">Additional Learning Outcomes</CardTitle>
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
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {activity.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-6 py-3 bg-secondary/10 text-secondary rounded-full font-semibold"
                        >
                          {skill}
                        </span>
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
                <CardTitle className="text-2xl text-secondary">Submit Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div>
                    <Label className="text-base mb-2 block">Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          data-testid={`rating-star-${star}`}
                          onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                          className="focus:outline-none transform hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-10 w-10 ${star <= feedbackForm.rating ? 'fill-accent text-accent' : 'text-border'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experience" className="text-base mb-2 block">Experience</Label>
                    <Textarea
                      id="experience"
                      data-testid="feedback-experience"
                      placeholder="How was the overall experience?"
                      value={feedbackForm.experience}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, experience: e.target.value })}
                      className="min-h-[100px] rounded-xl border-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="outcomes" className="text-base mb-2 block">Outcomes</Label>
                    <Textarea
                      id="outcomes"
                      data-testid="feedback-outcomes"
                      placeholder="What did your child learn?"
                      value={feedbackForm.outcomes}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, outcomes: e.target.value })}
                      className="min-h-[100px] rounded-xl border-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="suggestions" className="text-base mb-2 block">Suggestions (Optional)</Label>
                    <Textarea
                      id="suggestions"
                      data-testid="feedback-suggestions"
                      placeholder="Any suggestions for improvement?"
                      value={feedbackForm.suggestions}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, suggestions: e.target.value })}
                      className="min-h-[100px] rounded-xl border-2"
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
                  <CardTitle className="text-2xl text-secondary">Upload Artifact</CardTitle>
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
                          Upload Artifact
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {artifacts.length > 0 && (
                <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="artifacts-list">
                  <CardHeader>
                    <CardTitle className="text-2xl text-secondary">Uploaded Artifacts</CardTitle>
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