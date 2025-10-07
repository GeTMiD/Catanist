import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hexagon, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SolvePuzzle = () => {
  const { id } = useParams();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Mock puzzle data - will be fetched from Supabase
  const puzzle = {
    id: id || "1",
    title: "The Longest Road Decision",
    description: "You have 4 wood and 4 brick. The current longest road is 6 segments held by blue player. You have 5 connected road segments. Where should you build to secure longest road and the 2 victory points?",
    difficulty: "Easy",
    creator: "CatanMaster",
    choices: [
      "Build settlement at the coast to create a new expansion point",
      "Build two roads extending your current path inland",
      "Build a road and settlement to cut off opponent's expansion",
      "Save resources and wait for ore/wheat to buy development card",
      "Build two roads along the coast toward the port",
      "Build settlement on high-number tiles for resource generation",
    ],
    correctChoice: 1,
    explanation: "Building two roads extending your current path gives you 7 total road segments, beating blue's 6 and securing the longest road bonus (2 VP). This is the most efficient use of your wood and brick resources for immediate victory points.",
  };

  const handleSelectChoice = (index: number) => {
    setSelectedChoice(index);
    setShowResult(true);
  };

  const isCorrect = selectedChoice === puzzle.correctChoice;

  const getDifficultyColor = () => {
    switch (puzzle.difficulty) {
      case "Easy": return "bg-secondary text-secondary-foreground";
      case "Experienced": return "bg-accent text-accent-foreground";
      case "Advanced": return "bg-primary text-primary-foreground";
      case "Pro": return "bg-destructive text-destructive-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/puzzles">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Puzzles
          </Button>
        </Link>

        <Card className="bg-[var(--gradient-card)] mb-6">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <Badge className={getDifficultyColor()}>
                {puzzle.difficulty}
              </Badge>
              <span className="text-sm text-muted-foreground">
                by {puzzle.creator}
              </span>
            </div>
            <CardTitle className="text-3xl">{puzzle.title}</CardTitle>
          </CardHeader>
        </Card>

        {/* Board Preview Placeholder */}
        <Card className="mb-6 bg-muted/30">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Hexagon className="w-20 h-20 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Interactive Catan board visualization<br />
                <span className="text-sm">(Board builder coming soon)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scenario Description */}
        <Card className="mb-6 bg-[var(--gradient-card)]">
          <CardHeader>
            <CardTitle>Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{puzzle.description}</p>
          </CardContent>
        </Card>

        {/* Choices */}
        <Card className="bg-[var(--gradient-card)]">
          <CardHeader>
            <CardTitle>What's your move?</CardTitle>
            <CardDescription>Select the best strategic choice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {puzzle.choices.map((choice, index) => (
              <Button
                key={index}
                variant={selectedChoice === index ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-4 px-6"
                onClick={() => handleSelectChoice(index)}
                disabled={showResult}
              >
                <span className="font-semibold mr-3">{index + 1}.</span>
                <span>{choice}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              {isCorrect ? (
                <CheckCircle className="w-12 h-12 text-secondary" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
              <DialogTitle className="text-2xl">
                {isCorrect ? "Correct! Well done!" : "Not quite right"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold mb-2">The best move was:</p>
                <p>{puzzle.choices[puzzle.correctChoice]}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Explanation:</p>
                <p>{puzzle.explanation}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Link to="/puzzles" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Puzzles
              </Button>
            </Link>
            <Link to="/puzzles" className="flex-1">
              <Button variant="default" className="w-full">
                Next Puzzle
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolvePuzzle;
