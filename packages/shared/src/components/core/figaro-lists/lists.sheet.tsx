import { useEffect, useState } from "react";
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
  ChevronRight,
  ClipboardList,
  Check,
} from "lucide-react";

import { useDockStore } from "../../../stores/dock.store";
import { useFigaroStore, type FigaroListSummary } from "../../../stores/figaro.store";

function ConnectFigaroPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Connect Your Figaro Account</h3>
      <p className="text-sm text-white/60 mb-6 max-w-xs">
        Access your lists from anywhere. Text Figaro to add items, view them here.
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
      <h3 className="text-lg font-medium text-white mb-2">Unlock Figaro Lists</h3>
      <p className="text-sm text-white/60 mb-6 max-w-xs">
        Sync your lists across all devices. Text Figaro to add items instantly.
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

interface ListCardProps {
  list: FigaroListSummary;
  isExpanded: boolean;
  onToggle: () => void;
}

function ListCard({ list, isExpanded, onToggle }: ListCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-white capitalize">{list.name}</h3>
            <p className="text-xs text-white/40">{list.count} items</p>
          </div>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>

      {isExpanded && list.items.length > 0 && (
        <div className="border-t border-white/10 p-3 space-y-1">
          {list.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center group-hover:border-white/40">
                <Check className="w-3 h-3 text-transparent group-hover:text-white/20" />
              </div>
              <span className="text-sm text-white/80">{item}</span>
            </div>
          ))}
          {list.count > list.items.length && (
            <p className="text-xs text-white/40 text-center pt-2">
              +{list.count - list.items.length} more items
            </p>
          )}
        </div>
      )}

      {isExpanded && list.items.length === 0 && (
        <div className="border-t border-white/10 p-4">
          <p className="text-sm text-white/40 text-center">No items in this list</p>
        </div>
      )}
    </div>
  );
}

function ListsContent() {
  const { lists, isSyncing, sync, syncError } = useFigaroStore(
    useShallow((state) => ({
      lists: state.lists,
      isSyncing: state.isSyncing,
      sync: state.sync,
      syncError: state.syncError,
    }))
  );

  const [expandedList, setExpandedList] = useState<string | null>(null);

  const handleRefresh = () => {
    sync();
  };

  const totalItems = lists.reduce((acc, list) => acc + list.count, 0);

  return (
    <div className="space-y-4 p-4">
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
            <p className="text-xl font-semibold text-white">{lists.length}</p>
            <p className="text-xs text-white/40">Lists</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-xl font-semibold text-white">{totalItems}</p>
            <p className="text-xs text-white/40">Items</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => window.open("https://textfigaro.com/app/lists", "_blank")}
        >
          Manage
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Lists */}
      {lists.length > 0 ? (
        <div className="space-y-3">
          {lists.map((list) => (
            <ListCard
              key={list.name}
              list={list}
              isExpanded={expandedList === list.name}
              onToggle={() =>
                setExpandedList(expandedList === list.name ? null : list.name)
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
          <ClipboardList className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Lists Yet</h3>
          <p className="text-sm text-white/60 mb-4">
            Text Figaro to create your first list
          </p>
          <p className="text-xs text-white/40 font-mono">
            "add milk to groceries"
          </p>
        </div>
      )}

      {/* Quick Add Tip */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h4 className="text-sm font-medium text-blue-400 mb-1">Quick Add</h4>
        <p className="text-xs text-white/60">
          Text Figaro: "add [item] to [list]" to add items from anywhere
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
        {isSyncing ? "Syncing..." : "Refresh Lists"}
      </Button>
    </div>
  );
}

export function FigaroListsSheet() {
  const { isFigaroListsVisible, setFigaroListsVisible } = useDockStore(
    useShallow((state) => ({
      isFigaroListsVisible: state.isFigaroListsVisible,
      setFigaroListsVisible: state.setFigaroListsVisible,
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
    if (isFigaroListsVisible && isAuthenticated) {
      sync();
    }
  }, [isFigaroListsVisible, isAuthenticated, sync]);

  const renderContent = () => {
    if (!isAuthenticated) {
      return <ConnectFigaroPrompt />;
    }

    if (!isPremium) {
      return <UpgradePrompt />;
    }

    return <ListsContent />;
  };

  return (
    <Sheet open={isFigaroListsVisible} onOpenChange={setFigaroListsVisible}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md bg-zinc-900/95 backdrop-blur-xl border-l border-white/10"
      >
        <SheetHeader className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-white">Figaro Lists</SheetTitle>
              <SheetDescription className="text-white/60">
                Your synced lists from Figaro
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
