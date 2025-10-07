import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hexagon, Trophy, Target, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";

const Progress = () => {
  // Mock data - will be replaced with real tracking
  const stats = {
    totalSolved: 42,
    correctRate: 76,
    streak: 5,
    byDifficulty: [
      { level: "Easy", solved: 20, correct: 18 },
      { level: "Experienced", solved: 15, correct: 11 },
      { level: "Advanced", solved: 7, correct: 5 },
      { level: "Pro", solved: 0, correct: 0 },
    ],
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Easy": return "bg-secondary text-secondary-foreground";
      case "Experienced": return "bg-accent text-accent-foreground";
      case "Advanced": return "bg-primary text-primary-foreground";
      case "Pro": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Trophy className="text-primary" />
            Your Progress
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your improvement and see where you excel
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[var(--gradient-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalSolved}</div>
              <p className="text-xs text-muted-foreground mt-1">puzzles completed</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--gradient-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.correctRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">correct answers</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--gradient-card)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Hexagon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.streak}</div>
              <p className="text-xs text-muted-foreground mt-1">consecutive correct</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance by Difficulty */}
        <Card className="bg-[var(--gradient-card)]">
          <CardHeader>
            <CardTitle>Performance by Difficulty</CardTitle>
            <CardDescription>See how you perform at each level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.byDifficulty.map((diff, index) => {
              const rate = diff.solved > 0 ? Math.round((diff.correct / diff.solved) * 100) : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getDifficultyColor(diff.level)}>
                        {diff.level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {diff.solved} solved
                      </span>
                    </div>
                    <span className="font-semibold">{rate}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity (placeholder) */}
        <Card className="mt-6 bg-muted/30">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest puzzle attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              Solve your first puzzle to see activity here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
