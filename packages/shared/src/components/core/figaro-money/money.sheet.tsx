import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@repo/ui/components/ui/sheet";
import { Button } from "@repo/ui/components/ui/button";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Sparkles
} from "lucide-react";
import { useDockStore } from "../../../stores/dock.store";
import { useFigaroStore, type FigaroExpense, type FigaroIOU, type FigaroSubscription } from "../../../stores/figaro.store";
import { useShallow } from "zustand/shallow";

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Category breakdown bar
function CategoryBar({
  category,
  amount,
  total
}: {
  category: string;
  amount: number;
  total: number;
}) {
  const percentage = total > 0 ? (amount / total) * 100 : 0;

  const categoryColors: Record<string, string> = {
    food: "bg-orange-500",
    groceries: "bg-green-500",
    dining: "bg-red-500",
    transportation: "bg-blue-500",
    gas: "bg-yellow-500",
    entertainment: "bg-purple-500",
    shopping: "bg-pink-500",
    utilities: "bg-cyan-500",
    health: "bg-emerald-500",
    other: "bg-gray-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-xs text-white/60 capitalize truncate">{category}</div>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${categoryColors[category] || "bg-gray-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="w-16 text-xs text-white/80 text-right">{formatCurrency(amount)}</div>
    </div>
  );
}

// Expense entry component
function ExpenseEntry({ expense }: { expense: FigaroExpense }) {
  const time = new Date(expense.logged_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 truncate">{expense.description}</p>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>{time}</span>
          {expense.merchant && <span>• {expense.merchant}</span>}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">{formatCurrency(expense.amount)}</p>
        <p className="text-xs text-white/40 capitalize">{expense.category}</p>
      </div>
    </div>
  );
}

// IOU entry component
function IOUEntry({ iou }: { iou: FigaroIOU }) {
  const isOwedToMe = iou.direction === "owed_to_me";

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isOwedToMe ? "bg-green-500/20" : "bg-red-500/20"
        }`}>
          {isOwedToMe ? (
            <ArrowDownLeft className="w-4 h-4 text-green-400" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-red-400" />
          )}
        </div>
        <div>
          <p className="text-sm text-white/90">{iou.person_name}</p>
          {iou.reason && (
            <p className="text-xs text-white/40 truncate max-w-[150px]">{iou.reason}</p>
          )}
        </div>
      </div>
      <p className={`text-sm font-medium ${isOwedToMe ? "text-green-400" : "text-red-400"}`}>
        {isOwedToMe ? "+" : "-"}{formatCurrency(iou.amount)}
      </p>
    </div>
  );
}

// Subscription entry component
function SubscriptionEntry({ sub }: { sub: FigaroSubscription }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm text-white/90">{sub.name}</p>
        <p className="text-xs text-white/40 capitalize">{sub.frequency}</p>
      </div>
      <p className="text-sm font-medium text-white">{formatCurrency(sub.amount)}</p>
    </div>
  );
}

// Connect prompt for unauthenticated users
function ConnectFigaroPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Wallet className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Track Your Money</h3>
      <p className="text-sm text-white/60 mb-6 max-w-[250px]">
        Connect your Figaro account to track expenses and IOUs via text.
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
      <h3 className="text-lg font-medium text-white mb-2">Unlock Money Tracking</h3>
      <p className="text-sm text-white/60 mb-6 max-w-[250px]">
        Track expenses, manage IOUs, and see spending breakdowns via text.
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

// Main money content
function MoneyContent() {
  const { money, fetchMoney } = useFigaroStore(
    useShallow((state) => ({
      money: state.money,
      fetchMoney: state.fetchMoney,
    }))
  );

  useEffect(() => {
    fetchMoney();
  }, [fetchMoney]);

  if (!money) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-white/40 text-sm">Loading money data...</div>
      </div>
    );
  }

  const { spending, ious, subscriptions, recentExpenses } = money;
  const categoryEntries = Object.entries(spending.categoryBreakdown || {}).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-lg font-semibold text-white">{formatCurrency(spending.total)}</p>
          <p className="text-xs text-white/50">spent</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-lg font-semibold text-white">{formatCurrency(ious.owedToMe)}</p>
          <p className="text-xs text-white/50">owed to you</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <CreditCard className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-semibold text-white">{formatCurrency(subscriptions.monthlyTotal)}</p>
          <p className="text-xs text-white/50">subs/mo</p>
        </div>
      </div>

      {/* Net IOU Balance */}
      {(ious.owedToMe > 0 || ious.iOwe > 0) && (
        <div className={`rounded-xl p-4 ${
          ious.netBalance >= 0 ? "bg-green-500/10" : "bg-red-500/10"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Net IOU Balance</span>
            <span className={`text-lg font-semibold ${
              ious.netBalance >= 0 ? "text-green-400" : "text-red-400"
            }`}>
              {ious.netBalance >= 0 ? "+" : ""}{formatCurrency(ious.netBalance)}
            </span>
          </div>
        </div>
      )}

      {/* Spending Breakdown */}
      {categoryEntries.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-orange-400" />
            This Month
          </h3>
          <div className="space-y-2">
            {categoryEntries.slice(0, 5).map(([category, amount]) => (
              <CategoryBar
                key={category}
                category={category}
                amount={amount}
                total={spending.total}
              />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-sm">
            <span className="text-white/60">{spending.transactionCount} transactions</span>
            <span className="text-white/80">
              Avg: {formatCurrency(spending.avgTransaction)}
            </span>
          </div>
        </div>
      )}

      {/* Pending IOUs */}
      {ious.pending && ious.pending.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-yellow-400" />
            Pending IOUs ({ious.pendingCount})
          </h3>
          <div>
            {ious.pending.slice(0, 5).map((iou) => (
              <IOUEntry key={iou.id} iou={iou} />
            ))}
          </div>
        </div>
      )}

      {/* Active Subscriptions */}
      {subscriptions.active && subscriptions.active.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            Subscriptions
          </h3>
          <div>
            {subscriptions.active.slice(0, 5).map((sub) => (
              <SubscriptionEntry key={sub.id} sub={sub} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      {recentExpenses && recentExpenses.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/80 mb-3">Recent Expenses</h3>
          <div>
            {recentExpenses.slice(0, 5).map((expense) => (
              <ExpenseEntry key={expense.id} expense={expense} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {spending.total === 0 && ious.pendingCount === 0 && (
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/60 mb-2">No expenses tracked yet</p>
          <p className="text-xs text-white/40">
            Text Figaro: "Spent $45 on lunch at Chipotle"
          </p>
        </div>
      )}

      {/* Quick Tip */}
      <div className="text-center text-xs text-white/40 py-2">
        Text Figaro: "John owes me $20 for dinner"
      </div>
    </div>
  );
}

export function FigaroMoneySheet() {
  const { isMoneyVisible, setMoneyVisible } = useDockStore(
    useShallow((state) => ({
      isMoneyVisible: state.isFigaroMoneyVisible,
      setMoneyVisible: state.setFigaroMoneyVisible,
    }))
  );

  const { isAuthenticated, isPremium } = useFigaroStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isPremium: state.isPremium,
    }))
  );

  return (
    <Sheet open={isMoneyVisible} onOpenChange={setMoneyVisible}>
      <SheetContent
        side="right"
        className="w-[380px] border-l border-white/10 bg-zinc-900/95 backdrop-blur-xl p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Money
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-100px)]">
          {!isAuthenticated ? (
            <ConnectFigaroPrompt />
          ) : !isPremium ? (
            <UpgradePrompt />
          ) : (
            <MoneyContent />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default FigaroMoneySheet;
