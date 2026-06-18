import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Orders", path: "/orders" },
    { name: "Ukay Income", path: "/ukay-income" },
    { name: "Ready To Pickup", path: "/ready-to-pickup" },
    { name: "Schedule", path: "/schedule" },
    { name: "Balance Payments", path: "/balance-payments" },
    { name: "History", path: "/history" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl font-bold text-gray-700"
          >
            ☰
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/sew-c-logo.png"
              alt="Sew-C Logo"
              className="h-8 w-8"
            />
            <h1 className="text-lg font-bold text-blue-900">
              Sew-C
            </h1>
          </div>

          <div className="w-6" />
        </div>
      </header>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-blue-900 text-white
          transform transition-transform duration-300
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
          md:hidden
        `}
      >
        <div className="flex justify-between items-center p-5 border-b border-blue-800">
          <h1 className="text-2xl font-bold">
            Sew-C
          </h1>

          <button
            onClick={() => setOpen(false)}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className="
                block
                px-4
                py-3
                rounded-lg
                hover:bg-blue-800
                transition
              "
            >
              {item.name}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="
              w-full
              text-left
              px-4
              py-3
              rounded-lg
              bg-red-600
              hover:bg-red-700
              transition
              mt-6
            "
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:flex-col fixed left-0 top-0 w-64 h-screen bg-blue-900 text-white shadow-lg z-40">
        <div className="p-6 border-b border-blue-800 flex items-center gap-3">
          <img
            src="/sew-c-logo.png"
            alt="Sew-C Logo"
            className="h-10 w-10 rounded"
          />
          <h1 className="text-2xl font-bold">
            Sew-C
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="
                block
                px-4
                py-3
                rounded-lg
                hover:bg-blue-800
                transition
              "
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="
              w-full
              px-4
              py-3
              rounded-lg
              bg-red-600
              hover:bg-red-700
              transition
            "
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
