import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { supabase } from "./lib/supabase";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import AddOrder from "./pages/AddOrder";
import History from "./pages/History";
import ReadyToPickup from "./pages/ReadyToPickup";
import Schedule from "./pages/Schedule";
import BalancePayments from "./pages/BalancePayments";
import UkayIncome from "./pages/UkayIncome";

function App() {
  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">
          Loading...
        </p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 md:flex">
        <Sidebar />

        <main className="w-full flex-1 p-4 md:p-6">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/orders"
              element={<Orders />}
            />

            <Route
              path="/add-order"
              element={<AddOrder />}
            />

            <Route
              path="/ready-to-pickup"
              element={<ReadyToPickup />}
            />

            <Route
              path="/schedule"
              element={<Schedule />}
            />

            <Route
              path="/balance-payments"
              element={<BalancePayments />}
            />

            <Route
              path="/ukay-income"
              element={<UkayIncome />}
            />

            <Route
              path="/history"
              element={<History />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;