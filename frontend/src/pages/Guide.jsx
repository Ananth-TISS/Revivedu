import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Lightbulb, Users, Music, Palette, Calculator, TreePine, User, MessageCircle, AlertCircle, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Guide = () => {
  const navigate = useNavigate();

  const intelligences = [
    {
      name: "Linguistic Intelligence",
      icon: MessageCircle,
      description: "The ability to use words effectively in reading, writing, speaking, and listening. Children strong in this area enjoy stories, word games, and discussions.",
      examples: "Writing stories, debating, explaining concepts clearly"
    },
    {
      name: "Logical-Mathematical Intelligence",
      icon: Calculator,
      description: "The capacity to analyze problems logically, carry out mathematical operations, and investigate issues scientifically. These learners think in patterns and sequences.",
      examples: "Solving puzzles, conducting experiments, working with numbers"
    },
    {
      name: "Spatial Intelligence",
      icon: Palette,
      description: "The ability to think in pictures and visualize the world in 3D. These children are good at drawing, designing, and understanding maps and diagrams.",
      examples: "Drawing, building with blocks, reading maps, solving mazes"
    },
    {
      name: "Bodily-Kinesthetic Intelligence",
      icon: Users,
      description: "The capacity to use one's body skillfully and handle objects adeptly. These learners express themselves through movement and physical activities.",
      examples: "Dancing, sports, hands-on activities, acting, crafting"
    },
    {
      name: "Musical Intelligence",
      icon: Music,
      description: "The ability to produce and appreciate rhythm, pitch, and melody. These children are sensitive to sounds and often learn better with music.",
      examples: "Singing, playing instruments, recognizing patterns in music"
    },
    {
      name: "Interpersonal Intelligence",
      icon: Users,
      description: "The capacity to understand and interact effectively with others. These learners are good at reading emotions and working in groups.",
      examples: "Making friends easily, resolving conflicts, understanding others' feelings"
    },
    {
      name: "Intrapersonal Intelligence",
      icon: User,
      description: "The ability to understand oneself, including one's feelings, motivations, and goals. These children are self-aware and reflective.",
      examples: "Setting personal goals, self-reflection, understanding own emotions"
    },
    {
      name: "Naturalistic Intelligence",
      icon: TreePine,
      description: "The ability to recognize and categorize plants, animals, and other aspects of nature. These learners connect with the natural world.",
      examples: "Caring for plants/animals, noticing nature patterns, outdoor activities"
    }
  ];

  const skills21st = [
    {
      name: "Critical Thinking",
      description: "The ability to analyze information objectively and make reasoned judgments. Helps children question, evaluate, and solve problems effectively.",
      icon: Brain
    },
    {
      name: "Creativity",
      description: "The capacity to generate new ideas, approaches, or solutions. Encourages children to think outside the box and innovate.",
      icon: Lightbulb
    },
    {
      name: "Collaboration",
      description: "Working effectively with others towards a common goal. Teaches children to share ideas, listen, and contribute to group efforts.",
      icon: Users
    },
    {
      name: "Communication",
      description: "Expressing ideas clearly and understanding others. Includes speaking, writing, listening, and non-verbal communication skills.",
      icon: MessageCircle
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Button
          data-testid="back-btn"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary mb-4">
            Parent & Learner Guide
          </h1>
          <p className="text-lg text-foreground/80">
            Understanding Multiple Intelligences, 21st-Century Skills, and How to Use Revivedu Effectively
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-8 border-accent bg-accent/10" data-testid="disclaimer-alert">
          <AlertCircle className="h-5 w-5 text-accent" />
          <AlertTitle className="text-lg font-bold text-accent-foreground">Important: Understanding the Exposure Report</AlertTitle>
          <AlertDescription className="text-foreground/80">
            The "Exposure Report" in Revivedu is <strong>not an assessment or test result</strong>. It simply shows which activities your child has participated in and the feedback you've provided. It reflects <strong>exposure to different learning experiences</strong>, not a measure of ability or intelligence. Every child learns differently and at their own pace.
          </AlertDescription>
        </Alert>

        {/* What is Multiple Intelligences */}
        <Card className="rounded-3xl border-border/50 shadow-sm mb-8" data-testid="mi-section">
          <CardHeader>
            <CardTitle className="text-3xl text-secondary">What are Multiple Intelligences?</CardTitle>
            <CardDescription className="text-base">
              Developed by Dr. Howard Gardner at Harvard University, Multiple Intelligences theory recognizes that intelligence is not a single ability but a collection of different ways people learn and express themselves.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-foreground/80">
              Traditional education often focuses on linguistic and logical-mathematical intelligence. However, Gardner identified <strong>eight different types of intelligence</strong>. Every child has a unique combination of these intelligences, and all are equally valuable.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {intelligences.map((intel) => (
                <Card key={intel.name} className="border-border/30">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-3 rounded-xl">
                        <intel.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-secondary mb-1">{intel.name}</CardTitle>
                        <p className="text-sm text-foreground/80">{intel.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/60">
                      <strong>Examples:</strong> {intel.examples}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="border-secondary/20 bg-secondary/5">
              <Info className="h-5 w-5 text-secondary" />
              <AlertTitle className="text-secondary">Remember</AlertTitle>
              <AlertDescription>
                <strong>Every child has ALL intelligences</strong>, just in different strengths and combinations. The goal is not to label your child but to understand how they learn best and provide diverse experiences.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-3 text-sm text-foreground/60">
              <ExternalLink className="h-4 w-4" />
              <a 
                href="https://www.multipleintelligencesoasis.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn more about Multiple Intelligences (Harvard Project Zero)
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 21st Century Skills */}
        <Card className="rounded-3xl border-border/50 shadow-sm mb-8" data-testid="skills-section">
          <CardHeader>
            <CardTitle className="text-3xl text-secondary">Essential 21st-Century Skills</CardTitle>
            <CardDescription className="text-base">
              These are the skills children need to thrive in today's rapidly changing world. Revivedu activities are designed to develop these competencies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {skills21st.map((skill) => (
                <Card key={skill.name} className="border-border/30">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="bg-accent/10 p-3 rounded-xl">
                        <skill.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-secondary mb-1">{skill.name}</CardTitle>
                        <p className="text-sm text-foreground/80">{skill.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <p className="text-foreground/80">
              <strong>Additional skills developed through our activities:</strong> Problem-solving, adaptability, digital literacy, global awareness, self-direction, and social-emotional learning.
            </p>

            <div className="flex items-center gap-3 text-sm text-foreground/60">
              <ExternalLink className="h-4 w-4" />
              <a 
                href="https://www.oecd.org/education/2030-project/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn more about 21st-Century Skills (OECD Framework)
              </a>
            </div>
          </CardContent>
        </Card>

        {/* How to Use Revivedu */}
        <Card className="rounded-3xl border-border/50 shadow-sm mb-8" data-testid="usage-section">
          <CardHeader>
            <CardTitle className="text-3xl text-secondary">How to Use Revivedu Effectively</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted p-6 rounded-2xl">
                <h3 className="font-bold text-secondary mb-2">1. Select Intelligences Based on Activities, Not Labels</h3>
                <p className="text-foreground/80">
                  When generating activities, choose intelligences that you want to <strong>expose your child to</strong>, not just the ones they're already good at. This helps them develop a well-rounded skill set.
                </p>
              </div>

              <div className="bg-muted p-6 rounded-2xl">
                <h3 className="font-bold text-secondary mb-2">2. Focus on Variety and Exploration</h3>
                <p className="text-foreground/80">
                  Generate activities across different intelligences and subjects. Children benefit from diverse experiences, even in areas they initially find challenging.
                </p>
              </div>

              <div className="bg-muted p-6 rounded-2xl">
                <h3 className="font-bold text-secondary mb-2">3. Use Feedback to Track Engagement, Not Performance</h3>
                <p className="text-foreground/80">
                  When providing feedback, focus on your child's <strong>enjoyment, effort, and learning process</strong> rather than outcomes. The goal is growth and exploration.
                </p>
              </div>

              <div className="bg-muted p-6 rounded-2xl">
                <h3 className="font-bold text-secondary mb-2">4. View the Exposure Report as a Guide</h3>
                <p className="text-foreground/80">
                  The exposure report helps you see which areas your child has explored. Use it to identify intelligences or subjects that need more attention, not to label or limit your child.
                </p>
              </div>
            </div>

            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertTitle className="text-destructive">Avoid These Pitfalls</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>❌ <strong>Don't label your child</strong> based on the report (e.g., "She's only good at music")</p>
                <p>❌ <strong>Don't compare</strong> your child's report with others</p>
                <p>❌ <strong>Don't force activities</strong> only in "weak" areas without considering interest</p>
                <p>❌ <strong>Don't treat it as a test score</strong> or performance metric</p>
              </AlertDescription>
            </Alert>

            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary">Instead, Do This</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>✓ <strong>Celebrate all efforts</strong> and explorations</p>
                <p>✓ <strong>Encourage diverse experiences</strong> across all intelligences</p>
                <p>✓ <strong>Focus on your child's interests</strong> while gently introducing new areas</p>
                <p>✓ <strong>Use the report as conversation starter</strong> about what they enjoyed</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* NCF-SE & NIOS Alignment */}
        <Card className="rounded-3xl border-border/50 shadow-sm" data-testid="curriculum-section">
          <CardHeader>
            <CardTitle className="text-3xl text-secondary">Curriculum Alignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/80">
              All Revivedu activities are designed to align with:
            </p>
            <ul className="space-y-3 text-foreground/80">
              <li className="flex gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span><strong>NCF-SE 2023</strong> (National Curriculum Framework for School Education)</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span><strong>NIOS Standards</strong> (National Institute of Open Schooling for Grades 10 & 12)</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span><strong>NEP 2020</strong> (National Education Policy guidelines)</span>
              </li>
            </ul>
            <p className="text-foreground/80">
              This ensures that your child's learning experiences are pedagogically sound and meet national educational standards while remaining flexible and personalized.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Guide;
