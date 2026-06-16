import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../services/orderService";
import { useLocation } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const location = useLocation();

  const showSuccess =
    new URLSearchParams(location.search).get("success");

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    try {
      await updateOrderStatus(
        orderId,
        newStatus
      );

      await loadOrders();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update status."
      );
    }
  };

  const handlePaymentStatusChange = async (
    orderId,
    paymentStatus
  ) => {
    try {
      await updatePaymentStatus(
        orderId,
        paymentStatus
      );

      await loadOrders();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update payment status."
      );
    }
  };
  const [showSuccessMessage, setShowSuccessMessage] =
    useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (showSuccess) {
      setShowSuccessMessage(true);

      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Orders
        </h1>

        <Link
          to="/add-order"
          className="w-full md:w-auto text-center bg-blue-900 text-white px-4 py-3 rounded-lg hover:bg-blue-800"
        >
          Add Order
        </Link>
    </div>

      {
    showSuccessMessage && (
      <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg mb-4">
        ✅ Order saved successfully.
      </div>
    )
  }
  <div className="bg-white shadow rounded-xl p-6">
    <h2 className="text-2xl font-bold mb-4">
      Active Orders
    </h2>

    {/* MOBILE VIEW */}
    <div className="hidden md:block overflow-x-auto">
      {orders
        .filter(
          (o) =>
            o.status !== "Claimed" &&
            o.status !== "Ready for Pickup"
        )
        .map((order) => (
          <div
            key={order.id}
            className="bg-white border rounded-xl p-4 shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">
                {order.customer_name}
              </h3>

              <span className="text-red-600 font-semibold">
                ₱
                {Number(
                  order.balance || 0
                ).toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Service:</strong>{" "}
                {order.service_type}
              </p>

              <p>
                <strong>Due Date:</strong>{" "}
                {order.due_date || "-"}
              </p>

              <p>
                <strong>Priority:</strong>{" "}
                {order.priority}
              </p>

              <p>
                <strong>Notes:</strong>{" "}
                {order.notes || "-"}
              </p>
            </div>

            {order.image_url && (
              <img
                src={order.image_url}
                alt="Order"
                className="mt-3 w-full h-40 object-cover rounded-lg"
              />
            )}

            <div className="mt-4 grid gap-2">
              <select
                value={order.status}
                onChange={(e) =>
                  handleStatusChange(
                    order.id,
                    e.target.value
                  )
                }
                className="border rounded-lg p-2"
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Paid">
                  Paid
                </option>

                <option value="Ready for Pickup">
                  Ready for Pickup
                </option>

                <option value="Claimed">
                  Claimed
                </option>
              </select>

              <select
                value={
                  order.payment_status ||
                  "Partial"
                }
                onChange={(e) =>
                  handlePaymentStatusChange(
                    order.id,
                    e.target.value
                  )
                }
                className="border rounded-lg p-2"
              >
                <option value="Unpaid">
                  Unpaid
                </option>

                <option value="Partial">
                  Partial
                </option>

                <option value="Paid">
                  Paid
                </option>
              </select>
            </div>
          </div>
        ))}
    </div>

    {/* DESKTOP VIEW */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border-collapse">
        {/* KEEP YOUR CURRENT TABLE HERE */}
      </table>
    </div>
  </div>
    </div >
  );
}