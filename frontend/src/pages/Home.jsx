import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Users, Lightbulb } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary leading-tight">
                Empower Your Child's Learning Journey
              </h1>
              <p className="text-base sm:text-lg text-foreground/80">
                AI-powered activity generator designed for homeschooled and gifted children.
                Create engaging, personalized learning experiences that develop multiple intelligences,
                21st-century skills, and social-emotional growth.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  data-testid="generate-activity-btn"
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg font-bold shadow-pop hover:shadow-pop-hover transform hover:-translate-y-1 transition-all duration-300 bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/generate")}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Activity
                </Button>
                <Button
                  data-testid="view-library-btn"
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg font-bold border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all duration-300"
                  onClick={() => navigate("/library")}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  View Library
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1613271752699-ede48a285196?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGxlYXJuaW5nJTIwc2NpZW5jZSUyMGV4cGVyaW1lbnQlMjBob21lfGVufDB8fHx8MTc2NjA2MTA1OXww&ixlib=rb-4.1.0&q=85"
                alt="Child learning science"
                className="rounded-3xl shadow-pop w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-secondary mb-12">
            Why Choose Our Portal?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-intelligences">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">Multiple Intelligences</h3>
              <p className="text-foreground/80">
                Activities designed around Howard Gardner's theory, engaging linguistic, logical-mathematical,
                spatial, musical, and all other intelligences.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-skills">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">21st Century Skills</h3>
              <p className="text-foreground/80">
                Foster critical thinking, creativity, collaboration, and communication through
                carefully crafted activities.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-sel">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">SEL Focus</h3>
              <p className="text-foreground/80">
                Build social and emotional learning skills including self-awareness, self-management,
                and relationship building.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-6">
            Ready to Start?
          </h2>
          <p className="text-lg text-foreground/80 mb-8">
            Create your first personalized learning activity in minutes.
          </p>
          <Button
            data-testid="cta-generate-btn"
            size="lg"
            className="rounded-full px-10 py-6 text-lg font-bold shadow-pop hover:shadow-pop-hover transform hover:-translate-y-1 transition-all duration-300 bg-primary hover:bg-primary/90"
            onClick={() => navigate("/generate")}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Your First Activity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;