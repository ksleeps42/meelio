import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@repo/ui/components/ui/sheet";
import { Button } from "@repo/ui/components/ui/button";
import { Users, Cake, Gift, Phone, Mail, Lock, Sparkles } from "lucide-react";
import { useDockStore } from "../../../stores/dock.store";
import { useFigaroStore, type FigaroUpcomingBirthday, type FigaroPerson } from "../../../stores/figaro.store";
import { useShallow } from "zustand/shallow";

// Birthday card component
function BirthdayCard({ birthday }: { birthday: FigaroUpcomingBirthday }) {
  const daysText = birthday.daysUntil === 0
    ? "Today!"
    : birthday.daysUntil === 1
    ? "Tomorrow"
    : `in ${birthday.daysUntil} days`;

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
          <Cake className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{birthday.name}</p>
          {birthday.relationship && (
            <p className="text-xs text-white/50">{birthday.relationship}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${birthday.daysUntil === 0 ? 'text-pink-400' : 'text-white/80'}`}>
          {daysText}
        </p>
        <p className="text-xs text-white/40">
          {new Date(birthday.birthday).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

// Person card component
function PersonCard({ person }: { person: FigaroPerson }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
        <span className="text-lg">{person.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{person.name}</p>
        {person.relationship && (
          <p className="text-xs text-white/50">{person.relationship}</p>
        )}
      </div>
      <div className="flex gap-1">
        {person.contact?.phone && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
            onClick={() => window.open(`tel:${person.contact?.phone}`)}
          >
            <Phone className="w-4 h-4" />
          </Button>
        )}
        {person.contact?.email && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
            onClick={() => window.open(`mailto:${person.contact?.email}`)}
          >
            <Mail className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Gift ideas component
function GiftIdeasSection({ birthdays }: { birthdays: FigaroUpcomingBirthday[] }) {
  const upcomingWithGifts = birthdays.filter(
    (b) => b.daysUntil <= 14 && b.giftIdeas && b.giftIdeas.length > 0
  );

  if (upcomingWithGifts.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
        <Gift className="w-4 h-4 text-purple-400" />
        Gift Ideas
      </h3>
      <div className="space-y-3">
        {upcomingWithGifts.map((birthday) => (
          <div key={birthday.id}>
            <p className="text-sm text-white/70 mb-1">{birthday.name}:</p>
            <div className="flex flex-wrap gap-1">
              {birthday.giftIdeas?.slice(0, 3).map((idea, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full"
                >
                  {idea}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Connect prompt for unauthenticated users
function ConnectFigaroPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Remember Your People</h3>
      <p className="text-sm text-white/60 mb-6 max-w-[250px]">
        Connect your Figaro account to track birthdays, contacts, and gift ideas.
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
      <h3 className="text-lg font-medium text-white mb-2">Unlock People Tracking</h3>
      <p className="text-sm text-white/60 mb-6 max-w-[250px]">
        Never miss a birthday. Track contacts and gift ideas via text.
      </p>
      <Button
        className="bg-pink-500/80 hover:bg-pink-500 text-white"
        onClick={() => window.open("https://textfigaro.com/pricing", "_blank")}
      >
        Upgrade to Pro — $9/mo
      </Button>
    </div>
  );
}

// Main people content
function PeopleContent() {
  const { people, fetchPeople } = useFigaroStore(
    useShallow((state) => ({
      people: state.people,
      fetchPeople: state.fetchPeople,
    }))
  );

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  if (!people) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-white/40 text-sm">Loading people...</div>
      </div>
    );
  }

  const { totalPeople, upcomingBirthdays, recentContacts } = people;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-semibold text-white">{totalPeople}</p>
          <p className="text-xs text-white/50">people</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <Cake className="w-5 h-5 text-pink-400 mx-auto mb-1" />
          <p className="text-lg font-semibold text-white">{upcomingBirthdays.length}</p>
          <p className="text-xs text-white/50">upcoming birthdays</p>
        </div>
      </div>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
            <Cake className="w-4 h-4 text-pink-400" />
            Upcoming Birthdays
          </h3>
          <div>
            {upcomingBirthdays.slice(0, 5).map((birthday) => (
              <BirthdayCard key={birthday.id} birthday={birthday} />
            ))}
          </div>
        </div>
      )}

      {/* Gift Ideas */}
      <GiftIdeasSection birthdays={upcomingBirthdays} />

      {/* Recent Contacts */}
      {recentContacts && recentContacts.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-white/80 mb-3">Recent Contacts</h3>
          <div className="space-y-2">
            {recentContacts.slice(0, 5).map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalPeople === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/60 mb-2">No people added yet</p>
          <p className="text-xs text-white/40">
            Text Figaro: "Remember that John's birthday is March 15th"
          </p>
        </div>
      )}

      {/* Quick Tip */}
      <div className="text-center text-xs text-white/40 py-2">
        Text Figaro: "When is Sarah's birthday?"
      </div>
    </div>
  );
}

export function FigaroPeopleSheet() {
  const { isPeopleVisible, setPeopleVisible } = useDockStore(
    useShallow((state) => ({
      isPeopleVisible: state.isFigaroPeopleVisible,
      setPeopleVisible: state.setFigaroPeopleVisible,
    }))
  );

  const { isAuthenticated, isPremium } = useFigaroStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isPremium: state.isPremium,
    }))
  );

  return (
    <Sheet open={isPeopleVisible} onOpenChange={setPeopleVisible}>
      <SheetContent
        side="right"
        className="w-[380px] border-l border-white/10 bg-zinc-900/95 backdrop-blur-xl p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-pink-400" />
            People
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-100px)]">
          {!isAuthenticated ? (
            <ConnectFigaroPrompt />
          ) : !isPremium ? (
            <UpgradePrompt />
          ) : (
            <PeopleContent />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default FigaroPeopleSheet;
