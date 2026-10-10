import { useMemo, useState } from "react";
import { FiArrowUpRight, FiBarChart2, FiDownload, FiFileText, FiLayers, FiTrendingUp, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import MetricCard from "../../components/metricCard/index.jsx";
import PageHeading from "../../components/pageHeading/index.jsx";
import { formatCurrency } from "../../data.js";
import { downloadCsv } from "../../utils.js";
import styles from "./styles.module.css";

const getRecentMonths = (count) => Array.from({ length: count }, (_, index) => {
    const month = new Date();
    month.setDate(1);
    month.setMonth(month.getMonth() - (count - 1 - index));
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(month) };
});

const ReportsPage = ({ customers, plans, subscriptions, invoices, onDetails, onNotify }) => {
    const [period, setPeriod] = useState("6");
    const months = getRecentMonths(Number(period));
    const monthKeys = new Set(months.map((month) => month.key));
    const periodInvoices = invoices.filter((invoice) => monthKeys.has(invoice.issued.slice(0, 7)));
    const paidInvoices = periodInvoices.filter((invoice) => invoice.status === "Paid");
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const openAmount = periodInvoices.filter((invoice) => invoice.status === "Open" || invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.amount, 0);
    const avgInvoice = paidInvoices.length ? paidAmount / paidInvoices.length : 0;
    const chart = months.map((month) => ({
        ...month,
        amount: paidInvoices.filter((invoice) => invoice.issued.startsWith(month.key)).reduce((sum, invoice) => sum + invoice.amount, 0),
    }));
    const maxAmount = Math.max(...chart.map((month) => month.amount), 1);
    const paidRatio = periodInvoices.length ? Math.round(paidInvoices.length / periodInvoices.length * 100) : 0;

    const planSummary = useMemo(() => plans.map((plan) => {
        const active = subscriptions.filter((subscription) => subscription.planId === plan.id && subscription.status === "Active");
        const monthly = active.reduce((sum) => sum + (plan.interval === "Yearly" ? plan.amount / 12 : plan.amount), 0);
        return { plan, count: active.length, monthly };
    }).toSorted((a, b) => b.monthly - a.monthly), [plans, subscriptions]);
    const maxPlanValue = Math.max(...planSummary.map((item) => item.monthly), 1);
    const topCustomers = customers.map((customer) => ({
        customer,
        total: invoices.filter((invoice) => invoice.customerId === customer.id && invoice.status === "Paid" && monthKeys.has(invoice.issued.slice(0, 7))).reduce((sum, invoice) => sum + invoice.amount, 0),
        count: invoices.filter((invoice) => invoice.customerId === customer.id && monthKeys.has(invoice.issued.slice(0, 7))).length,
    })).filter((item) => item.count).toSorted((a, b) => b.total - a.total).slice(0, 5);
    const statusCounts = ["Paid", "Open", "Overdue", "Draft"].map((value) => ({ value, count: periodInvoices.filter((invoice) => invoice.status === value).length }));
    const statusTotal = Math.max(periodInvoices.length, 1);
    const paidStop = statusCounts[0].count / statusTotal * 100;
    const openStop = paidStop + statusCounts[1].count / statusTotal * 100;
    const overdueStop = openStop + statusCounts[2].count / statusTotal * 100;

    const exportReport = () => {
        const rows = [["Section", "Name", "Count", "Amount"]];
        chart.forEach((month) => rows.push(["Monthly collections", month.label, "", month.amount]));
        planSummary.forEach((item) => rows.push(["Active plans", item.plan.name, item.count, Math.round(item.monthly)]));
        statusCounts.forEach((item) => rows.push(["Invoice status", item.value, item.count, ""]));
        if (downloadCsv(rows, "ledgerline-revenue-report.csv")) onNotify("Revenue report downloaded");
    };

    return (
        <div className={styles.reportsPage}>
            <PageHeading title="Revenue report" description="Explore collections, plan mix, and account billing activity." actions={<><label className={styles.periodSelect}><span>Reporting period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="3">Last 3 months</option><option value="6">Last 6 months</option><option value="12">Last 12 months</option></select></label><button className={styles.primaryButton} type="button" onClick={exportReport}><FiDownload aria-hidden="true" /> Export report</button></>} />

            <section className={styles.metricGrid} aria-label="Revenue report totals">
                <MetricCard label="Collected invoice value" value={formatCurrency(paidAmount)} detail={`${paidInvoices.length} paid invoices in period`} icon={FiTrendingUp} trend={`${paidRatio}% settled`} />
                <MetricCard label="Open balance" value={formatCurrency(openAmount)} detail={`${periodInvoices.filter((invoice) => invoice.status === "Overdue").length} overdue invoices`} icon={FiFileText} tone="orange" />
                <MetricCard label="Average paid invoice" value={formatCurrency(avgInvoice)} detail="Paid invoice average" icon={FiBarChart2} tone="blue" />
                <MetricCard label="Active plan tiers" value={planSummary.filter((item) => item.count).length} detail={`${subscriptions.filter((item) => item.status === "Active").length} renewing accounts`} icon={FiLayers} tone="green" />
            </section>

            <section className={styles.reportGrid}>
                <article className={styles.chartPanel}>
                    <div className={styles.panelHeading}><div><h2>Monthly collections</h2><p>Paid invoice value by issue month</p></div><span className={styles.chartLegend}><i /> Paid</span></div>
                    <div className={styles.chartSummary}><strong>{formatCurrency(paidAmount)}</strong><span>Selected period</span></div>
                    <div className={styles.chart} role="img" aria-label={`Paid invoice values for ${period} months`}>
                        <div className={styles.yAxis}><span>{formatCurrency(maxAmount)}</span><span>{formatCurrency(Math.round(maxAmount * 0.66))}</span><span>{formatCurrency(Math.round(maxAmount * 0.33))}</span><span>$0</span></div>
                        <div className={styles.bars}>{chart.map((month) => <div className={styles.barColumn} key={month.key} title={`${month.label}: ${formatCurrency(month.amount)}`}><span className={styles.bar} style={{ height: `${Math.max(month.amount ? 8 : 0, month.amount / maxAmount * 100)}%` }} /><small>{month.label}</small></div>)}</div>
                    </div>
                    <div className={styles.chartNote}>Collections are grouped by invoice issue date. Demo amounts change when invoice status changes.</div>
                </article>

                <article className={styles.statusPanel}>
                    <div className={styles.panelHeading}><div><h2>Invoice status mix</h2><p>Records issued within this period</p></div><FiFileText className={styles.panelIcon} aria-hidden="true" /></div>
                    <div className={styles.statusGraphic}>
                        <div className={styles.donut} style={{ background: `conic-gradient(#3a987a 0 ${paidStop}%, #df9a51 ${paidStop}% ${openStop}%, #c4596c ${openStop}% ${overdueStop}%, #aab3bc ${overdueStop}% 100%)` }}><span><strong>{periodInvoices.length}</strong><small>invoices</small></span></div>
                        <div className={styles.statusLegend}>{statusCounts.map((item) => <div key={item.value}><span className={`${styles.legendDot} ${styles[item.value.toLowerCase()]}`} /><span>{item.value}</span><strong>{item.count}</strong></div>)}</div>
                    </div>
                    <div className={styles.settlementNote}><span>{paidRatio}%</span><p>of period invoices are marked paid in this demo ledger.</p></div>
                    <Link className={styles.panelLink} to="/invoices">Review invoice ledger <FiArrowUpRight aria-hidden="true" /></Link>
                </article>
            </section>

            <section className={styles.bottomGrid}>
                <article className={styles.planPanel}>
                    <div className={styles.panelHeading}><div><h2>Active value by plan</h2><p>Normalized monthly value by current subscribers</p></div><Link className={styles.panelLink} to="/plans">Manage plans <FiArrowUpRight aria-hidden="true" /></Link></div>
                    <div className={styles.planList}>{planSummary.map(({ plan, count, monthly }) => <button className={styles.planRow} key={plan.id} type="button" onClick={() => onDetails("plan", plan)}>
                        <span className={styles.planName}><strong>{plan.name}</strong><small>{count} active subscribers</small></span>
                        <span className={styles.planBar}><i style={{ width: `${Math.max(monthly ? 3 : 0, monthly / maxPlanValue * 100)}%` }} /></span>
                        <strong className={styles.planValue}>{formatCurrency(Math.round(monthly))}</strong>
                    </button>)}</div>
                </article>

                <article className={styles.accountsPanel}>
                    <div className={styles.panelHeading}><div><h2>Top billed accounts</h2><p>Paid value in selected period</p></div><FiUsers className={styles.panelIcon} aria-hidden="true" /></div>
                    <div className={styles.accountList}>{topCustomers.map(({ customer, total, count }, index) => <button className={styles.accountRow} key={customer.id} type="button" onClick={() => onDetails("customer", customer)}>
                        <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span><span className={`${styles.avatar} ${styles[customer.color || "lilac"]}`}>{customer.initials}</span><span className={styles.accountName}><strong>{customer.company}</strong><small>{count} invoices · {customer.name}</small></span><strong className={styles.accountTotal}>{formatCurrency(total)}</strong>
                    </button>)}{!topCustomers.length && <p className={styles.emptyState}>No paid account activity for this period.</p>}</div>
                </article>
            </section>
        </div>
    );
};

export default ReportsPage;
