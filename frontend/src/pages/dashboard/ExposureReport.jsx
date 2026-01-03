import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2, TrendingUp, Award, Lightbulb, AlertCircle, BookOpen, Printer, Download, Image } from "lucide-react";
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
  
  // Portfolio images state (images uploaded via activities with portfolio consent)
  const [portfolioImages, setPortfolioImages] = useState([]);

  useEffect(() => {
    fetchReport();
    fetchPortfolioImages();
  }, [childId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API}/children/${childId}/exposure-report`, {
        headers: getAuthHeaders()
      });
      setReport(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioImages = async () => {
    try {
      const response = await axios.get(`${API}/portfolio/images/${childId}`, {
        headers: getAuthHeaders()
      });
      setPortfolioImages(response.data);
    } catch (error) {
      console.error("Error fetching portfolio images:", error);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("child_id", childId);
      if (imageCaption) {
        formData.append("caption", imageCaption);
      }
      
      await axios.post(`${API}/portfolio/images`, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data"
        }
      });
      
      toast.success("Image uploaded successfully!");
      setSelectedFile(null);
      setImageCaption("");
      fetchPortfolioImages();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }
    
    try {
      await axios.delete(`${API}/portfolio/images/${imageId}`, {
        headers: getAuthHeaders()
      });
      toast.success("Image deleted");
      fetchPortfolioImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.child_name}'s Portfolio - Revivedu</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
          h1 { color: #1a365d; margin-bottom: 10px; }
          h2 { color: #2d3748; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
          p { line-height: 1.6; color: #4a5568; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat-card { flex: 1; background: #f7fafc; border-radius: 12px; padding: 20px; text-align: center; }
          .stat-value { font-size: 36px; font-weight: bold; color: #3182ce; }
          .stat-label { color: #718096; font-size: 14px; }
          .tag { display: inline-block; background: #edf2f7; padding: 6px 16px; border-radius: 20px; margin: 4px; font-size: 14px; }
          .bar-container { background: #edf2f7; border-radius: 8px; height: 12px; margin: 8px 0; }
          .bar { background: #3182ce; height: 100%; border-radius: 8px; }
          .disclaimer { background: #fefcbf; border-left: 4px solid #d69e2e; padding: 15px; margin: 20px 0; }
          .image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .image-grid img { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${report.child_name}'s Portfolio</h1>
        <p>Generated by Revivedu - Reviving the Joy of Learning</p>
        
        <div class="disclaimer">
          <strong>Note:</strong> This portfolio reflects learning activities and experiences. It is not an assessment or diagnostic measure.
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">${report.total_activities}</div>
            <div class="stat-label">Total Activities</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${report.average_rating || "N/A"}</div>
            <div class="stat-label">Average Rating</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${report.skills_developed.length}</div>
            <div class="stat-label">Skills Developed</div>
          </div>
        </div>
        
        <h2>Intelligence Exposure</h2>
        ${Object.entries(report.intelligence_exposure).map(([intel, count]) => `
          <div style="margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span><strong>${intel}</strong></span>
              <span>${count} activities</span>
            </div>
            <div class="bar-container">
              <div class="bar" style="width: ${(count / Math.max(...Object.values(report.intelligence_exposure))) * 100}%"></div>
            </div>
          </div>
        `).join('')}
        
        <h2>Subject Coverage</h2>
        <div>
          ${Object.entries(report.subject_exposure).map(([subject, count]) => `
            <span class="tag">${subject} (${count})</span>
          `).join('')}
        </div>
        
        <h2>Identified Strengths</h2>
        <div>
          ${report.strengths.length > 0 ? report.strengths.map(s => `<span class="tag">${s}</span>`).join('') : '<p>Complete more activities to identify strengths</p>'}
        </div>
        
        <h2>Skills Portfolio</h2>
        <div>
          ${report.skills_developed.map(skill => `<span class="tag">${skill}</span>`).join('')}
        </div>
        
        <h2>Recommendations</h2>
        <ol>
          ${report.recommendations.map(rec => `<li style="margin: 10px 0;">${rec}</li>`).join('')}
        </ol>
        
        ${portfolioImages.length > 0 ? `
          <h2>Portfolio Gallery</h2>
          <div class="image-grid">
            ${portfolioImages.map(img => `
              <div>
                <img src="data:${img.content_type};base64,${img.file_data}" alt="${img.caption || 'Portfolio image'}" />
                ${img.caption ? `<p style="font-size: 12px; text-align: center; margin-top: 5px;">${img.caption}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096; font-size: 12px;">
          Generated on ${new Date().toLocaleDateString()} by Revivedu
        </footer>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
          <p className="text-xl text-foreground/60 mb-4">Portfolio not found</p>
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
      <div className="max-w-6xl mx-auto px-6 py-12" id="portfolio-content">
        <Button
          data-testid="back-dashboard-btn"
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-full print:hidden"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4" data-testid="report-header">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-2">
              {report.child_name}'s Portfolio
            </h1>
            <p className="text-lg text-foreground/80">
              Summary of learning activities, skills, and achievements
            </p>
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
          </div>
        </div>

        {/* Disclaimer Banner */}
        <Alert className="mb-8 border-accent bg-accent/10" data-testid="report-disclaimer">
          <AlertCircle className="h-5 w-5 text-accent" />
          <AlertTitle className="text-lg font-bold text-accent-foreground">This is Not an Assessment</AlertTitle>
          <AlertDescription className="text-foreground/80">
            This portfolio reflects the activities your child has engaged with and the feedback you have provided. <strong>It is not a diagnostic test, assessment, or measure of intelligence.</strong> It simply shows exposure to different learning experiences. Every child develops at their own pace in their own unique way.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end mb-6 print:hidden">
          <Button
            data-testid="view-guide-btn"
            variant="outline"
            onClick={() => navigate("/guide")}
            className="rounded-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Read Parent Guide
          </Button>
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
              <CardDescription>Distribution of activities across Multiple Intelligences Theory</CardDescription>
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

          {/* Portfolio Gallery Section - Shows images uploaded via activities */}
          <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="portfolio-gallery-card">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary flex items-center">
                <Image className="mr-2 h-6 w-6 text-primary" />
                Portfolio Gallery
              </CardTitle>
              <CardDescription>Images uploaded from activities that were marked for portfolio inclusion</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Image Gallery */}
              {portfolioImages.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolioImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={`data:${img.content_type};base64,${img.file_data}`}
                        alt={img.title || img.caption || "Portfolio image"}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      {(img.title || img.caption) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                          <p className="text-white text-sm font-medium">{img.title || img.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground/60">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No portfolio images yet.</p>
                  <p className="text-sm">Upload images in the activity "Upload" section and check "Include in Portfolio" to add them here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExposureReport;
