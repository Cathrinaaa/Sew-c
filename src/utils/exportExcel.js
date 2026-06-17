import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = (
    orders,
    payments,
    ukaySales
) => {
    const workbook = XLSX.utils.book_new();

    // ======================
    // COMPUTE TOTALS
    // ======================

    const totalTailoringIncome = payments.reduce(
        (sum, payment) =>
            sum + Number(payment.amount || 0),
        0
    );

    const totalUkayIncome = ukaySales.reduce(
        (sum, sale) =>
            sum + Number(sale.amount || 0),
        0
    );

    const totalIncome =
        totalTailoringIncome +
        totalUkayIncome;

    // ======================
    // SUMMARY SHEET
    // ======================

    const summaryData = [
        {
            Report: "SEW-C BUSINESS REPORT",
        },
        {},
        {
            Metric: "Date Generated",
            Value: new Date().toLocaleString(),
        },
        {
            Metric: "Total Orders",
            Value: orders.length,
        },
        {
            Metric: "Total Payments",
            Value: payments.length,
        },
        {
            Metric: "Total Ukay Sales",
            Value: ukaySales.length,
        },
        {
            Metric: "Tailoring Income",
            Value: `₱${totalTailoringIncome.toLocaleString()}`,
        },
        {
            Metric: "Ukay Income",
            Value: `₱${totalUkayIncome.toLocaleString()}`,
        },
        {
            Metric: "Total Business Income",
            Value: `₱${totalIncome.toLocaleString()}`,
        },
    ];

    const summarySheet =
        XLSX.utils.json_to_sheet(
            summaryData
        );

    summarySheet["!cols"] = [
        { wch: 30 },
        { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Summary"
    );

    // ======================
    // ORDERS SHEET
    // ALL DATA
    // ======================

    const ordersSheet =
        XLSX.utils.json_to_sheet(
            orders
        );

    ordersSheet["!cols"] = [
        { wch: 40 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 50 },
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        ordersSheet,
        "Orders"
    );

    // ======================
    // PAYMENTS SHEET
    // ALL DATA
    // ======================

    const paymentsSheet =
        XLSX.utils.json_to_sheet(
            payments
        );

    paymentsSheet["!cols"] = [
        { wch: 40 },
        { wch: 40 },
        { wch: 15 },
        { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        paymentsSheet,
        "Payments"
    );

    // ======================
    // UKAY SALES SHEET
    // ALL DATA
    // ======================

    const ukaySalesSheet =
        XLSX.utils.json_to_sheet(
            ukaySales
        );

    ukaySalesSheet["!cols"] = [
        { wch: 40 },
        { wch: 30 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 50 },
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        ukaySalesSheet,
        "Ukay Sales"
    );

    // ======================
    // EXPORT FILE
    // ======================

    const excelBuffer =
        XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

    const file = new Blob(
        [excelBuffer],
        {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
    );

    saveAs(
        file,
        `SEW-C-BACKUP-${
            new Date()
                .toISOString()
                .split("T")[0]
        }.xlsx`
    );
};