import {
  TrophyIcon,
  GoalIcon,
  AlertTriangleIcon,
  CalendarIcon,
} from "lucide-react";
export function PlayerWelcomeBox() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-indigo-600 px-6 py-3">
        <h2 className="text-white text-sm font-medium uppercase tracking-wider">
          DIVISION 1
        </h2>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Player info */}
          <div className="flex items-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold mr-4">
              CR
            </div>
            <div>
              <h3 className="text-xl font-bold">Carlos Rodriguez</h3>
              <p className="text-gray-600">Thunder FC</p>
            </div>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <GoalIcon size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Goals</p>
                <p className="font-bold">10</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangleIcon size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Red Cards</p>
                <p className="font-bold">1</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <TrophyIcon size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="font-bold">2nd</p>
              </div>
            </div>
          </div>
        </div>
        {/* Next match info */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CalendarIcon size={16} />
            <span className="text-sm">Next match:</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1 md:flex-none">
              <span className="font-bold text-lg">Thunder FC</span>
            </div>
            <div className="px-4 py-2 mx-4 bg-gray-100 rounded-lg font-bold">
              VS
            </div>
            <div className="text-center flex-1 md:flex-none">
              <span className="font-bold text-lg">Mountain Lions</span>
            </div>
            <div className="hidden md:block flex-1 text-right text-gray-500">
              <span>Oct 29, 15:00 • East Field Stadium</span>
            </div>
          </div>
          <div className="md:hidden mt-2 text-center text-gray-500">
            <span>Oct 29, 15:00 • East Field Stadium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
