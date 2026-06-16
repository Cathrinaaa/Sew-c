import { useEffect, useState } from "react";
import {
  createUkaySale,
  getUkaySales,
} from "../services/ukayService";

export default function UkayIncome() {
  const [sales, setSales] = useState([]);

  const [formData, setFormData] = useState({
    item_name: "",
    quantity: 1,
    amount: "",
    sale_date: "",
    notes: "",
  });

  const loadSales = async () => {
    try {
      const data = await getUkaySales();
      setSales(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createUkaySale({
        ...formData,
        quantity: Number(formData.quantity),
        amount: Number(formData.amount),
      });

      alert("Sale recorded successfully");

      setFormData({
        item_name: "",
        quantity: 1,
        amount: "",
        sale_date: "",
        notes: "",
      });

      loadSales();
    } catch (error) {
      console.error(error);
      alert("Failed to save sale");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold mb-6">
          Ukay Income
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="item_name"
            placeholder="Item Name"
            value={formData.item_name}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <input
            type="date"
            name="sale_date"
            value={formData.sale_date}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          />

          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            className="border rounded-lg p-3 md:col-span-2"
            rows="3"
          />

          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-3 rounded-lg"
          >
            Save Sale
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Sales History
        </h2>

        <div className="space-y-3">
          {sales.length === 0 ? (
            <p>No sales recorded.</p>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="border rounded-lg p-4"
              >
                <div className="font-semibold">
                  {sale.item_name}
                </div>

                <div>
                  Qty: {sale.quantity}
                </div>

                <div>
                  Amount: ₱
                  {Number(
                    sale.amount
                  ).toLocaleString()}
                </div>

                <div>
                  Date: {sale.sale_date}
                </div>

                {sale.notes && (
                  <div>
                    Notes: {sale.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}