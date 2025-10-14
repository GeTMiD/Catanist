import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hexagon, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Create = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [choices, setChoices] = useState<string[]>(["", "", "", "", "", ""]);
  const [correctChoice, setCorrectChoice] = useState(0);
  const [explanation, setExplanation] = useState("");

  const updateChoice = useCallback((index: number, value: string) => {
    setChoices(prev => {
      const newChoices = [...prev];
      newChoices[index] = value;
      return newChoices;
    });
  }, []);

  const handleCorrectChoice = useCallback((index: number) => {
    setCorrectChoice(index);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title || !description || choices.some(c => !c)) {
      toast({
        title: "Incomplete puzzle",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const puzzleData = {
      title,
      description,
      difficulty,
      choices,
      correctChoice,
      explanation,
    };

    try {
      console.log(puzzleData)
      await supabase.from("puzzles_test").insert(puzzleData);
      toast({
        title: "Puzzle created!",
        description: "Your puzzle has been saved and is ready for the community",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setDifficulty("Easy");
      setChoices(["", "", "", "", "", ""]);
      setCorrectChoice(0);
      setExplanation("");

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create puzzle",
        variant: "destructive",
      });
    }
  }, [title, description, difficulty, choices, correctChoice, explanation, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Hexagon className="text-primary" />
            Create a Puzzle
          </h1>
          <p className="text-muted-foreground text-lg">
            Design a challenging scenario for the community to solve
          </p>
        </div>

        <Card className="bg-[var(--gradient-card)]">
          <CardHeader>
            <CardTitle>Puzzle Details</CardTitle>
            <CardDescription>Provide information about your puzzle scenario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Puzzle Title</Label>
              <Input
                id="title"
                placeholder="e.g., The Longest Road Decision"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Scenario Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the board state and situation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Experienced">Experienced</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Move Choices (6 required)</Label>
              {choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium w-8">{index + 1}.</span>
                    <Input
                      placeholder={`Move option ${index + 1}`}
                      value={choice}
                      onChange={(e) => updateChoice(index, e.target.value)}
                    />
                  </div>
                  <Button
                    variant={correctChoice === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCorrectChoice(index)}
                  >
                    {correctChoice === index ? "Correct" : "Mark Correct"}
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation (why this move is best)</Label>
              <Textarea
                id="explanation"
                placeholder="Explain why the correct move is optimal..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={3}
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                className="
      w-full bg-[hsl(var(--primary))] hover:bg-[hsl(16 65% 38%)] 
      text-white 
      font-semibold 
      text-lg 
      rounded-xl 
      shadow-[var(--shadow-game)] 
      hover:shadow-[var(--shadow-hover)] 
      transition-all 
      duration-300 
      flex 
      items-center 
      justify-center
    "
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Puzzle
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Board Builder (Coming Soon)</CardTitle>
            <CardDescription>
              Visual hex-based board builder will allow you to create custom Catan boards
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Create;