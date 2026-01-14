import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@repo/ui/components/ui/sheet";
import { Button } from "@repo/ui/components/ui/button";
import { Dumbbell, Flame, Timer, Trophy, Activity, Lock, Sparkles } from "lucide-react";
import { useDockStore } from "../../../stores/dock.store";
import { useFigaroStore, type FigaroWorkout, type FigaroPR } from "../../../stores/figaro.store";
import { useShallow } from "zustand/shallow";

// Stat card component
function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-3 text-center">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
      <p className="text-lg font-semibold text-white">{value}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}

// Progress ring component
function ProgressRing({
  current,
  goal,
  label,
  color,
}: {
  current: number;
  goal: number;
  label: string;
  color: string;
}) {
  const percentage = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-white/10"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            className={color}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{current}</span>
          <span className="text-xs text-white/50">/ {goal}</span>
        </div>
      </div>
      <span className="text-xs text-white/60 mt-2">{label}</span>
    </div>
  );
}

// Workout log entry component
function WorkoutEntry({ workout }: { workout: FigaroWorkout }) {
  const time = new Date(workout.logged_at).toLocaleDateString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  const typeIcon = {
    strength: "💪",
    cardio: "🏃",
    flexibility: "🧘",
    sports: "⚽",
    other: "🏋️",
  }[workout.exercise_type] || "🏋️";

  let details = "";
  if (workout.sets && workout.reps) {
    details = `${workout.sets}x${workout.reps}`;
    if (workout.weight) {
      details += ` @ ${workout.weight}lbs`;
    }
  } else if (workout.duration_mins) {
    details = `${workout.duration_mins} min`;
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-lg">{typeIcon}</span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-white/90">{workout.exercise_name}</p>
            {workout.is_pr && (
              <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400 rounded-full">
                PR
              </span>
            )}
          </div>
          <p className="text-xs text-white/40">{time}</p>
        </div>
      </div>
      {details && (
        <span className="text-xs text-white/60">{details}</span>
      )}
    </div>
  );
}

// PR badge component
function PRBadge({ pr }: { pr: FigaroPR }) {
  let value = "";
  if (pr.weight) {
    value = `${pr.weight}lbs`;
  } else if (pr.reps) {
    value = `${pr.reps} reps`;
  } else if (pr.distance) {
    value = `${pr.distance}mi`;
  }

  return (
    <div className="flex items-center gap-2 bg-yellow-500/10 rounded-lg px-3 py-2">
      <Trophy className="w-4 h-4 text-yellow-400" />
      <div>
        <p className="text-sm text-white/90">{pr.exercise_name}</p>
        <p className="text-xs text-yellow-400/80">{value}</p>
      </div>
    </div>
  );
}

// Connect prompt for unauthenticated users
function ConnectFigaroPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Dumbbell className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Track Your Workouts</h3>
      <p className="text-sm text-white/60 mb-6 max-w-[250px]">
        Connect your Figaro account to log exercises and track PRs via text.
      </p>
      <Button
        className="bg-white/10 hover:bg-white/20 text-white"
        onClick={() => window.open("https://textfigaro.com/signup", "_blank")}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Connect Figaro
      </Button>
    </div>
  );
}

// Upgrade prompt for free users
function UpgradePrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Unlock Fitness Tracking</h3>
      <p className="text-sm text-white/60 mb-6 max-w-[250px]">
        Log workouts, track PRs, and see your weekly progress via text.
      </p>
      <Button
        className="bg-blue-500/80 hover:bg-blue-500 text-white"
        onClick={() => window.open("https://textfigaro.com/pricing", "_blank")}
      >
        Upgrade to Pro — $9/mo
      </Button>
    </div>
  );
}

// Main fitness content
function FitnessContent() {
  const { fitness, fetchFitness } = useFigaroStore(
    useShallow((state) => ({
      fitness: state.fitness,
      fetchFitness: state.fetchFitness,
    }))
  );

  useEffect(() => {
    fetchFitness();
  }, [fetchFitness]);

  if (!fitness) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-white/40 text-sm">Loading fitness data...</div>
      </div>
    );
  }

  const { summary, goals, workouts, recentPRs } = fitness;

  // Default goals if none set
  const defaultGoals = {
    workouts: goals.workouts?.target || 5,
    cardio_mins: goals.cardio_mins?.target || 150,
    strength_sessions: goals.strength_sessions?.target || 3,
  };

  return (
    <div className="space-y-6">
      {/* Weekly Progress Ring */}
      <div className="flex justify-center">
        <ProgressRing
          current={summary.totalWorkouts}
          goal={defaultGoals.workouts}
          label="workouts this week"
          color="text-blue-500"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={Dumbbell}
          value={summary.strengthSessions}
          label="strength"
          color="text-red-400"
        />
        <StatCard
          icon={Activity}
          value={summary.cardioSessions}
          label="cardio"
          color="text-green-400"
        />
        <StatCard
          icon={Timer}
          value={`${summary.totalDurationMins}m`}
          label="duration"
          color="text-purple-400"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
          <Flame className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-lg font-semibold text-white">{summary.caloriesBurned}</p>
            <p className="text-xs text-white/50">calories burned</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-lg font-semibold text-white">{summary.prsHit}</p>
            <p className="text-xs text-white/50">PRs this week</p>
          </div>
        </div>
      </div>

      {/* Recent PRs */}
      {recentPRs && recentPRs.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-3">Recent PRs</h3>
          <div className="space-y-2">
            {recentPRs.slice(0, 3).map((pr) => (
              <PRBadge key={pr.id} pr={pr} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {workouts && workouts.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/80 mb-3">This Week</h3>
          <div className="space-y-1">
            {workouts.slice(0, 5).map((workout) => (
              <WorkoutEntry key={workout.id} workout={workout} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Tip */}
      <div className="text-center text-xs text-white/40 py-2">
        Text Figaro: "did 3x10 bench press at 185"
      </div>
    </div>
  );
}

export function FigaroFitnessSheet() {
  const { isFitnessVisible, setFitnessVisible } = useDockStore(
    useShallow((state) => ({
      isFitnessVisible: state.isFigaroFitnessVisible,
      setFitnessVisible: state.setFigaroFitnessVisible,
    }))
  );

  const { isAuthenticated, isPremium } = useFigaroStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isPremium: state.isPremium,
    }))
  );

  return (
    <Sheet open={isFitnessVisible} onOpenChange={setFitnessVisible}>
      <SheetContent
        side="right"
        className="w-[380px] border-l border-white/10 bg-zinc-900/95 backdrop-blur-xl p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Dumbbell className="w-5 h-5 text-blue-400" />
            Fitness
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-100px)]">
          {!isAuthenticated ? (
            <ConnectFigaroPrompt />
          ) : !isPremium ? (
            <UpgradePrompt />
          ) : (
            <FitnessContent />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default FigaroFitnessSheet;
