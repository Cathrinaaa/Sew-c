import { useEffect, useState } from "react";
import {
    getOrders,
    updateOrderStatus,
} from "../services/orderService";

export default function Schedule() {
    const [allOrders, setAllOrders] = useState([]);
    const [orders, setOrders] = useState([]);

    const [serviceFilter, setServiceFilter] =
        useState("All");

    const [scheduleDate, setScheduleDate] =
        useState(
            new Date()
                .toISOString()
                .split("T")[0]
        );
    const [viewMode, setViewMode] =
        useState("all");

    const loadOrders = async () => {
        try {
            const data = await getOrders();
            
            setAllOrders(data);
           

            const priorityOrder = {
                Rush: 1,
                Urgent: 2,
                Normal: 3,
            };

            const filteredOrders = data.filter(
                (order) => {
                    const activeOrder =
                        order.status === "Pending" ||
                        order.status === "In Progress";

                    const serviceMatch =
                        serviceFilter === "All"
                            ? true
                            : order.service_type ===
                            serviceFilter;

                    const dueTodayMatch =
                        viewMode === "dueToday"
                            ? order.due_date === scheduleDate
                            : true;

                    const overdueMatch =
                        viewMode === "overdue"
                            ? order.due_date &&
                            order.due_date < scheduleDate
                            : true;

                    return (
                        activeOrder &&
                        serviceMatch &&
                        dueTodayMatch &&
                        overdueMatch
                    );
                }
            );

            const scheduleOrders =
                filteredOrders.sort((a, b) => {
                    const receivedDiff =
                        new Date(
                            a.date_received
                        ) -
                        new Date(
                            b.date_received
                        );

                    if (receivedDiff !== 0)
                        return receivedDiff;

                    const dueDiff =
                        new Date(a.due_date) -
                        new Date(b.due_date);

                    if (dueDiff !== 0)
                        return dueDiff;

                    return (
                        (priorityOrder[
                            a.priority
                        ] || 99) -
                        (priorityOrder[
                            b.priority
                        ] || 99)
                    );
                });

            setOrders(scheduleOrders);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [serviceFilter, viewMode, scheduleDate]);
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
    const getDaysLeft = (dueDate) => {
        if (!dueDate) return "-";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        const diff = Math.ceil(
            (due - today) / (1000 * 60 * 60 * 24)
        );

        if (diff < 0)
            return `🔴 Overdue (${Math.abs(diff)}d)`;

        if (diff === 0)
            return "🟠 Due Today";

        if (diff === 1)
            return "🟡 Tomorrow";

        return `🟢 ${diff} days`;
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow rounded-xl p-6">
                <h1 className="text-3xl font-bold mb-2">
                    Production Schedule
                </h1>

                <p className="text-gray-500 mb-6">
                    Orders sorted by date received, due date, and priority.
                </p>
                <div className="flex flex-col md:flex-row gap-3 mb-4">

                    <select
                        value={serviceFilter}
                        onChange={(e) =>
                            setServiceFilter(
                                e.target.value
                            )
                        }
                        className="border rounded-lg p-2"
                    >
                        <option value="All">
                            All Services
                        </option>

                        <option value="Uniform Sewing">
                            Uniform Sewing
                        </option>

                        <option value="Pants Alteration">
                            Pants Alteration
                        </option>

                        <option value="Dress Alteration">
                            Dress Alteration
                        </option>

                        <option value="Repair">
                            Repair
                        </option>

                        <option value="Curtain Sewing">
                            Curtain Sewing
                        </option>

                        <option value="Project">
                            Project
                        </option>

                        <option value="Patches Sewing">
                            Patches Sewing
                        </option>

                        <option value="Others">
                            Others
                        </option>
                    </select>

                    <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) =>
                            setScheduleDate(
                                e.target.value
                            )
                        }
                        className="border rounded-lg p-2"
                    />

                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

                    <div
                        onClick={() =>
                            setViewMode("all")
                        }
                        className={`p-3 rounded-lg cursor-pointer ${viewMode === "all"
                            ? "bg-blue-200 border-2 border-blue-500"
                            : "bg-blue-50"
                            }`}
                    >
                        <p className="text-sm text-gray-500">
                            Total Orders
                        </p>

                        <p className="font-bold text-xl">
                            {
                                allOrders.filter(
                                    (o) =>
                                        o.status === "Pending" ||
                                        o.status === "In Progress"
                                ).length
                            }
                        </p>
                    </div>

                    <div
                        onClick={() =>
                            setViewMode("dueToday")
                        }
                        className={`p-3 rounded-lg cursor-pointer ${viewMode === "dueToday"
                            ? "bg-yellow-200 border-2 border-yellow-500"
                            : "bg-yellow-50"
                            }`}
                    >
                        <p className="text-sm text-gray-500">
                            Due Today
                        </p>

                        <p className="font-bold text-xl">
                            {
                                allOrders.filter(
                                    (o) =>
                                        o.due_date ===
                                        scheduleDate
                                ).length
                            }
                        </p>
                    </div>

                    <div
                        onClick={() =>
                            setViewMode("overdue")
                        }
                        className={`p-3 rounded-lg cursor-pointer ${viewMode === "overdue"
                            ? "bg-red-200 border-2 border-red-500"
                            : "bg-red-50"
                            }`}
                    >
                        <p className="text-sm text-gray-500">
                            Overdue
                        </p>

                        <p className="font-bold text-xl">
                            {
                                allOrders.filter(
                                    (o) =>
                                        o.due_date <
                                        scheduleDate
                                ).length
                            }
                        </p>
                    </div>

                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">
                                    Queue
                                </th>

                                <th className="border p-2">
                                    Customer
                                </th>

                                <th className="border p-2">
                                    Contact No.
                                </th>

                                <th className="border p-2">
                                    Date Received
                                </th>

                                <th className="border p-2">
                                    Due Date
                                </th>

                                <th className="border p-2">
                                    Status
                                </th>

                                <th className="border p-2">
                                    Notes
                                </th>

                                <th className="border p-2">
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
                                orders.map((order, index) => (
                                    <tr key={order.id}>
                                        <td className="border p-2 font-bold">
                                            #{index + 1}
                                        </td>

                                        <td className="border p-2">
                                            {order.customer_name}
                                        </td>

                                        <td className="border p-2">
                                            {order.contact_number || "-"}
                                        </td>

                                        <td className="border p-2">
                                            {order.date_received}
                                        </td>

                                        <td className="border p-2">
                                            {order.due_date || "-"}
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

                                        <td className="border p-2 min-w-[300px] whitespace-pre-wrap break-words">
                                            {order.notes || "-"}
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