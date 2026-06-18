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

  const [showExportModal, setShowExportModal] =
    useState(false);

  const [exportOption, setExportOption] =
    useState("all");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] = useState("");

  const [expenses, setExpenses] =
    useState([]);

  const [showExpenseModal, setShowExpenseModal] =
    useState(false);

  const [expenseForm, setExpenseForm] =
    useState({
      description: "",
      amount: "",
      date: new Date()
        .toISOString()
        .split("T")[0],
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
  const filterDataByDateRange = (
    data,
    dateField
  ) => {
    if (!startDate || !endDate) return data;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return data.filter((item) => {
      const itemDate = new Date(
        item[dateField]
      );
      return (
        itemDate >= start && itemDate <= end
      );
    });
  };

  const handleExportBackup = async () => {
    try {
      if (
        exportOption === "period" &&
        (!startDate || !endDate)
      ) {
        alert(
          "Please select a date range."
        );
        return;
      }

      let orders =
        await getDashboardStats();

      let payments =
        await getPayments();

      let ukaySales =
        await getUkaySales();

      if (exportOption === "period") {
        orders = filterDataByDateRange(
          orders,
          "date_received"
        );

        payments =
          filterDataByDateRange(
            payments,
            "payment_date"
          );

        ukaySales = filterDataByDateRange(
          ukaySales,
          "sale_date"
        );
      }

      exportToExcel(
        orders,
        payments,
        ukaySales
      );

      setShowExportModal(false);

      setExportOption("all");

      setStartDate("");

      setEndDate("");
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

  const handleAddExpense = () => {
    if (!expenseForm.description ||
        !expenseForm.amount) {
      alert("Please fill all fields");
      return;
    }

    const newExpense = {
      id: Date.now(),
      description:
        expenseForm.description,
      amount: Number(
        expenseForm.amount
      ),
      date: expenseForm.date,
    };

    setExpenses([
      ...expenses,
      newExpense,
    ]);

    setExpenseForm({
      description: "",
      amount: "",
      date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(
      expenses.filter(
        (exp) => exp.id !== id
      )
    );
  };

  const calculateTotalExpenses =
    () => {
      return expenses.reduce(
        (sum, exp) =>
          sum + exp.amount,
        0
      );
    };

  const totalExpenses =
    calculateTotalExpenses();

  const netIncome = {
    daily: totalDaily - totalExpenses,
    weekly: totalWeekly - totalExpenses,
    monthly:
      totalMonthly - totalExpenses,
    yearly: totalYearly - totalExpenses,
  };

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

    {
      title: "Total Expenses",
      value:
        "₱" +
        totalExpenses.toLocaleString(),
      color: "bg-red-50 border-red-200",
    },

    {
      title: "Net Income Today",
      value:
        "₱" +
        netIncome.daily.toLocaleString(),
      color:
        netIncome.daily >= 0
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200",
    },
    {
      title: "Net Income Week",
      value:
        "₱" +
        netIncome.weekly.toLocaleString(),
      color:
        netIncome.weekly >= 0
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200",
    },
    {
      title: "Net Income Month",
      value:
        "₱" +
        netIncome.monthly.toLocaleString(),
      color:
        netIncome.monthly >= 0
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200",
    },
    {
      title: "Net Income Year",
      value:
        "₱" +
        netIncome.yearly.toLocaleString(),
      color:
        netIncome.yearly >= 0
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200",
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Business Overview
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() =>
              setShowExpenseModal(
                true
              )
            }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm md:text-base"
          >
            + Add Expense
          </button>
          <button
            onClick={() =>
              setShowExportModal(true)
            }
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm md:text-base"
          >
            📥 Export Backup
          </button>
        </div>
      </div>

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  Export Backup
                </h2>
                <p className="text-sm text-gray-500">
                  Download your business data
                </p>
              </div>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportOption("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Select Export Option
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                    style={{borderColor: exportOption === "all" ? "#16a34a" : undefined, backgroundColor: exportOption === "all" ? "#f0fdf4" : undefined}}>
                    <input
                      type="radio"
                      name="exportType"
                      value="all"
                      checked={exportOption === "all"}
                      onChange={(e) => {
                        setExportOption(
                          e.target.value
                        );
                      }}
                      className="mr-3 w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Download All Data</p>
                      <p className="text-xs text-gray-600">Export entire database</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                    style={{borderColor: exportOption === "period" ? "#16a34a" : undefined, backgroundColor: exportOption === "period" ? "#f0fdf4" : undefined}}>
                    <input
                      type="radio"
                      name="exportType"
                      value="period"
                      checked={
                        exportOption ===
                        "period"
                      }
                      onChange={(e) => {
                        setExportOption(
                          e.target.value
                        );
                      }}
                      className="mr-3 w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Specific Period</p>
                      <p className="text-xs text-gray-600">Filter by date range</p>
                    </div>
                  </label>
                </div>
              </div>

              {exportOption === "period" && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) =>
                        setStartDate(
                          e.target.value
                        )
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) =>
                        setEndDate(
                          e.target.value
                        )
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleExportBackup}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Export Now
              </button>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportOption("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* EXPENSES & NET INCOME */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-bold">
            Expenses & Net Income
          </h2>
          {expenses.length > 0 && (
            <p className="text-sm text-gray-600">
              Total Expenses: <span className="font-bold text-red-600">₱{totalExpenses.toLocaleString()}</span>
            </p>
          )}
        </div>

        {/* EXPENSES LIST */}
        {expenses.length > 0 && (
          <div className="bg-white rounded-xl shadow mb-6 p-4 md:p-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-gray-600">
                      Description
                    </th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-gray-600">
                      Amount
                    </th>
                    <th className="text-center py-2 px-2 text-sm font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 text-sm">
                        {new Date(
                          expense.date
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2 text-sm">
                        {expense.description}
                      </td>
                      <td className="text-right py-2 px-2 text-sm font-semibold text-red-600">
                        ₱
                        {Number(
                          expense.amount
                        ).toLocaleString()}
                      </td>
                      <td className="text-center py-2 px-2">
                        <button
                          onClick={() =>
                            handleDeleteExpense(
                              expense.id
                            )
                          }
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NET INCOME SECTION */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.slice(16).map((card) => (
            <div
              key={card.title}
              className={`border rounded-xl shadow p-4 md:p-5 ${card.color || "bg-white"}`}
            >
              <h3 className="text-gray-700 text-xs md:text-sm font-medium">
                {card.title}
              </h3>

              <p className={`text-lg md:text-2xl font-bold mt-2 ${
                card.color?.includes('green')
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  Add Expense
                </h2>
                <p className="text-sm text-gray-500">
                  Record a business expense
                </p>
              </div>
              <button
                onClick={() =>
                  setShowExpenseModal(false)
                }
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g., Fabric, Thread, Rent"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-lg font-semibold text-gray-600">₱</span>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="w-full border-2 border-gray-300 rounded-lg pl-8 pr-4 py-3 text-base font-semibold focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      date: e.target.value,
                    })
                  }
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mt-6 border border-red-200">
              <p className="text-sm text-red-700 font-semibold mb-1">
                Amount to deduct
              </p>
              <p className="text-2xl font-bold text-red-600">
                ₱{Number(expenseForm.amount || 0).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAddExpense}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Record Expense
              </button>
              <button
                onClick={() =>
                  setShowExpenseModal(false)
                }
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
