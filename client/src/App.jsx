import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { HistoryPage } from './pages/HistoryPage';

import { RoutinesPage } from './pages/RoutinesPage';
import { RoutineDetailPage } from './pages/RoutineDetailPage';
import { RoutineCreateEditPage } from './pages/RoutineCreateEditPage';

import { MealsPage } from './pages/MealsPage';
import { MealDetailPage } from './pages/MealDetailPage';
import { MealCreateEditPage } from './pages/MealCreateEditPage';

import { DailyEntryFormPage } from './pages/DailyEntryFormPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected App Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/history" element={<HistoryPage />} />

                  {/* Routines */}
                  <Route path="/routines" element={<RoutinesPage />} />
                  <Route path="/routines/new" element={<RoutineCreateEditPage />} />
                  <Route path="/routines/:id" element={<RoutineDetailPage />} />
                  <Route path="/routines/:id/edit" element={<RoutineCreateEditPage />} />

                  {/* Meals */}
                  <Route path="/meals" element={<MealsPage />} />
                  <Route path="/meals/new" element={<MealCreateEditPage />} />
                  <Route path="/meals/:id" element={<MealDetailPage />} />
                  <Route path="/meals/:id/edit" element={<MealCreateEditPage />} />

                  {/* Daily Entries */}
                  <Route path="/entries/log" element={<DailyEntryFormPage />} />
                </Route>
              </Route>

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
