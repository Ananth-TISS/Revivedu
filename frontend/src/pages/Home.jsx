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
                  Reviving the joy of learning
                </p>
              </div>
              <p className="text-base sm:text-lg text-foreground/80">
                A digital platform designed to address the unique educational needs of homeschooled children and gifted children (as recognized in NEP 2020) in India. We bridge the gap between specialized educational requirements, educational resources, and the lack of structured support through pedagogically-sound AI-powered personalized learning experiences.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  data-testid="generate-activity-btn"
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg font-bold shadow-pop hover:shadow-pop-hover transform hover:-translate-y-1 transition-all duration-300 bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/generate")}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Your First Activity
                </Button>
                <Button
                  data-testid="view-library-btn"
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg font-bold border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all duration-300"
                  onClick={() => navigate("/library")}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  View Activity Library
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1595987146581-b118732eb87a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxJbmRpYW4lMjBjaGlsZCUyMHN0dWRlbnQlMjBwYXJlbnQlMjBob21lJTIwc2NpZW5jZSUyMGV4cGVyaW1lbnQlMjBsZWFybmluZyUyMGFjdGl2aXR5fGVufDB8fHx8MTc2Njc1MDUxMnww&ixlib=rb-4.1.0&q=85"
                alt="Indian child learning at home with parent support"
                className="rounded-3xl shadow-pop w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Why - Addressing Critical Education Gaps */}
      <div className="bg-muted py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-secondary mb-8">
            Why Revivedu?
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-foreground/80 text-base sm:text-lg">
            <p>
              The Indian education system currently faces a significant gap in addressing the specialized needs of homeschooled children and gifted learners recognized under NEP 2020. Both groups require educational approaches that move beyond standardized content to embrace individualized learning.
            </p>
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-card rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-secondary mb-3 flex items-center">
                  <Award className="mr-2 h-6 w-6 text-primary" />
                  Gifted Learners
                </h3>
                <p className="text-foreground/80">
                  Despite NEP 2020 recognition, gifted learners lack systematic identification and personalized pathways challenging their unique abilities.
                </p>
              </div>
              <div className="bg-card rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-secondary mb-3 flex items-center">
                  <BookOpen className="mr-2 h-6 w-6 text-primary" />
                  Homeschooled Children
                </h3>
                <p className="text-foreground/80">
                  Struggle to access structured yet flexible curriculum resources aligned with national standards (NIOS).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What - Our Solution */}
      <div className="bg-card py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-secondary mb-8">
            What is Revivedu?
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-foreground/80 text-lg mb-12">
            <p>
              Revivedu integrates <strong>Howard Gardner's Multiple Intelligence Theory</strong> to provide a holistic approach to education, allowing parents and teachers to understand children's unique intelligence profiles and create tailored learning pathways.
            </p>
            <p>
              The platform offers structured access to the <strong>NIOS curriculum</strong> for grades 10 and 12 while supplementing it with AI-generated activities targeting specific intelligences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">Multiple Intelligences</h3>
              <p className="text-foreground/80">
                Activities targeting all 8 intelligence types, moving beyond traditional methods that favor only 2-3 types.
              </p>
            </div>
            <div className="bg-background rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">AI-Powered Learning</h3>
              <p className="text-foreground/80">
                Advanced AI generates personalized activities based on intelligence types, age, and NIOS curriculum alignment.
              </p>
            </div>
            <div className="bg-background rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">NEP 2020 Aligned</h3>
              <p className="text-foreground/80">
                All activities align with NCF-SE 2023 and NIOS standards, ensuring pedagogical soundness.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How - Platform Features */}
      <div className="bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-secondary mb-12">
            How It Works
          </h2>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary mb-2">Create Child Profile</h3>
                <p className="text-foreground/80">
                  Sign up and create a profile for your child, including their age, interests, and learning preferences.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary mb-2">Generate Personalized Activities</h3>
                <p className="text-foreground/80">
                  Select subjects, intelligences, and available materials. Our AI creates comprehensive, curriculum-aligned activities instantly.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary mb-2">Engage & Track Progress</h3>
                <p className="text-foreground/80">
                  Complete activities, submit feedback and artifacts. View exposure reports showing learning patterns and development.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary mb-2">Build Learning Library</h3>
                <p className="text-foreground/80">
                  Access your complete activity history, browse past activities, and track your child's holistic development journey.
                </p>
              </div>
            </div>
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
                Activities designed around all 8 intelligence types for holistic development.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-skills">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">21st Century Skills & SEL</h3>
              <p className="text-foreground/80">
                Foster critical thinking, creativity, collaboration, communication, and social-emotional learning.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-pop transition-all duration-300" data-testid="feature-card-nios">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-4">NIOS Curriculum Access</h3>
              <p className="text-foreground/80">
                Structured access to NIOS curriculum for grades 10 and 12, supplemented with AI activities.
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
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              data-testid="cta-generate-btn"
              size="lg"
              className="rounded-full px-10 py-6 text-lg font-bold shadow-pop hover:shadow-pop-hover transform hover:-translate-y-1 transition-all duration-300 bg-primary hover:bg-primary/90"
              onClick={() => navigate("/generate")}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Your First Activity
            </Button>
            <Button
              data-testid="guide-btn"
              size="lg"
              variant="outline"
              className="rounded-full px-10 py-6 text-lg font-bold border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all duration-300"
              onClick={() => navigate("/guide")}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Parent & Learner Guide
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;