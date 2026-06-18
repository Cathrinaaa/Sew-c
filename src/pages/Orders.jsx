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
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-gray-200 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    Update Progress
                  </h2>
                  <p className="text-sm text-gray-500">
                    Track completion status
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCompletionModal(
                      false
                    );
                  }}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 font-semibold mb-1">
                    Order for
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    {
                      selectedOrderForCompletion.customer_name
                    }
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Total Items: <span className="font-bold">{selectedOrderForCompletion.quantity || 1}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Items Completed
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
                      className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    />
                    <span className="text-lg font-bold text-gray-500">
                      /{
                        selectedOrderForCompletion.quantity ||
                        1
                      }
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Completion Status
                    </p>
                    <span className="text-2xl font-bold text-blue-600">
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
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
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
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={
                    handleUpdateCompletion
                  }
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Update Progress
                </button>
                <button
                  onClick={() => {
                    setShowCompletionModal(
                      false
                    );
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6 sticky top-0 bg-white -mx-8 px-8 pb-4 border-b">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  Customer Details
                </h2>
                <p className="text-sm text-gray-500">
                  Complete order information
                </p>
              </div>
              <button
                onClick={() =>
                  setSelectedCustomer(null)
                }
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors flex-shrink-0"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  Customer Name
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCustomer.customer_name}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Contact Number
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedCustomer.contact_number ||
                      "—"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-gray-900 break-all">
                    {selectedCustomer.email ||
                      "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Date Received
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedCustomer.date_received ||
                      "—"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Due Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedCustomer.due_date ||
                      "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Service Type
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedCustomer.service_type ||
                      "—"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Priority
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      selectedCustomer.priority === 'High' ? 'bg-red-500' :
                      selectedCustomer.priority === 'Medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCustomer.priority ||
                        "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Status
                  </p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    {selectedCustomer.status || "—"}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Payment Status
                  </p>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                    selectedCustomer.payment_status === 'Paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedCustomer.payment_status ||
                      "—"}
                  </span>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                  Balance
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ₱{Number(
                    selectedCustomer.balance || 0
                  ).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Notes
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedCustomer.notes ||
                    "No notes added"}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setSelectedCustomer(null)
              }
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div >
  );
}
