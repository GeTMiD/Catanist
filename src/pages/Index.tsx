import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hexagon, Brain, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-catan.jpg";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "Strategic Puzzles",
      description: "Practice decision-making with real Catan scenarios created by the community",
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor your improvement across difficulty levels and puzzle types",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Create, solve, and discuss puzzles with Catan enthusiasts worldwide",
    },
  ];

  const difficulties = [
    { level: "Easy", color: "bg-secondary" },
    { level: "Experienced", color: "bg-accent" },
    { level: "Advanced", color: "bg-primary" },
    { level: "Pro", color: "bg-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container relative mx-auto px-4 py-24 text-center">
          <div className="flex flex-col items-center mb-6">
            <Hexagon className="w-20 h-20 text-primary animate-pulse" />
            <span className="mt-3 font-bold text-xl text-primary">Catanist</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-[var(--gradient-hero)] bg-clip-text text-transparent">
            Master Catan Strategy
          </h1>
          <p className="text-xl font-semibold text-black mb-8 max-w-2xl mx-auto">
            Sharpen your decision-making skills with community-created puzzles.
            Build boards, solve scenarios, and become a better Catan player.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/puzzles">
              <Button variant="primary" size="lg" className="">
                Start Solving
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="hero" size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                Create Puzzle
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <div className="h-10 bg-gradient-to-b from-black/50 to-[#f5f1ea]" />

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Train with Puzzles?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-[var(--gradient-card)] border-border hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)]">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Difficulty Levels */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Challenge Yourself</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {difficulties.map((diff, index) => (
              <Card key={index} className="text-center hover:scale-105 transition-transform cursor-pointer">
                <CardHeader>
                  <div className={`w-16 h-16 ${diff.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                    <Hexagon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>{diff.level}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--gradient-hero)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Improve Your Game?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the community and start solving puzzles today
          </p>
          <Link to="/puzzles">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Browse Puzzles
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
