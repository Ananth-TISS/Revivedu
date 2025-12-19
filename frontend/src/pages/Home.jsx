import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Users, Lightbulb, Target, Award, Brain, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="flex justify-end mb-6 gap-3">
            {isAuthenticated ? (
              <Button
                data-testid="dashboard-btn"
                onClick={() => navigate("/dashboard")}
                className="rounded-full bg-secondary hover:bg-secondary/90 text-white"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  data-testid="login-btn"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="rounded-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  data-testid="signup-btn"
                  onClick={() => navigate("/signup")}
                  className="rounded-full bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-secondary leading-tight mb-4">
                  Revivedu
                </h1>
                <p className="text-xl sm:text-2xl text-primary font-semibold mb-4">
                  Reviving Education Through Intelligence
                </p>
              </div>
              <p className="text-base sm:text-lg text-foreground/80">
                A digital platform designed to address the unique education needs of <strong>Gifted Children</strong> (recognized in NEP 2020) and <strong>Homeschooled children</strong> in India. We bridge the gap between specialized educational requirements and accessible resources through AI-powered personalized learning.
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
                src="https://images.unsplash.com/photo-1594708767771-a7502209ff51?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBjaGlsZCUyMHNjaWVuY2UlMjBleHBlcmltZW50JTIwbGVhcm5pbmclMjBob21lfGVufDB8fHx8MTc2NjE0MjU1NHww&ixlib=rb-4.1.0&q=85"
                alt="Indian children learning and playing"
                className="rounded-3xl shadow-pop w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* What is Revivedu Section */}
      <div className="bg-card py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-secondary mb-8">
            What is Revivedu?
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-foreground/80 text-lg">
            <p>
              Revivedu integrates <strong>Howard Gardner's Multiple Intelligence Theory</strong> to provide a holistic approach to education, allowing parents and teachers to understand children's unique intelligence profiles and create tailored learning pathways.
            </p>
            <p>
              The platform offers structured access to the <strong>NIOS curriculum</strong> for grades 10 and 12 while supplementing it with AI-generated activities targeting specific intelligences. Through a comprehensive onboarding process, activity generation engine, and detailed progress tracking, Revivedu aims to democratize quality education for gifted and homeschooled children.
            </p>
          </div>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="bg-muted py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-secondary mb-8">
            Addressing Critical Education Gaps in India
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-foreground/80 text-base sm:text-lg">
            <p>
              The Indian education system currently faces a significant gap in addressing the specialized needs of two growing student demographics: <strong>gifted children recognized under NEP 2020</strong> and the increasing number of <strong>homeschooled children</strong> (~15,000+ families).
            </p>
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-card rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-secondary mb-3 flex items-center">
                  <Award className="mr-2 h-6 w-6 text-primary" />
                  Gifted Learners
                </h3>
                <p className="text-foreground/80">
                  Despite policy recognition, gifted learners lack systematic identification methods and personalized learning pathways that challenge their unique abilities across multiple intelligence domains.
                </p>
              </div>
              <div className="bg-card rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-secondary mb-3 flex items-center">
                  <BookOpen className="mr-2 h-6 w-6 text-primary" />
                  Homeschooled Children
                </h3>
                <p className="text-foreground/80">
                  Struggle to access structured yet flexible curriculum resources aligned with national standards (NIOS), requiring individualized learning approaches.
                </p>
              </div>
            </div>
            <p>
              Both groups require educational approaches that move beyond standardized content to embrace individualized learning that nurtures their specific strengths. Current solutions are fragmented, with limited integration of multiple intelligence theory into practical learning activities.
            </p>
            <p>
              Additionally, parents and teachers often lack the training and tools to effectively identify intelligence patterns and create appropriate learning experiences. There is an identified need for a comprehensive platform that combines theoretical frameworks with practical applications.
            </p>
          </div>
        </div>
      </div>

      {/* Our Approach Section */}
      <div className="bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-secondary mb-12">
            Our Approach to the Solution
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-mi">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">Multiple Intelligences Theory</h3>
              <p className="text-foreground/80">
                Leveraging Howard Gardner's theory to identify and nurture 8 types of intelligence, moving beyond traditional methods that favor only 2-3 intelligence types.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-ai">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">AI-Powered Personalization</h3>
              <p className="text-foreground/80">
                Advanced AI engine generates custom activities based on intelligence types, age, subject matter, and NIOS curriculum alignment for truly personalized learning.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-nep">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">NEP 2020 Aligned</h3>
              <p className="text-foreground/80">
                Aligned with NEP 2020's vision of "developing an equitable and just society" through education, democratizing specialized educational approaches.
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto space-y-6 text-foreground/80 text-base sm:text-lg">
            <p>
              Revivedu's design recognizes that traditional educational methods often fail to address the diverse ways in which children learn and express intelligence. Standardized curricula and academic timetables unevenly favour only 2-3 types of intelligence (logical-mathematical, verbal-linguistic, and visual-spatial) as learners move to larger public examination levels.
            </p>
            <p>
              By identifying and nurturing specific intelligence types from logical-mathematical to interpersonal and others, Revivedu enables children and their parents (gifted and homeschooled) to learn in ways that best match their natural inclinations and strengths.
            </p>
            <p>
              Our technological foundation leverages <strong>data analytics and artificial intelligence</strong> to tailor content, pace, and teaching methods to individual needs. This personalization happens through the platform's AI engine, which generates custom activities based on specific parameters including intelligence types, age group, subject matter alignment with NIOS curriculum, and activity duration.
            </p>
          </div>
        </div>
      </div>

      {/* Learning in Action Section */}
      <div className="bg-card py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-secondary mb-8">
            Learning in Action
          </h2>
          <p className="text-center text-foreground/80 text-lg mb-12 max-w-3xl mx-auto">
            See how Revivedu transforms everyday moments into rich learning experiences for Indian children
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-3xl overflow-hidden shadow-sm hover:shadow-pop transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1757877203307-585dabb4e41a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBraWQlMjBlZHVjYXRpb25hbCUyMGFjdGl2aXR5JTIwcmVhZGluZyUyMHN0dWR5aW5nfGVufDB8fHx8MTc2NjE0MjU1N3ww&ixlib=rb-4.1.0&q=85"
                alt="Indian child reading and learning"
                className="w-full h-64 object-cover"
              />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-secondary mb-2">Reading & Exploration</h3>
                <p className="text-foreground/70">Building linguistic intelligence through stories and books</p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-sm hover:shadow-pop transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1677132533191-5f8f337a54e3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxJbmRpYW4lMjBjaGlsZHJlbiUyMGNyZWF0aXZlJTIwYWN0aXZpdHklMjBhcnQlMjBjcmFmdCUyMHBsYXl8ZW58MHx8fHwxNzY2MTQyNTU1fDA&ixlib=rb-4.1.0&q=85"
                alt="Indian children doing creative activities"
                className="w-full h-64 object-cover"
              />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-secondary mb-2">Creative Expression</h3>
                <p className="text-foreground/70">Nurturing artistic and spatial intelligence through hands-on activities</p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-sm hover:shadow-pop transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1642140027869-03591a109d61?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxJbmRpYW4lMjBjaGlsZCUyMHNjaWVuY2UlMjBleHBlcmltZW50JTIwbGVhcm5pbmclMjBob21lfGVufDB8fHx8MTc2NjE0MjU1NHww&ixlib=rb-4.1.0&q=85"
                alt="Indian children collaborating"
                className="w-full h-64 object-cover"
              />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-secondary mb-2">Collaborative Learning</h3>
                <p className="text-foreground/70">Developing interpersonal skills through group activities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-secondary mb-12">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-intelligences">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">8 Multiple Intelligences</h3>
              <p className="text-foreground/80">
                Activities designed around all 8 intelligence types: linguistic, logical-mathematical, spatial, bodily-kinesthetic, musical, interpersonal, intrapersonal, and naturalistic.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-skills">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">21st Century Skills & SEL</h3>
              <p className="text-foreground/80">
                Foster critical thinking, creativity, collaboration, communication, and social-emotional learning through carefully crafted activities.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-nios">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">NIOS Curriculum Access</h3>
              <p className="text-foreground/80">
                Structured access to NIOS curriculum for grades 10 and 12, supplemented with AI-generated activities targeting specific intelligences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-6">
            Start Your Personalized Learning Journey
          </h2>
          <p className="text-lg text-foreground/80 mb-8">
            Create your first personalized learning activity in minutes, tailored to your child's unique intelligence profile.
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