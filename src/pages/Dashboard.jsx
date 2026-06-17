import { useEffect, useState } from "react";
import { exportToExcel } from "../utils/exportExcel";
import { getUkaySales } from "../services/ukayService";
import {
  getDashboardStats,
  getPayments,
} from "../services/orderService";


export default function Dashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    ready: 0,
    claimed: 0,

    tailoringDaily: 0,
    tailoringWeekly: 0,
    tailoringMonthly: 0,
    tailoringYearly: 0,

    ukayDaily: 0,
    ukayWeekly: 0,
    ukayMonthly: 0,
    ukayYearly: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const orders =
        await getDashboardStats();

      const payments =
        await getPayments();

      const ukaySales =
        await getUkaySales();

      const today = new Date();

      const currentYear =
        today.getFullYear();

      const currentMonth =
        today.getMonth();

      const startOfWeek =
        new Date(today);

      startOfWeek.setDate(
        today.getDate() -
        today.getDay()
      );

      // ==================
      // ORDER COUNTS
      // ==================

      const pending = orders.filter(
        (o) => o.status === "Pending"
      ).length;

      const inProgress =
        orders.filter(
          (o) =>
            o.status ===
            "In Progress"
        ).length;

      const ready = orders.filter(
        (o) =>
          o.status ===
          "Ready for Pickup"
      ).length;

      const claimed =
        orders.filter(
          (o) =>
            o.status === "Claimed"
        ).length;

      // ==================
      // TAILORING INCOME
      // ==================

      let tailoringDaily = 0;
      let tailoringWeekly = 0;
      let tailoringMonthly = 0;
      let tailoringYearly = 0;

      payments.forEach((payment) => {
        const amount = Number(
          payment.amount || 0
        );

        const paymentDate =
          new Date(
            payment.payment_date
          );

        if (
          paymentDate.toDateString() ===
          today.toDateString()
        ) {
          tailoringDaily += amount;
        }

        if (
          paymentDate >= startOfWeek
        ) {
          tailoringWeekly += amount;
        }

        if (
          paymentDate.getMonth() ===
          currentMonth &&
          paymentDate.getFullYear() ===
          currentYear
        ) {
          tailoringMonthly +=
            amount;
        }

        if (
          paymentDate.getFullYear() ===
          currentYear
        ) {
          tailoringYearly +=
            amount;
        }
      });

      // ==================
      // UKAY INCOME
      // ==================

      let ukayDaily = 0;
      let ukayWeekly = 0;
      let ukayMonthly = 0;
      let ukayYearly = 0;

      ukaySales.forEach((sale) => {
        const amount = Number(
          sale.amount || 0
        );

        const saleDate =
          new Date(
            sale.sale_date
          );

        if (
          saleDate.toDateString() ===
          today.toDateString()
        ) {
          ukayDaily += amount;
        }

        if (
          saleDate >= startOfWeek
        ) {
          ukayWeekly += amount;
        }

        if (
          saleDate.getMonth() ===
          currentMonth &&
          saleDate.getFullYear() ===
          currentYear
        ) {
          ukayMonthly += amount;
        }

        if (
          saleDate.getFullYear() ===
          currentYear
        ) {
          ukayYearly += amount;
        }
      });

      setStats({
        pending,
        inProgress,
        ready,
        claimed,

        tailoringDaily,
        tailoringWeekly,
        tailoringMonthly,
        tailoringYearly,

        ukayDaily,
        ukayWeekly,
        ukayMonthly,
        ukayYearly,
      });
    } catch (error) {
      console.error(error);
    }
  };
  const handleExportBackup = async () => {
    try {
      const orders =
        await getDashboardStats();

      const payments =
        await getPayments();

      const ukaySales =
        await getUkaySales();

      exportToExcel(
        orders,
        payments,
        ukaySales
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to export backup."
      );
    }
  };

  const totalDaily =
    stats.tailoringDaily +
    stats.ukayDaily;

  const totalWeekly =
    stats.tailoringWeekly +
    stats.ukayWeekly;

  const totalMonthly =
    stats.tailoringMonthly +
    stats.ukayMonthly;

  const totalYearly =
    stats.tailoringYearly +
    stats.ukayYearly;

  const cards = [
    {
      title: "Pending Orders",
      value: stats.pending,
    },
    {
      title: "In Progress",
      value: stats.inProgress,
    },
    {
      title: "Ready For Pickup",
      value: stats.ready,
    },
    {
      title: "Claimed Orders",
      value: stats.claimed,
    },

    {
      title: "Tailoring Today",
      value:
        "₱" +
        stats.tailoringDaily.toLocaleString(),
    },
    {
      title: "Tailoring Week",
      value:
        "₱" +
        stats.tailoringWeekly.toLocaleString(),
    },
    {
      title: "Tailoring Month",
      value:
        "₱" +
        stats.tailoringMonthly.toLocaleString(),
    },
    {
      title: "Tailoring Year",
      value:
        "₱" +
        stats.tailoringYearly.toLocaleString(),
    },

    {
      title: "Ukay Today",
      value:
        "₱" +
        stats.ukayDaily.toLocaleString(),
    },
    {
      title: "Ukay Week",
      value:
        "₱" +
        stats.ukayWeekly.toLocaleString(),
    },
    {
      title: "Ukay Month",
      value:
        "₱" +
        stats.ukayMonthly.toLocaleString(),
    },
    {
      title: "Ukay Year",
      value:
        "₱" +
        stats.ukayYearly.toLocaleString(),
    },

    {
      title: "Total Today",
      value:
        "₱" +
        totalDaily.toLocaleString(),
    },
    {
      title: "Total Week",
      value:
        "₱" +
        totalWeekly.toLocaleString(),
    },
    {
      title: "Total Month",
      value:
        "₱" +
        totalMonthly.toLocaleString(),
    },
    {
      title: "Total Year",
      value:
        "₱" +
        totalYearly.toLocaleString(),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Business Overview
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="
      bg-green-600
      hover:bg-green-700
      text-white
      px-4
      py-2
      rounded-lg
      font-medium
    "
        >
          📥 Export Backup
        </button>
      </div>

      {/* ORDER STATUS */}
      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4">
          Orders Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.slice(0, 4).map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow p-4 md:p-5"
            >
              <h3 className="text-gray-500 text-xs md:text-sm">
                {card.title}
              </h3>

              <p className="text-xl md:text-3xl font-bold mt-2">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* TAILORING */}
      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4">
          Tailoring Income
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.slice(4, 8).map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow p-4 md:p-5"
            >
              <h3 className="text-gray-500 text-xs md:text-sm">
                {card.title}
              </h3>

              <p className="text-lg md:text-2xl font-bold mt-2">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* UKAY */}
      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4">
          Ukay Income
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.slice(8, 12).map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow p-4 md:p-5"
            >
              <h3 className="text-gray-500 text-xs md:text-sm">
                {card.title}
              </h3>

              <p className="text-lg md:text-2xl font-bold mt-2">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* TOTAL BUSINESS */}
      <div>
        <h2 className="text-lg md:text-xl font-bold mb-4">
          Total Business Income
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.slice(12, 16).map((card) => (
            <div
              key={card.title}
              className="bg-green-50 border border-green-200 rounded-xl shadow p-4 md:p-5"
            >
              <h3 className="text-green-700 text-xs md:text-sm">
                {card.title}
              </h3>

              <p className="text-lg md:text-2xl font-bold mt-2 text-green-800">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}