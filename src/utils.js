export const downloadCsv = (rows, filename) => {
    if (!rows.length) return false;
    const escapeValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = rows.map((row) => row.map(escapeValue).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return true;
};

export const getSubscriptionReference = (subscription) => {
    const match = subscription.id.match(/^sub-(\d+)$/);
    return match ? `SUB-${match[1]}` : `SUB-${subscription.id.slice(-4).toUpperCase()}`;
};

export const getInvoiceReference = (invoice) => invoice.number || invoice.id;
