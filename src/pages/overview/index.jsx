import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowDownRight, FiArrowUpRight, FiCreditCard, FiDownload, FiFileText, FiPlus, FiRepeat, FiUsers } from "react-icons/fi";
import MetricCard from "../../components/metricCard/index.jsx";
import PageHeading from "../../components/pageHeading/index.jsx";
import StatusBadge from "../../components/statusBadge/index.jsx";
import { formatCurrency, formatDate } from "../../data.js";
import { downloadCsv, getInvoiceReference, getSubscriptionReference } from "../../utils.js";
import styles from "./styles.module.css";

const revenueHistory = [
    { month: "Jan", amount: 26200 }, { month: "Feb", amount: 28300 }, { month: "Mar", amount: 31600 },
    { month: "Apr", amount: 32900 }, { month: "May", amount: 34700 }, { month: "Jun", amount: 36100 },
    { month: "Jul", amount: 38900 }, { month: "Aug", amount: 41200 }, { month: "Sep", amount: 43800 }, { month: "Oct", amount: 46200 },
];

const OverviewPage = ({ customers, plans, subscriptions, invoices, onCreate, onDetails, onNotify }) => {
    const [period, setPeriod] = useState("6");
    const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === "Active" || subscription.status === "Past due");
    const mrr = activeSubscriptions.reduce((total, subscription) => {
        const plan = plans.find((item) => item.id === subscription.planId);
        return total + (plan ? plan.interval === "Yearly" ? plan.amount / 12 : plan.amount : 0);
    }, 0);
    const outstanding = invoices.filter((invoice) => invoice.status === "Open" || invoice.status === "Overdue").reduce((total, invoice) => total + invoice.amount, 0);
    const paidThisMonth = invoices.filter((invoice) => invoice.status === "Paid" && invoice.issued.startsWith("2026-10")).reduce((total, invoice) => total + invoice.amount, 0);
    const chartData = revenueHistory.slice(-Number(period));
    const maxRevenue = Math.max(...chartData.map((item) => item.amount));
    const upcoming = useMemo(() => subscriptions
        .filter((subscription) => subscription.status === "Active" || subscription.status === "Trial")
        .toSorted((a, b) => a.renews.localeCompare(b.renews))
        .slice(0, 4), [subscriptions]);
    const recentInvoices = useMemo(() => invoices.toSorted((a, b) => b.issued.localeCompare(a.issued)).slice(0, 5), [invoices]);

    const exportSummary = () => {
        const rows = [["Metric", "Value"], ["Monthly recurring revenue", Math.round(mrr)], ["Active subscriptions", activeSubscriptions.length], ["Outstanding invoices", outstanding], ...recentInvoices.map((invoice) => [getInvoiceReference(invoice), invoice.amount])];
        if (downloadCsv(rows, "ledgerline-revenue-summary.csv")) onNotify("Revenue summary downloaded");
    };

    return (
        <div className={styles.overview}>
            <PageHeading
                title="Billing overview"
                description="A current view of recurring revenue and the work that needs attention."
                actions={<><button className={styles.secondaryButton} type="button" onClick={exportSummary}><FiDownload aria-hidden="true" /> Export</button><button className={styles.primaryButton} type="button" onClick={() => onCreate("subscription")}><FiPlus aria-hidden="true" /> New subscription</button></>}
            />

            <section className={styles.metricGrid} aria-label="Billing totals">
                <MetricCard label="Monthly recurring revenue" value={formatCurrency(Math.round(mrr))} detail="Current active plan value" icon={FiCreditCard} trend="+8.6%" />
                <MetricCard label="Active subscriptions" value={activeSubscriptions.length} detail={`${subscriptions.filter((item) => item.status === "Trial").length} trials in progress`} icon={FiRepeat} tone="blue" />
                <MetricCard label="Outstanding balance" value={formatCurrency(outstanding)} detail={`${invoices.filter((item) => item.status === "Overdue").length} invoices overdue`} icon={FiFileText} tone="orange" />
                <MetricCard label="Paid this month" value={formatCurrency(paidThisMonth)} detail={`${invoices.filter((item) => item.status === "Paid" && item.issued.startsWith("2026-10")).length} settled invoices`} icon={FiUsers} tone="green" />
            </section>

            <section className={styles.primaryGrid}>
                <article className={styles.revenuePanel}>
                    <div className={styles.panelHeading}>
                        <div><h2>Revenue trend</h2><p>Monthly recurring revenue, USD</p></div>
                        <label className={styles.periodSelect}><span className={styles.visuallyHidden}>Revenue chart period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="6">Last 6 months</option><option value="9">Last 9 months</option><option value="10">Year to date</option></select></label>
                    </div>
                    <div className={styles.chartSummary}><strong>{formatCurrency(Math.round(mrr))}</strong><span><FiArrowUpRight aria-hidden="true" /> 8.6% <small>vs. previous period</small></span></div>
                    <div className={styles.chart} role="img" aria-label={`Revenue chart from ${chartData[0].month} to ${chartData.at(-1).month}`}>
                        <div className={styles.axisLabels}><span>$50k</span><span>$35k</span><span>$20k</span><span>$5k</span></div>
                        <div className={styles.chartBars}>
                            {chartData.map((point) => <div className={styles.barColumn} key={point.month} title={`${point.month}: ${formatCurrency(point.amount)}`}><span className={styles.bar} style={{ height: `${Math.max(16, (point.amount / maxRevenue) * 100)}%` }} /><small>{point.month}</small></div>)}
                        </div>
                    </div>
                    <div className={styles.chartFoot}><span><i /> Recurring revenue</span><span>Updated from current plan records</span></div>
                </article>

                <article className={styles.renewalPanel}>
                    <div className={styles.panelHeading}><div><h2>Next renewals</h2><p>Upcoming account billing dates</p></div><Link to="/subscriptions" className={styles.panelLink}>View all <FiArrowUpRight aria-hidden="true" /></Link></div>
                    <div className={styles.renewalList}>
                        {upcoming.map((subscription) => {
                            const customer = customers.find((item) => item.id === subscription.customerId);
                            const plan = plans.find((item) => item.id === subscription.planId);
                            return <button className={styles.renewalItem} key={subscription.id} type="button" onClick={() => onDetails("subscription", subscription)}>
                                <span className={`${styles.customerAvatar} ${styles[customer?.color || "lilac"]}`}>{customer?.initials || "??"}</span>
                                <span className={styles.renewalCopy}><strong>{customer?.company || "Unknown customer"}</strong><small>{plan?.name || "Plan"} · {getSubscriptionReference(subscription)}</small></span>
                                <span className={styles.renewalDate}><strong>{formatDate(subscription.renews, { month: "short", day: "numeric" })}</strong><small>{formatCurrency(plan?.amount || 0)}</small></span>
                            </button>;
                        })}
                        {!upcoming.length && <p className={styles.emptyState}>No upcoming renewals to show.</p>}
                    </div>
                    <Link to="/subscriptions" className={styles.renewalFooter}><span>Review subscription schedule</span><FiArrowUpRight aria-hidden="true" /></Link>
                </article>
            </section>

            <section className={styles.invoicePanel}>
                <div className={styles.panelHeading}><div><h2>Recent invoices</h2><p>Latest account billing activity</p></div><Link to="/invoices" className={styles.panelLink}>Open invoice ledger <FiArrowUpRight aria-hidden="true" /></Link></div>
                <div className={styles.tableScroll}>
                    <table>
                        <thead><tr><th>Invoice</th><th>Customer</th><th>Issued</th><th>Due date</th><th>Status</th><th className={styles.amountCell}>Amount</th></tr></thead>
                        <tbody>{recentInvoices.map((invoice) => {
                            const customer = customers.find((item) => item.id === invoice.customerId);
                            return <tr key={invoice.id}>
                                <td><button className={styles.recordButton} type="button" onClick={() => onDetails("invoice", invoice)}>{getInvoiceReference(invoice)}</button><small>{invoice.description}</small></td>
                                <td><span className={styles.tableCustomer}>{customer?.company || "Customer removed"}</span><small>{customer?.email || "No billing email"}</small></td>
                                <td>{formatDate(invoice.issued, { month: "short", day: "numeric" })}</td>
                                <td>{formatDate(invoice.due, { month: "short", day: "numeric" })}</td>
                                <td><StatusBadge status={invoice.status} /></td>
                                <td className={styles.amountCell}>{formatCurrency(invoice.amount)}</td>
                            </tr>;
                        })}</tbody>
                    </table>
                    {!recentInvoices.length && <p className={styles.emptyState}>No invoices are available yet.</p>}
                </div>
                <div className={styles.invoiceFooter}><span><FiArrowDownRight aria-hidden="true" /> Invoice data updates when a payment is recorded.</span><button type="button" onClick={() => onCreate("invoice")}><FiPlus aria-hidden="true" /> Create invoice</button></div>
            </section>
        </div>
    );
};

export default OverviewPage;
