import { supabase } from "../lib/supabase";

/* =========================
   ORDER NUMBER
========================= */
export async function getNextOrderNumber() {
  const today = new Date();

  const datePart =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

  const { count, error } = await supabase
    .from("orders")
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) throw error;

  const nextNumber = String(
    (count || 0) + 1
  ).padStart(3, "0");

  return `SEWC-${datePart}-${nextNumber}`;
}

/* =========================
   CREATE ORDER
========================= */
export async function createOrder(orderData) {
  // Create order first
  const { data, error } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (error) throw error;

  // Automatically record down payment
  const downPayment = Number(
    orderData.down_payment || 0
  );

  if (downPayment > 0) {
    const { error: paymentError } =
      await supabase
        .from("payments")
        .insert([
          {
            order_id: data.id,
            amount: downPayment,
            payment_date:
              orderData.date_received,
          },
        ]);

    if (paymentError)
      throw paymentError;
  }

  return data;
}
/* =========================
   GET ORDERS
========================= */
export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("date_received", {
      ascending: true,
    });

  if (error) throw error;

  return data;
}

/* =========================
   UPDATE ORDER STATUS
========================= */
export async function updateOrderStatus(
  orderId,
  status
) {
  let updateData = {
    status,
  };

  // Auto manage claimed_at
  if (status === "Claimed") {
    updateData.claimed_at =
      new Date().toISOString();
  } else {
    updateData.claimed_at = null;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select();

  if (error) throw error;

  return data;
}

/* =========================
   UPDATE PAYMENT STATUS
========================= */
export async function updatePaymentStatus(
  orderId,
  paymentStatus
) {
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
    })
    .eq("id", orderId);

  if (error) throw error;
}

/* =========================
   RECORD PAYMENT
========================= */
export async function recordPayment(
  orderId,
  amount,
  paymentDate
) {
  // Save payment history
  const { data: paymentData, error: paymentError } =
    await supabase
      .from("payments")
      .insert([
        {
          order_id: orderId,
          amount: Number(amount),
          payment_date: paymentDate,
        },
      ])
      .select();

  if (paymentError) throw paymentError;

  // Get current order
  const { data: order, error: orderError } =
    await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

  if (orderError) throw orderError;

  const currentBalance = Number(
    order.balance || 0
  );

  const newBalance = Math.max(
    0,
    currentBalance - Number(amount)
  );

  const payment_status =
    newBalance === 0
      ? "Paid"
      : "Partial";

  const { error: updateError } =
    await supabase
      .from("orders")
      .update({
        balance: newBalance,
        payment_status,
      })
      .eq("id", orderId);

  if (updateError) throw updateError;

  return paymentData;
}

/* =========================
   GET ALL PAYMENTS
========================= */
export async function getPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("payment_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

/* =========================
   GET PAYMENTS OF ONE ORDER
========================= */
export async function getPaymentsByOrder(
  orderId
) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("payment_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

/* =========================
   DASHBOARD
========================= */
export async function getDashboardStats() {
  const { data, error } = await supabase
    .from("orders")
    .select("*");

  if (error) throw error;

  return data;
}

export async function updateOrderNotes(
  orderId,
  notes
) {
  const { error } = await supabase
    .from("orders")
    .update({ notes })
    .eq("id", orderId);

  if (error) throw error;
}