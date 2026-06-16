import { useEffect, useState } from "react";
import {
    getOrders,
    updateOrderStatus,
} from "../services/orderService";

export default function Schedule() {
    const [orders, setOrders] = useState([]);

    const loadOrders = async () => {
        try {
            const data = await getOrders();

            const priorityOrder = {
                Rush: 1,
                Urgent: 2,
                Normal: 3,
            };

            const scheduleOrders = data
                .filter(
                    (order) =>
                        order.status === "Pending" ||
                        order.status === "In Progress"
                )
                .sort((a, b) => {
                    const priorityDiff =
                        (priorityOrder[a.priority] || 99) -
                        (priorityOrder[b.priority] || 99);

                    if (priorityDiff !== 0)
                        return priorityDiff;

                    return (
                        new Date(a.due_date) -
                        new Date(b.due_date)
                    );
                });

            setOrders(scheduleOrders);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

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

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow rounded-xl p-6">
                <h1 className="text-3xl font-bold mb-2">
                    Production Schedule
                </h1>

                <p className="text-gray-500 mb-6">
                    Orders sorted by priority and
                    due date.
                </p>

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
                                    Due Date
                                </th>

                                <th className="border p-2 text-left">
                                    Priority
                                </th>

                                <th className="border p-2 text-left">
                                    Status
                                </th>

                                <th className="border p-2 text-left">
                                    Notes
                                </th>

                                <th className="border p-2 text-left">
                                    Image
                                </th>

                                <th className="border p-2 text-left">
                                    Balance
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
                                        No scheduled orders
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
                                            {order.due_date || "-"}
                                        </td>

                                        <td className="border p-2">
                                            {order.priority}
                                        </td>

                                        <td className="border p-2">
                                            <select
                                                value={order.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        order.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="border rounded px-2 py-1"
                                            >
                                                <option value="Pending">
                                                    Pending
                                                </option>

                                                <option value="In Progress">
                                                    In Progress
                                                </option>

                                                <option value="Ready for Pickup">
                                                    Ready for Pickup
                                                </option>

                                                <option value="Claimed">
                                                    Claimed
                                                </option>
                                            </select>
                                        </td>

                                        <td className="border p-2 max-w-xs">
                                            {order.notes
                                                ? order.notes.length >
                                                    40
                                                    ? order.notes.substring(
                                                        0,
                                                        40
                                                    ) + "..."
                                                    : order.notes
                                                : "-"}
                                        </td>

                                        <td className="border p-2">
                                            {order.image_url ? (
                                                <img
                                                    src={order.image_url}
                                                    alt="Order"
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                        <td className="border p-2 font-semibold text-red-600">
                                            ₱
                                            {Number(
                                                order.balance || 0
                                            ).toLocaleString()}
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