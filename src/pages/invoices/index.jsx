import { useMemo, useState } from "react";
import { FiBell, FiCheck, FiDownload, FiEdit2, FiFileText, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import MetricCard from "../../components/metricCard/index.jsx";
import PageHeading from "../../components/pageHeading/index.jsx";
import StatusBadge from "../../components/statusBadge/index.jsx";
import { formatCurrency, formatDate } from "../../data.js";
import { downloadCsv, getInvoiceReference } from "../../utils.js";
import styles from "./styles.module.css";

const InvoicesPage = ({ customers, invoices, onCreate, onEdit, onDetails, onDelete, onMarkInvoicePaid, onLogReminder, onNotify }) => {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("All invoices");
    const [sort, setSort] = useState("newest");
    const paidTotal = invoices.filter((invoice) => invoice.status === "Paid").reduce((total, invoice) => total + invoice.amount, 0);
    const openInvoices = invoices.filter((invoice) => invoice.status === "Open");
    const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue");
    const openTotal = openInvoices.concat(overdueInvoices).reduce((total, invoice) => total + invoice.amount, 0);

    const filtered = useMemo(() => invoices.filter((invoice) => {
        const customer = customers.find((item) => item.id === invoice.customerId);
        const matchesQuery = `${getInvoiceReference(invoice)} ${customer?.company || ""} ${customer?.email || ""} ${invoice.description}`.toLowerCase().includes(query.trim().toLowerCase());
        return matchesQuery && (status === "All invoices" || invoice.status === status);
    }).toSorted((a, b) => sort === "amount" ? b.amount - a.amount : b.issued.localeCompare(a.issued)), [customers, invoices, query, sort, status]);

    const exportInvoices = () => {
        const rows = [["Invoice", "Customer", "Description", "Issued", "Due date", "Status", "Amount"]];
        filtered.forEach((invoice) => rows.push([
            getInvoiceReference(invoice),
            customers.find((customer) => customer.id === invoice.customerId)?.company,
            invoice.description,
            invoice.issued,
            invoice.due,
            invoice.status,
            invoice.amount,
        ]));
        if (downloadCsv(rows, "ledgerline-invoices.csv")) onNotify(`${filtered.length} invoices exported`);
    };

    const clearFilters = () => { setQuery(""); setStatus("All invoices"); };
    const hasFilters = query || status !== "All invoices";

    return (
        <div className={styles.invoicesPage}>
            <PageHeading title="Invoices" description="Review charges, follow up on balances, and keep billing records current." actions={<><button className={styles.secondaryButton} type="button" onClick={exportInvoices}><FiDownload aria-hidden="true" /> Export CSV</button><button className={styles.primaryButton} type="button" onClick={() => onCreate("invoice")}><FiPlus aria-hidden="true" /> Create invoice</button></>} />

            <section className={styles.summaryGrid} aria-label="Invoice totals">
                <MetricCard label="Open balance" value={formatCurrency(openTotal)} detail="Open and overdue charges" icon={FiFileText} tone="orange" />
                <MetricCard label="Past due" value={overdueInvoices.length} detail={`${formatCurrency(overdueInvoices.reduce((total, item) => total + item.amount, 0))} needs follow-up`} icon={FiBell} tone="rose" />
                <MetricCard label="Open invoices" value={openInvoices.length} detail="Awaiting payment" icon={FiFileText} />
                <MetricCard label="Paid invoice value" value={formatCurrency(paidTotal)} detail="Across the billing ledger" icon={FiCheck} tone="green" />
            </section>

            <section className={styles.ledgerPanel}>
                <div className={styles.panelHeading}><div><h2>Invoice ledger</h2><p>{filtered.length} invoice records</p></div><span className={styles.ledgerMark}><FiFileText aria-hidden="true" /> Billing history</span></div>
                <div className={styles.toolbar}>
                    <label className={styles.searchBox}><FiSearch aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, customer, or description" aria-label="Search invoices" /></label>
                    <label className={styles.selectBox}><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All invoices</option><option>Open</option><option>Overdue</option><option>Paid</option><option>Draft</option></select></label>
                    <label className={styles.selectBox}><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="amount">Largest amount</option></select></label>
                    {hasFilters && <button className={styles.clearButton} type="button" onClick={clearFilters}>Clear filters</button>}
                </div>
                <div className={styles.tableScroll}>
                    <table>
                        <thead><tr><th>Invoice</th><th>Customer</th><th>Issued</th><th>Due date</th><th>Status</th><th className={styles.amount}>Amount</th><th>Next step</th></tr></thead>
                        <tbody>{filtered.map((invoice) => {
                            const customer = customers.find((item) => item.id === invoice.customerId);
                            return <tr key={invoice.id}>
                                <td><button className={styles.recordLink} type="button" onClick={() => onDetails("invoice", invoice)}>{getInvoiceReference(invoice)}</button><small>{invoice.description}</small></td>
                                <td><button className={styles.customerButton} type="button" onClick={() => customer && onDetails("customer", customer)}><strong>{customer?.company || "Customer removed"}</strong><small>{customer?.email || "No billing email"}</small></button></td>
                                <td>{formatDate(invoice.issued, { month: "short", day: "numeric", year: "numeric" })}</td>
                                <td>{formatDate(invoice.due, { month: "short", day: "numeric", year: "numeric" })}</td>
                                <td><StatusBadge status={invoice.status} /></td>
                                <td className={styles.amount}>{formatCurrency(invoice.amount)}</td>
                                <td><div className={styles.rowActions}>
                                    {invoice.status === "Open" || invoice.status === "Overdue" ? <>
                                        <button className={styles.markPaid} type="button" onClick={() => onMarkInvoicePaid(invoice)}><FiCheck aria-hidden="true" /> Mark paid</button>
                                        <button className={styles.reminderButton} type="button" disabled={Boolean(invoice.reminderSent)} onClick={() => onLogReminder(invoice)} aria-label={invoice.reminderSent ? `Reminder recorded for ${getInvoiceReference(invoice)}` : `Record payment reminder for ${getInvoiceReference(invoice)}`} title={invoice.reminderSent ? `Reminder recorded ${formatDate(invoice.reminderSent)}` : "Record reminder"}><FiBell aria-hidden="true" /><span>{invoice.reminderSent ? "Noted" : "Remind"}</span></button>
                                    </> : null}
                                    <button className={styles.iconButton} type="button" aria-label={`Edit ${getInvoiceReference(invoice)}`} title="Edit invoice" onClick={() => onEdit("invoice", invoice)}><FiEdit2 aria-hidden="true" /></button>
                                    <button className={styles.iconButton} type="button" aria-label={`Delete ${getInvoiceReference(invoice)}`} title="Delete invoice" onClick={() => onDelete("invoice", invoice)}><FiTrash2 aria-hidden="true" /></button>
                                </div></td>
                            </tr>;
                        })}</tbody>
                    </table>
                    {!filtered.length && <div className={styles.emptyState}><strong>No invoices found</strong><span>Try a different search or status.</span>{hasFilters && <button type="button" onClick={clearFilters}>Clear filters</button>}</div>}
                </div>
                <div className={styles.panelFooter}><span>Marking an invoice paid updates its linked past-due subscription.</span><span>{filtered.length} shown</span></div>
            </section>
        </div>
    );
};

export default InvoicesPage;
