import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Flame,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Droplet,
  Scale,
  Smile,
  UtensilsCrossed
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { statsApi } from '../api/statsApi';
import { entriesApi } from '../api/entriesApi';
import { Spinner, Badge } from '../components/ui/BadgesAndEmpty';
import { Button } from '../components/ui/Button';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, todayRes] = await Promise.all([
          statsApi.getWeeklyStats(),
          entriesApi.getByDate(todayStr)
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
        }
        if (todayRes.data?.success) {
          setTodayEntry(todayRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [todayStr]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const moodEmojis = ['', '😴 Tired', '😐 Neutral', '🙂 Good', '😄 Energetic', '🔥 Unstoppable'];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Athlete'}!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your weekly fitness and nutrition overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={CalendarIcon}
            onClick={() => navigate('/calendar')}
          >
            Calendar
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate(`/entries/log?date=${todayStr}`)}
          >
            {todayEntry ? 'Edit Today\'s Entry' : 'Log Today\'s Entry'}
          </Button>
        </div>
      </div>

      {/* Top 4 Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Workouts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Workouts Done
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.totalWorkoutsCompleted || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">sessions</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {stats?.totalWorkoutMinutes || 0} mins total
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Average Calories */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Daily Calories
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.averageCalories || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">kcal/day</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              P: {stats?.averages?.protein || 0}g · C: {stats?.averages?.carbs || 0}g · F: {stats?.averages?.fat || 0}g
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Consistency */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Weekly Consistency
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.daysLoggedCount || 0} / 7
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">days logged</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              {Math.round(((stats?.daysLoggedCount || 0) / 7) * 100)}% active rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Today Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Status
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-black ${todayEntry ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {todayEntry ? 'Logged' : 'Not Logged'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {todayEntry
                ? `${todayEntry.routines?.length || 0} routines · ${todayEntry.meals?.length || 0} meals`
                : 'Click button to log'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${todayEntry ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <CalendarIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 7-Day Activity Timeline Bar Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              7-Day Activity & Nutrition
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily workouts and calories over the past week
            </p>
          </div>
          <Link
            to="/calendar"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Full Calendar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {stats?.dayBreakdown?.map((day) => {
            const isToday = day.date === todayStr;
            const maxCal = 3000;
            const calHeightPercent = Math.min(100, Math.max(10, Math.round((day.calories / maxCal) * 100)));

            return (
              <div
                key={day.date}
                onClick={() => navigate(`/entries/log?date=${day.date}`)}
                className={`group cursor-pointer flex flex-col items-center p-3 rounded-2xl border transition-all ${
                  isToday
                    ? 'border-brand-500/80 bg-brand-50/30 dark:bg-brand-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                  {day.dayName}
                </span>
                <span className={`text-xs font-bold my-1 ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {day.date.slice(8)}
                </span>

                {/* Calorie Bar Visualizer */}
                <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-end p-1 my-2 overflow-hidden">
                  <div
                    style={{ height: `${day.calories > 0 ? calHeightPercent : 0}%` }}
                    className={`w-full rounded-md transition-all duration-300 ${
                      day.calories > 0
                        ? 'bg-gradient-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500'
                        : 'bg-transparent'
                    }`}
                    title={`${day.calories} kcal`}
                  />
                </div>

                <div className="text-center">
                  <span className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    {day.calories > 0 ? `${day.calories}` : '—'}
                  </span>
                  <span className="block text-[10px] text-slate-400">kcal</span>
                </div>

                {/* Workout indicator dot */}
                <div className="mt-2 flex items-center justify-center gap-1 min-h-[14px]">
                  {day.workoutsCompleted > 0 && (
                    <span
                      title={`${day.workoutsCompleted} workout completed`}
                      className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                  {day.calories > 0 && (
                    <span
                      title="Meals logged"
                      className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Logged Entry Card or CTA */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Today's Log ({todayStr})
              {todayEntry && (
                <Badge variant="brand" size="sm">
                  Active
                </Badge>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Workouts, nutrition, water intake and notes recorded for today
            </p>
          </div>
          <Button
            size="sm"
            variant={todayEntry ? 'outline' : 'primary'}
            onClick={() => navigate(`/entries/log?date=${todayStr}`)}
          >
            {todayEntry ? 'Edit Entry' : 'Log Today'}
          </Button>
        </div>

        {todayEntry ? (
          <div className="pt-5 space-y-6">
            {/* Quick Metrics Bar: Body weight, water, mood */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Water</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {todayEntry.waterIntake ? `${todayEntry.waterIntake} L` : 'Not recorded'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Body Weight</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {todayEntry.bodyWeight ? `${todayEntry.bodyWeight} kg` : 'Not recorded'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Mood / Energy</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {todayEntry.moodEnergy ? moodEmojis[todayEntry.moodEnergy] : 'Not recorded'}
                  </p>
                </div>
              </div>
            </div>

            {/* Routines Done */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Dumbbell className="w-3.5 h-3.5" />
                Workouts ({todayEntry.routines?.length || 0})
              </h4>
              {todayEntry.routines && todayEntry.routines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {todayEntry.routines.map((r, idx) => (
                    <div
                      key={r.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{r.routineName}</p>
                          <p className="text-xs text-slate-400">
                            {r.durationMinutes ? `${r.durationMinutes} mins` : 'Completed'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="strength" size="sm">Done</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No workouts logged for today.</p>
              )}
            </div>

            {/* Meals Logged & Totals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  Meals Logged ({todayEntry.meals?.length || 0})
                </h4>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Total: <span className="font-bold text-amber-600 dark:text-amber-400">{todayEntry.totals?.calories || 0} kcal</span>
                  <span className="text-slate-400 font-normal ml-1">
                    (P: {todayEntry.totals?.protein || 0}g · C: {todayEntry.totals?.carbs || 0}g · F: {todayEntry.totals?.fat || 0}g)
                  </span>
                </div>
              </div>

              {todayEntry.meals && todayEntry.meals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {todayEntry.meals.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge variant={m.mealType} size="sm">{m.mealType}</Badge>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {m.calories} kcal
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{m.mealName}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        P: {m.protein}g · C: {m.carbs}g · F: {m.fat}g
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No meals logged for today.</p>
              )}
            </div>

            {/* Notes if any */}
            {todayEntry.notes && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-0.5">Notes:</span>
                {todayEntry.notes}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No entry recorded for today yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
              Keep your streak alive! Log the workouts you did and meals you ate today.
            </p>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => navigate(`/entries/log?date=${todayStr}`)}
            >
              Log Today's Entry
            </Button>
          </div>
        )}
      </div>

      {/* Quick Links Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/routines/new"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm transition-all group flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Create New Routine
            </h4>
            <p className="text-xs text-slate-400">Add strength, HIIT or cardio workouts</p>
          </div>
        </Link>

        <Link
          to="/meals/new"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-sm transition-all group flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Create New Meal
            </h4>
            <p className="text-xs text-slate-400">Save meals and track calorie macros</p>
          </div>
        </Link>

        <Link
          to="/history"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm transition-all group flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              View History Log
            </h4>
            <p className="text-xs text-slate-400">Explore past dates and performance</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
