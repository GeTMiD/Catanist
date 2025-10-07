import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hexagon, Filter } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";

type Difficulty = "Easy" | "Experienced" | "Advanced" | "Pro";

interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  creator: string;
  solvedCount: number;
}

const Puzzles = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "All">("All");

  // Mock data - will be replaced with Supabase
  const puzzles: Puzzle[] = [
    {
      id: "1",
      title: "The Longest Road Decision",
      description: "You have 4 wood and 4 brick. Where should you build to secure longest road?",
      difficulty: "Easy",
      creator: "CatanMaster",
      solvedCount: 234,
    },
    {
      id: "2",
      title: "Resource Optimization",
      description: "Limited resources, multiple options. What's the optimal play?",
      difficulty: "Experienced",
      creator: "StrategyPro",
      solvedCount: 156,
    },
    {
      id: "3",
      title: "Blocking the Leader",
      description: "Your opponent is 2 points from victory. How do you stop them?",
      difficulty: "Advanced",
      creator: "TacticalGenius",
      solvedCount: 89,
    },
  ];

  const difficulties: (Difficulty | "All")[] = ["All", "Easy", "Experienced", "Advanced", "Pro"];

  const filteredPuzzles = selectedDifficulty === "All" 
    ? puzzles 
    : puzzles.filter(p => p.difficulty === selectedDifficulty);

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-secondary text-secondary-foreground";
      case "Experienced": return "bg-accent text-accent-foreground";
      case "Advanced": return "bg-primary text-primary-foreground";
      case "Pro": return "bg-destructive text-destructive-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Hexagon className="text-primary" />
            Puzzle Collection
          </h1>
          <p className="text-muted-foreground text-lg">
            Test your strategic thinking with community-created Catan puzzles
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-8 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Difficulty:</span>
          </div>
          {difficulties.map((diff) => (
            <Button
              key={diff}
              variant={selectedDifficulty === diff ? "default" : "outline"}
              onClick={() => setSelectedDifficulty(diff)}
              size="sm"
            >
              {diff}
            </Button>
          ))}
        </div>

        {/* Puzzles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPuzzles.map((puzzle) => (
            <Card 
              key={puzzle.id} 
              className="bg-[var(--gradient-card)] hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)] cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getDifficultyColor(puzzle.difficulty)}>
                    {puzzle.difficulty}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {puzzle.solvedCount} solves
                  </span>
                </div>
                <CardTitle className="text-xl">{puzzle.title}</CardTitle>
                <CardDescription className="text-base">{puzzle.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    by {puzzle.creator}
                  </span>
                  <Link to={`/solve/${puzzle.id}`}>
                    <Button variant="secondary" size="sm">
                      Solve Puzzle
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPuzzles.length === 0 && (
          <div className="text-center py-12">
            <Hexagon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No puzzles found for this difficulty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Puzzles;
