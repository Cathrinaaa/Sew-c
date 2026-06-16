import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    createOrder,
    getNextOrderNumber,
} from "../services/orderService";

export default function AddOrder() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
        contactNumber: "",
        serviceType: "",
        quantity: 1,
        dateReceived: "",
        dueDate: "",
        priority: "Normal",
        status: "Pending",
        totalAmount: "",
        downPayment: "",
        notes: "",
        image: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            setFormData({
                ...formData,
                [name]: files[0],
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const orderNumber = await getNextOrderNumber();

            const totalAmount = Number(formData.totalAmount);
            const downPayment = Number(formData.downPayment);
            const balance = totalAmount - downPayment;

            const order = {
                order_number: orderNumber,
                customer_name: formData.customerName,
                contact_number: formData.contactNumber,
                service_type: formData.serviceType,
                date_received: formData.dateReceived,
                due_date: formData.dueDate || null,
                priority: formData.priority,

                total_amount: totalAmount,
                down_payment: downPayment,
                balance: balance,

                payment_status:
                    balance <= 0 ? "Paid" : "Partial",

                quantity: Number(formData.quantity),
                notes: formData.notes,
                status: formData.status,
            };

            await createOrder(order);

            navigate("/orders?success=1");
        } catch (error) {
            console.error(error);

            alert(
                "Failed to save order:\n" +
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const balance =
        Number(formData.totalAmount || 0) -
        Number(formData.downPayment || 0);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white shadow rounded-xl p-6">

                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        to="/orders"
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg inline-block"
                    >
                        ← Back to Orders
                    </Link>
                </div>

                <h1 className="text-3xl font-bold mb-6">
                    Add New Order
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >

                    {/* Customer Information */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Customer Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="customerName"
                                required
                                placeholder="Customer Name"
                                value={formData.customerName}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            />

                            <input
                                type="text"
                                name="contactNumber"
                                placeholder="Contact Number"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            />
                        </div>
                    </div>

                    {/* Order Details */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Order Details
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <select
                                name="serviceType"
                                required
                                value={formData.serviceType}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            >
                                <option value="">
                                    Select Service
                                </option>

                                <option>Uniform Sewing</option>
                                <option>Pants Alteration</option>
                                <option>Dress Alteration</option>
                                <option>Repair</option>
                                <option>Curtain Sewing</option>
                                <option>Project</option>
                                <option>Patches Sewing</option>
                                <option>Others</option>
                            </select>

                            <input
                                type="number"
                                name="quantity"
                                min="1"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Schedule
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="date"
                                name="dateReceived"
                                required
                                value={formData.dateReceived}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            />

                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            />
                        </div>
                    </div>

                    {/* Priority & Status */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Priority & Status
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            >
                                <option>Normal</option>
                                <option>Urgent</option>
                                <option>Rush</option>
                            </select>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            >
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Ready for Pickup</option>
                            </select>
                        </div>
                    </div>

                    {/* Payment */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Payment
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                name="totalAmount"
                                required
                                placeholder="Total Amount"
                                value={formData.totalAmount}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            />

                            <input
                                type="number"
                                name="downPayment"
                                placeholder="Down Payment"
                                value={formData.downPayment}
                                onChange={handleChange}
                                className="border rounded-lg p-3"
                            />
                        </div>

                        <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                            <strong>Remaining Balance:</strong> ₱
                            {balance.toLocaleString()}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Additional Information
                        </h2>

                        <textarea
                            name="notes"
                            rows="4"
                            placeholder="Notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-3"
                        />

                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            className="mt-4 w-full border rounded-lg p-3"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
                    >
                        {loading ? "Saving..." : "Save Order"}
                    </button>
                </form>
            </div>
        </div>
    );
}