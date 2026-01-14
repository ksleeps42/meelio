import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@repo/ui/components/ui/sheet";
import { Button } from "@repo/ui/components/ui/button";
import { UtensilsCrossed, Droplets, Apple, Flame, Beef, Wheat, Lock, Sparkles } from "lucide-react";
import { useDockStore } from "../../../stores/dock.store";
import { useFigaroStore } from "../../../stores/figaro.store";
import { useShallow } from "zustand/shallow";

// Macro progress bar component
function MacroBar({
  label,
  icon: Icon,
  current,
  goal,
  unit,
  color,
}: {
  label: string;
  icon: React.ElementType;
  current: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const percentage = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-white/60">
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
        <span className="text-white/80 font-medium">
          {current.toFixed(0)}{unit ? unit : ""} / {goal}{unit ? unit : ""}
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Food log entry component
function FoodLogEntry({ description, meal_type, calories, logged_at }: {
  description: string;
  meal_type: string;
  calories?: number;
  logged_at: string;
}) {
  const time = new Date(logged_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const mealIcon = {
    breakfast: "🍳",
    lunch: "🥗",
    dinner: "🍽️",
    snack: "🍎",
    other: "🍴",
  }[meal_type] || "🍴";

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-lg">{mealIcon}</span>
        <div>
          <p className="text-sm text-white/90">{description}</p>
          <p className="text-xs text-white/40">{time}</p>
        </div>
      </div>
      {calories && (
        <span className="text-xs text-white/60">{calories} cal</span>
      )}
    </div>
  );
}

// Connect prompt for unauthenticated users
function ConnectFigaroPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <UtensilsCrossed className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Track Your Nutrition</h3>
      <p className="text-sm text-white/60 mb-6 max-w-[250px]">
        Connect your Figaro account to track macros and meals via text.
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
      <h3 className="text-lg font-medium text-white mb-2">Unlock Nutrition Tracking</h3>
      <p className="text-sm text-white/60 mb-6 max-w-[250px]">
        Track macros, log meals via text, and see your daily progress.
      </p>
      <Button
        className="bg-emerald-500/80 hover:bg-emerald-500 text-white"
        onClick={() => window.open("https://textfigaro.com/pricing", "_blank")}
      >
        Upgrade to Pro — $9/mo
      </Button>
    </div>
  );
}

// Main nutrition content
function NutritionContent() {
  const { nutrition, fetchNutrition } = useFigaroStore(
    useShallow((state) => ({
      nutrition: state.nutrition,
      fetchNutrition: state.fetchNutrition,
    }))
  );

  useEffect(() => {
    fetchNutrition();
  }, [fetchNutrition]);

  if (!nutrition) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-white/40 text-sm">Loading nutrition data...</div>
      </div>
    );
  }

  const { totals, goals, logs } = nutrition;

  // Default goals if none set
  const defaultGoals = {
    calories: goals.calories?.target || 2000,
    protein: goals.protein?.target || 150,
    carbs: goals.carbs?.target || 250,
    fat: goals.fat?.target || 65,
    water: goals.water?.target || 100,
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-lg font-semibold text-white">{totals.calories}</p>
          <p className="text-xs text-white/50">calories</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Apple className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-lg font-semibold text-white">{totals.meals}</p>
          <p className="text-xs text-white/50">meals</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-semibold text-white">{totals.water}oz</p>
          <p className="text-xs text-white/50">water</p>
        </div>
      </div>

      {/* Macro Progress */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-medium text-white/80 mb-3">Today's Progress</h3>
        <MacroBar
          label="Calories"
          icon={Flame}
          current={totals.calories}
          goal={defaultGoals.calories}
          unit=""
          color="bg-orange-500"
        />
        <MacroBar
          label="Protein"
          icon={Beef}
          current={totals.protein}
          goal={defaultGoals.protein}
          unit="g"
          color="bg-red-500"
        />
        <MacroBar
          label="Carbs"
          icon={Wheat}
          current={totals.carbs}
          goal={defaultGoals.carbs}
          unit="g"
          color="bg-amber-500"
        />
        <MacroBar
          label="Fat"
          icon={Apple}
          current={totals.fat}
          goal={defaultGoals.fat}
          unit="g"
          color="bg-yellow-500"
        />
        <MacroBar
          label="Water"
          icon={Droplets}
          current={totals.water}
          goal={defaultGoals.water}
          unit="oz"
          color="bg-blue-500"
        />
      </div>

      {/* Food Log */}
      {logs && logs.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/80 mb-3">Today's Log</h3>
          <div className="space-y-1">
            {logs.map((log) => (
              <FoodLogEntry key={log.id} {...log} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Tip */}
      <div className="text-center text-xs text-white/40 py-2">
        Text Figaro to log: "had eggs for breakfast"
      </div>
    </div>
  );
}

export function FigaroNutritionSheet() {
  const { isNutritionVisible, setNutritionVisible } = useDockStore(
    useShallow((state) => ({
      isNutritionVisible: state.isFigaroNutritionVisible,
      setNutritionVisible: state.setFigaroNutritionVisible,
    }))
  );

  const { isAuthenticated, isPremium } = useFigaroStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isPremium: state.isPremium,
    }))
  );

  return (
    <Sheet open={isNutritionVisible} onOpenChange={setNutritionVisible}>
      <SheetContent
        side="right"
        className="w-[380px] border-l border-white/10 bg-zinc-900/95 backdrop-blur-xl p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <SheetTitle className="flex items-center gap-2 text-white">
            <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
            Nutrition
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-100px)]">
          {!isAuthenticated ? (
            <ConnectFigaroPrompt />
          ) : !isPremium ? (
            <UpgradePrompt />
          ) : (
            <NutritionContent />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default FigaroNutritionSheet;
