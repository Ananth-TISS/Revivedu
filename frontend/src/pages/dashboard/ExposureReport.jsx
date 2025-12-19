import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2, TrendingUp, Award, Lightbulb } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExposureReport = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [childId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API}/children/${childId}/exposure-report`, {
        headers: getAuthHeaders()
      });
      setReport(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load exposure report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-foreground/60 mb-4">Report not found</p>
          <Button onClick={() => navigate("/dashboard")} className="rounded-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const maxIntelligenceCount = Math.max(...Object.values(report.intelligence_exposure));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Button
          data-testid="back-dashboard-btn"
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8" data-testid="report-header">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-2">
            {report.child_name}'s Exposure Report
          </h1>
          <p className="text-lg text-foreground/80">
            Comprehensive analysis of learning activities and intelligence development
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="stat-activities">
            <CardHeader>
              <CardDescription>Total Activities</CardDescription>
              <CardTitle className="text-4xl text-primary">{report.total_activities}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="stat-rating">
            <CardHeader>
              <CardDescription>Average Rating</CardDescription>
              <CardTitle className="text-4xl text-accent">{report.average_rating || "N/A"}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="stat-skills">
            <CardHeader>
              <CardDescription>Skills Developed</CardDescription>
              <CardTitle className="text-4xl text-secondary">{report.skills_developed.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="intelligence-exposure-card">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-primary" />
                Intelligence Exposure
              </CardTitle>
              <CardDescription>Distribution of activities across Multiple Intelligences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.intelligence_exposure).map(([intelligence, count]) => (
                  <div key={intelligence}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{intelligence}</span>
                      <span className="text-sm text-foreground/60">{count} activities</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxIntelligenceCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="subject-exposure-card">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Subject Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(report.subject_exposure).map(([subject, count]) => (
                  <div
                    key={subject}
                    className="px-6 py-3 bg-secondary/10 text-secondary rounded-full font-semibold"
                  >
                    {subject} ({count})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="strengths-card">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary flex items-center">
                <Award className="mr-2 h-6 w-6 text-accent" />
                Identified Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.strengths.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {report.strengths.map((strength, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-3 bg-accent/20 text-accent-foreground rounded-full font-semibold"
                    >
                      {strength}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground/60">Complete more activities to identify strengths</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="recommendations-card">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary flex items-center">
                <Lightbulb className="mr-2 h-6 w-6 text-primary" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.recommendations.map((recommendation, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-foreground/80">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="skills-card">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Skills Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {report.skills_developed.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-muted text-foreground rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExposureReport;