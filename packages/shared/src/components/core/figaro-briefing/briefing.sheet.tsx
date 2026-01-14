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
import { ExternalLink, RefreshCw, Clock, Calendar, Bell, Lock } from "lucide-react";

import { useDockStore } from "../../../stores/dock.store";
import { useFigaroStore } from "../../../stores/figaro.store";

function ConnectFigaroPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Connect Your Figaro Account</h3>
      <p className="text-sm text-white/60 mb-6 max-w-xs">
        Get your personalized daily briefing with weather, schedule, reminders, and more.
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
      <h3 className="text-lg font-medium text-white mb-2">Unlock Daily Briefings</h3>
      <p className="text-sm text-white/60 mb-6 max-w-xs">
        Upgrade to Figaro Pro to get personalized daily briefings delivered every morning.
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

function BriefingContent() {
  const { briefing, reminders, lists, memoriesCount, isSyncing, sync, syncError } = useFigaroStore(
    useShallow((state) => ({
      briefing: state.briefing,
      reminders: state.reminders,
      lists: state.lists,
      memoriesCount: state.memoriesCount,
      isSyncing: state.isSyncing,
      sync: state.sync,
      syncError: state.syncError,
    }))
  );

  const handleRefresh = () => {
    sync();
  };

  const openBriefing = () => {
    if (briefing?.shortcode) {
      window.open(`https://textfigaro.com/b/${briefing.shortcode}`, "_blank");
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Sync Status */}
      {syncError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {syncError}
        </div>
      )}

      {/* Daily Briefing Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Daily Briefing</h3>
          </div>
          {briefing && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-2"
              onClick={openBriefing}
            >
              View Full
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>

        {briefing ? (
          <div className="space-y-2">
            <p className="text-xs text-white/40">
              Generated {new Date(briefing.generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </p>
            <Button
              variant="outline"
              className="w-full bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-400"
              onClick={openBriefing}
            >
              Read Today's Briefing
            </Button>
          </div>
        ) : (
          <p className="text-sm text-white/60">
            No briefing generated yet today. Check back later!
          </p>
        )}
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-medium text-white">Upcoming Reminders</h3>
          <span className="ml-auto text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
            {reminders.length}
          </span>
        </div>

        {reminders.length > 0 ? (
          <div className="space-y-2">
            {reminders.slice(0, 5).map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Clock className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{reminder.content}</p>
                  <p className="text-xs text-white/40">
                    {new Date(reminder.time).toLocaleString([], {
                      weekday: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {reminders.length > 5 && (
              <p className="text-xs text-white/40 text-center pt-2">
                +{reminders.length - 5} more reminders
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-white/60">No upcoming reminders</p>
        )}
      </div>

      {/* Lists Summary */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-sm font-medium text-white">Your Lists</h3>
          <span className="ml-auto text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
            {lists.length} lists
          </span>
        </div>

        {lists.length > 0 ? (
          <div className="space-y-2">
            {lists.slice(0, 4).map((list) => (
              <div
                key={list.name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="text-sm text-white/80 capitalize">{list.name}</span>
                <span className="text-xs text-white/40">{list.count} items</span>
              </div>
            ))}
            {lists.length > 4 && (
              <p className="text-xs text-white/40 text-center pt-2">
                +{lists.length - 4} more lists
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-white/60">No lists yet</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
          <p className="text-2xl font-semibold text-white">{memoriesCount}</p>
          <p className="text-xs text-white/40">Memories</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
          <p className="text-2xl font-semibold text-white">
            {lists.reduce((acc, list) => acc + list.count, 0)}
          </p>
          <p className="text-xs text-white/40">Total Items</p>
        </div>
      </div>

      {/* Refresh Button */}
      <Button
        variant="ghost"
        className="w-full text-white/60 hover:text-white hover:bg-white/10"
        onClick={handleRefresh}
        disabled={isSyncing}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Refresh Data'}
      </Button>
    </div>
  );
}

export function FigaroBriefingSheet() {
  const { isFigaroBriefingVisible, setFigaroBriefingVisible } = useDockStore(
    useShallow((state) => ({
      isFigaroBriefingVisible: state.isFigaroBriefingVisible,
      setFigaroBriefingVisible: state.setFigaroBriefingVisible,
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
    if (isFigaroBriefingVisible && isAuthenticated) {
      sync();
    }
  }, [isFigaroBriefingVisible, isAuthenticated, sync]);

  const renderContent = () => {
    if (!isAuthenticated) {
      return <ConnectFigaroPrompt />;
    }

    if (!isPremium) {
      return <UpgradePrompt />;
    }

    return <BriefingContent />;
  };

  return (
    <Sheet open={isFigaroBriefingVisible} onOpenChange={setFigaroBriefingVisible}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md bg-zinc-900/95 backdrop-blur-xl border-l border-white/10"
      >
        <SheetHeader className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-lg">🎭</span>
            </div>
            <div>
              <SheetTitle className="text-white">Figaro</SheetTitle>
              <SheetDescription className="text-white/60">
                Your daily briefing & assistant
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
