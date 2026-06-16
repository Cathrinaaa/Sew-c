import { useEffect, useState } from "react";
import {
  getOrders,
  recordPayment,
} from "../services/orderService";

export default function BalancePayments() {
  const [orders, setOrders] = useState([]);
  const [paymentAmount, setPaymentAmount] =
    useState({});
  const [paymentDate, setPaymentDate] =
    useState({});

  const loadOrders = async () => {
    try {
      const data = await getOrders();

      setOrders(
        data.filter(
          (order) => Number(order.balance) > 0
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handlePayment = async (order) => {
    try {
      const amount = Number(
        paymentAmount[order.id]
      );

      const date =
        paymentDate[order.id] ||
        new Date()
          .toISOString()
          .split("T")[0];

      if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      if (amount > Number(order.balance)) {
        alert(
          "Payment cannot exceed the remaining balance."
        );
        return;
      }

      await recordPayment(
        order.id,
        amount,
        date
      );

      alert(
        "Payment recorded successfully."
      );

      setPaymentAmount((prev) => ({
        ...prev,
        [order.id]: "",
      }));

      setPaymentDate((prev) => ({
        ...prev,
        [order.id]: "",
      }));

      await loadOrders();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to record payment."
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-6">
          Balance Payments
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">
                  Customer
                </th>

                <th className="border p-2 text-left">
                  Service
                </th>

                <th className="border p-2 text-left">
                  Total Amount
                </th>

                <th className="border p-2 text-left">
                  Balance
                </th>

                <th className="border p-2 text-left">
                  Payment Status
                </th>

                <th className="border p-2 text-left">
                  Payment Amount
                </th>

                <th className="border p-2 text-left">
                  Payment Date
                </th>

                <th className="border p-2 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="border p-4 text-center"
                  >
                    No customers with balance.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="border p-2">
                      {order.customer_name}
                    </td>

                    <td className="border p-2">
                      {order.service_type}
                    </td>

                    <td className="border p-2">
                      ₱
                      {Number(
                        order.total_amount || 0
                      ).toLocaleString()}
                    </td>

                    <td className="border p-2 font-semibold text-red-600">
                      ₱
                      {Number(
                        order.balance || 0
                      ).toLocaleString()}
                    </td>

                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          order.payment_status ===
                          "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.payment_status ||
                          "Partial"}
                      </span>
                    </td>

                    <td className="border p-2">
                      <input
                        type="number"
                        min="0"
                        max={order.balance}
                        value={
                          paymentAmount[
                            order.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setPaymentAmount(
                            (prev) => ({
                              ...prev,
                              [order.id]:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Amount"
                        className="border rounded px-2 py-1 w-28"
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        type="date"
                        value={
                          paymentDate[
                            order.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setPaymentDate(
                            (prev) => ({
                              ...prev,
                              [order.id]:
                                e.target.value,
                            })
                          )
                        }
                        className="border rounded px-2 py-1"
                      />
                    </td>

                    <td className="border p-2">
                      <button
                        onClick={() =>
                          handlePayment(order)
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}