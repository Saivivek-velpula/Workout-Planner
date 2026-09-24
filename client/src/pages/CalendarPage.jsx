import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Dumbbell,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { entriesApi } from '../api/entriesApi';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/BadgesAndEmpty';
import { useToast } from '../context/ToastContext';

export const CalendarPage = () => {
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [entriesMap, setEntriesMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Compute month boundary strings
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const fromStr = new Date(year, month, 1).toISOString().slice(0, 10);
  const toStr = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  useEffect(() => {
    const fetchMonthEntries = async () => {
      setIsLoading(true);
      try {
        const res = await entriesApi.getAll({
          from: fromStr,
          to: toStr
        });
        if (res.data?.success) {
          const map = {};
          res.data.data.forEach((entry) => {
            map[entry.date] = entry;
          });
          setEntriesMap(map);
        }
      } catch (err) {
        toastError('Failed to load month calendar data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthEntries();
  }, [fromStr, toStr]);

  // Calendar Grid math
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday

  // Days from previous month to fill the first row
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = [];
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(prevMonthLastDay - i);
  }

  // Days in current month
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Remaining cells to make grid full 35 or 42 cells
  const totalCellsSoFar = prevMonthDays.length + currentMonthDays.length;
  const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => i + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleDayClick = (dayNum) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    navigate(`/entries/log?date=${formattedDate}`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Calendar View
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tap on any date to view or log workouts and meals
          </p>
        </div>

        {/* Month controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="px-4 text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>

            <button
              onClick={nextMonth}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <Button variant="outline" size="md" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
            <span>Workout Done</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
            <span>Meals Logged</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-brand-500 shrink-0" />
            <span>Today's Date</span>
          </div>
        </div>

        <span className="text-slate-400">
          Showing {Object.keys(entriesMap).length} logged days this month
        </span>
      </div>

      {/* Month Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Cells */}
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Previous Month Inactive Days */}
            {prevMonthDays.map((d) => (
              <div
                key={`prev-${d}`}
                className="min-h-[90px] sm:min-h-[110px] p-2 bg-slate-50/50 dark:bg-slate-950/30 text-slate-300 dark:text-slate-700 select-none"
              >
                <span className="text-xs font-semibold">{d}</span>
              </div>
            ))}

            {/* Current Month Active Days */}
            {currentMonthDays.map((dayNum) => {
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const entry = entriesMap[dateString];
              const isToday = dateString === todayStr;

              const hasWorkouts = entry?.routines && entry.routines.length > 0;
              const hasMeals = entry?.meals && entry.meals.length > 0;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => handleDayClick(dayNum)}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 transition-all cursor-pointer flex flex-col justify-between group hover:bg-brand-50/40 dark:hover:bg-brand-950/20 ${
                    isToday ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Day number header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-lg w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Indicator dots */}
                    <div className="flex items-center gap-1">
                      {hasWorkouts && (
                        <span
                          title={`${entry.routines.length} workout(s) logged`}
                          className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm"
                        />
                      )}
                      {hasMeals && (
                        <span
                          title={`${entry.totals?.calories || 0} kcal logged`}
                          className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shadow-sm"
                        />
                      )}
                    </div>
                  </div>

                  {/* Day Content Summary */}
                  <div className="space-y-1 mt-1 text-[11px]">
                    {hasWorkouts && (
                      <div className="hidden sm:flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-semibold truncate bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md">
                        <Dumbbell className="w-3 h-3 shrink-0" />
                        <span className="truncate">{entry.routines[0].routineName}</span>
                      </div>
                    )}
                    {hasMeals && (
                      <div className="hidden sm:flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold truncate bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                        <Flame className="w-3 h-3 shrink-0 fill-amber-500" />
                        <span>{entry.totals?.calories || 0} kcal</span>
                      </div>
                    )}
                  </div>

                  {/* Plus hover trigger for empty days */}
                  {!entry && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity self-end text-slate-400 hover:text-brand-600">
                      <Plus className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Next Month Inactive Days */}
            {nextMonthDays.map((d) => (
              <div
                key={`next-${d}`}
                className="min-h-[90px] sm:min-h-[110px] p-2 bg-slate-50/50 dark:bg-slate-950/30 text-slate-300 dark:text-slate-700 select-none"
              >
                <span className="text-xs font-semibold">{d}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
