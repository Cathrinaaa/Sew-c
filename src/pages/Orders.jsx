import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderNotes,
  updateItemsCompleted,
} from "../services/orderService";
import { useLocation } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const [editingNote, setEditingNote] =
    useState(null);

  const [noteValue, setNoteValue] =
    useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [showCompletionModal, setShowCompletionModal] =
    useState(false);

  const [selectedOrderForCompletion, setSelectedOrderForCompletion] =
    useState(null);

  const [completedQuantity, setCompletedQuantity] =
    useState(0);

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
  const [noteSuccessMessage, setNoteSuccessMessage] =
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

  const handleSaveNote = async (
    orderId
  ) => {
    try {
      await updateOrderNotes(
        orderId,
        noteValue
      );

      setEditingNote(null);

      setNoteValue("");

      setNoteSuccessMessage(true);

      setTimeout(() => {
        setNoteSuccessMessage(false);
      }, 3000);

      await loadOrders();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update notes."
      );
    }
  };

  const handleUpdateCompletion = async () => {
    if (!selectedOrderForCompletion) return;

    if (
      completedQuantity > 
      selectedOrderForCompletion.quantity
    ) {
      alert(
        "Completed quantity cannot exceed total quantity"
      );
      return;
    }

    try {
      await updateItemsCompleted(
        selectedOrderForCompletion.id,
        completedQuantity
      );

      setShowCompletionModal(false);

      setSelectedOrderForCompletion(null);

      setCompletedQuantity(0);

      await loadOrders();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update completion."
      );
    }
  };

  const openCompletionModal = (order) => {
    setSelectedOrderForCompletion(order);

    setCompletedQuantity(
      order.items_completed || 0
    );

    setShowCompletionModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Orders
          </h1>

          <p className="text-gray-500">
            Total Active Orders: {
              orders.filter(
                (o) =>
                  o.status !== "Claimed" &&
                  o.status !== "Ready for Pickup"
              ).length
            }
          </p>
        </div>

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
      {noteSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg mb-4">
          ✅ Notes updated successfully.
        </div>
      )}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Active Orders
        </h2>

        {/* MOBILE VIEW */}
        <div className="space-y-4">
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
                  <h3
                    onClick={() =>
                      setSelectedCustomer(order)
                    }
                    className="font-bold text-lg cursor-pointer text-blue-900 hover:text-blue-700 hover:underline"
                  >
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

                  <div>
                    <strong>Items Completed:</strong>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              order.quantity
                                ? (
                                    (
                                      order.items_completed ||
                                      0
                                    ) / order.quantity
                                  ) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {order.items_completed ||
                          0}
                        /
                        {order.quantity || 1}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        openCompletionModal(
                          order
                        )
                      }
                      className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Update Progress
                    </button>
                  </div>

                  <div>
                    <strong>Notes:</strong>


                    {editingNote === order.id ? (
                      <div className="mt-2">
                        <textarea
                          value={noteValue}
                          onChange={(e) =>
                            setNoteValue(
                              e.target.value
                            )
                          }
                          rows="4"
                          className="w-full border rounded-lg p-2"
                        />

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() =>
                              handleSaveNote(
                                order.id
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => {
                              setEditingNote(null);
                              setNoteValue("");
                            }}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="mt-1">
                          {order.notes || "-"}
                        </p>

                        <button
                          onClick={() => {
                            setEditingNote(
                              order.id
                            );

                            setNoteValue(
                              order.notes || ""
                            );
                          }}
                          className="mt-2 bg-blue-900 hover:bg-blue-800 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Edit Notes
                        </button>
                      </div>
                    )}
                  </div>
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
        <div className="space-y-4">
          <table className="w-full border-collapse">
            {/* KEEP YOUR CURRENT TABLE HERE */}
          </table>
        </div>
      </div>

      {/* COMPLETION TRACKING MODAL */}
      {showCompletionModal &&
        selectedOrderForCompletion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Update Completion
                </h2>
                <button
                  onClick={() => {
                    setShowCompletionModal(
                      false
                    );
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Order: {
                      selectedOrderForCompletion.customer_name
                    }
                  </label>
                  <p className="text-gray-600 text-sm">
                    Total Items:{" "}
                    {
                      selectedOrderForCompletion.quantity ||
                      1
                    }
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Items Completed:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max={
                        selectedOrderForCompletion.quantity ||
                        1
                      }
                      value={completedQuantity}
                      onChange={(e) =>
                        setCompletedQuantity(
                          Math.max(
                            0,
                            parseInt(
                              e.target
                                .value || 0
                            )
                          )
                        )
                      }
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <span className="text-sm font-semibold text-gray-600">
                      /{
                        selectedOrderForCompletion.quantity ||
                        1
                      }
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            selectedOrderForCompletion.quantity
                              ? (
                                  completedQuantity /
                                  (
                                    selectedOrderForCompletion.quantity ||
                                    1
                                  )
                                ) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-purple-700 font-semibold">
                    {Math.round(
                      selectedOrderForCompletion.quantity
                        ? (
                            completedQuantity /
                            (
                              selectedOrderForCompletion.quantity ||
                              1
                            )
                          ) * 100
                        : 0
                    )}
                    % Completed
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={
                    handleUpdateCompletion
                  }
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowCompletionModal(
                      false
                    );
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Customer Details
              </h2>
              <button
                onClick={() =>
                  setSelectedCustomer(null)
                }
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700">
                  Name:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.customer_name}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Contact Number:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.contact_number ||
                    "N/A"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Email:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.email || "N/A"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Date Received:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.date_received ||
                    "N/A"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Service Type:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.service_type ||
                    "N/A"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Due Date:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.due_date ||
                    "N/A"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Priority:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.priority ||
                    "N/A"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Status:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.status || "N/A"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Payment Status:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.payment_status ||
                    "N/A"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Balance:
                </label>
                <p className="text-red-600 font-bold">
                  ₱
                  {Number(
                    selectedCustomer.balance || 0
                  ).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">
                  Notes:
                </label>
                <p className="text-gray-600">
                  {selectedCustomer.notes ||
                    "No notes"}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setSelectedCustomer(null)
              }
              className="w-full mt-6 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div >
  );
}
