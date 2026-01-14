import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/ui/sheet";
import { Button } from "@repo/ui/components/ui/button";
import { useShallow } from "zustand/shallow";
import {
  ExternalLink,
  RefreshCw,
  Lock,
  Bell,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { useDockStore } from "../../../stores/dock.store";
import { useFigaroStore, type FigaroReminder } from "../../../stores/figaro.store";

function ConnectFigaroPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Connect Your Figaro Account</h3>
      <p className="text-sm text-white/60 mb-6 max-w-xs">
        Never forget anything. Text Figaro to set reminders, view them here.
      </p>
      <Button
        variant="outline"
        className="bg-white/10 border-white/20 hover:bg-white/20"
        onClick={() => window.open("https://textfigaro.com/app", "_blank")}
      >
        Connect Figaro
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function UpgradePrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Unlock Figaro Reminders</h3>
      <p className="text-sm text-white/60 mb-6 max-w-xs">
        Set reminders via text and see them across all your devices.
      </p>
      <Button
        variant="outline"
        className="bg-white/10 border-white/20 hover:bg-white/20"
        onClick={() => window.open("https://textfigaro.com/app/settings", "_blank")}
      >
        Upgrade to Pro — $9/month
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

interface ReminderCardProps {
  reminder: FigaroReminder;
}

function ReminderCard({ reminder }: ReminderCardProps) {
  const reminderDate = new Date(reminder.time);
  const now = new Date();
  const isToday = reminderDate.toDateString() === now.toDateString();
  const isTomorrow = reminderDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  const isPast = reminderDate < now;

  const getTimeLabel = () => {
    if (isPast) return "Overdue";
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    return reminderDate.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };

  const getTimeColor = () => {
    if (isPast) return "text-red-400 bg-red-500/20";
    if (isToday) return "text-amber-400 bg-amber-500/20";
    return "text-blue-400 bg-blue-500/20";
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${getTimeColor()} flex items-center justify-center flex-shrink-0`}>
          {isPast ? (
            <AlertCircle className="w-5 h-5" />
          ) : isToday ? (
            <Bell className="w-5 h-5" />
          ) : (
            <Calendar className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/90 mb-1">{reminder.content}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full ${getTimeColor()}`}>
              {getTimeLabel()}
            </span>
            <span className="text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {reminderDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RemindersContent() {
  const { reminders, isSyncing, sync, syncError } = useFigaroStore(
    useShallow((state) => ({
      reminders: state.reminders,
      isSyncing: state.isSyncing,
      sync: state.sync,
      syncError: state.syncError,
    }))
  );

  const handleRefresh = () => {
    sync();
  };

  // Group reminders by day
  const now = new Date();
  const todayReminders = reminders.filter((r) => {
    const d = new Date(r.time);
    return d.toDateString() === now.toDateString();
  });
  const upcomingReminders = reminders.filter((r) => {
    const d = new Date(r.time);
    return d.toDateString() !== now.toDateString() && d > now;
  });
  const overdueReminders = reminders.filter((r) => new Date(r.time) < now);

  return (
    <div className="space-y-6 p-4">
      {/* Sync Status */}
      {syncError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {syncError}
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xl font-semibold text-white">{reminders.length}</p>
            <p className="text-xs text-white/40">Total</p>
          </div>
          {todayReminders.length > 0 && (
            <>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-xl font-semibold text-amber-400">{todayReminders.length}</p>
                <p className="text-xs text-white/40">Today</p>
              </div>
            </>
          )}
          {overdueReminders.length > 0 && (
            <>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-xl font-semibold text-red-400">{overdueReminders.length}</p>
                <p className="text-xs text-white/40">Overdue</p>
              </div>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => window.open("https://textfigaro.com/app/reminders", "_blank")}
        >
          Manage
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2 px-1">
            Overdue
          </h3>
          <div className="space-y-2">
            {overdueReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2 px-1">
            Today
          </h3>
          <div className="space-y-2">
            {todayReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-2 px-1">
            Upcoming
          </h3>
          <div className="space-y-2">
            {upcomingReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {reminders.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
          <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Reminders</h3>
          <p className="text-sm text-white/60 mb-4">
            Text Figaro to set your first reminder
          </p>
          <p className="text-xs text-white/40 font-mono">
            "remind me to call mom at 3pm"
          </p>
        </div>
      )}

      {/* Quick Add Tip */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <h4 className="text-sm font-medium text-amber-400 mb-1">Set Reminders</h4>
        <p className="text-xs text-white/60">
          Text Figaro: "remind me to [task] at [time]" from anywhere
        </p>
      </div>

      {/* Refresh Button */}
      <Button
        variant="ghost"
        className="w-full text-white/60 hover:text-white hover:bg-white/10"
        onClick={handleRefresh}
        disabled={isSyncing}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
        {isSyncing ? "Syncing..." : "Refresh Reminders"}
      </Button>
    </div>
  );
}

export function FigaroRemindersSheet() {
  const { isFigaroRemindersVisible, setFigaroRemindersVisible } = useDockStore(
    useShallow((state) => ({
      isFigaroRemindersVisible: state.isFigaroRemindersVisible,
      setFigaroRemindersVisible: state.setFigaroRemindersVisible,
    }))
  );

  const { isAuthenticated, isPremium, sync } = useFigaroStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isPremium: state.isPremium,
      sync: state.sync,
    }))
  );

  // Sync when sheet opens
  useEffect(() => {
    if (isFigaroRemindersVisible && isAuthenticated) {
      sync();
    }
  }, [isFigaroRemindersVisible, isAuthenticated, sync]);

  const renderContent = () => {
    if (!isAuthenticated) {
      return <ConnectFigaroPrompt />;
    }

    if (!isPremium) {
      return <UpgradePrompt />;
    }

    return <RemindersContent />;
  };

  return (
    <Sheet open={isFigaroRemindersVisible} onOpenChange={setFigaroRemindersVisible}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md bg-zinc-900/95 backdrop-blur-xl border-l border-white/10"
      >
        <SheetHeader className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-white">Figaro Reminders</SheetTitle>
              <SheetDescription className="text-white/60">
                Your upcoming reminders
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </SheetContent>
    </Sheet>
  );
}
