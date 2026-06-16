import { supabase } from "../lib/supabase";

export async function createUkaySale(saleData) {
    const { data, error } = await supabase
        .from("ukay_sales")
        .insert([saleData])
        .select();

    if (error) throw error;

    return data;
}

export async function getUkaySales() {
    const { data, error } = await supabase
        .from("ukay_sales")
        .select("*")
        .order("sale_date", {
            ascending: false,
        });

    if (error) throw error;

    return data;
}