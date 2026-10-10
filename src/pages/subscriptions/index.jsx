import { useMemo, useState } from "react";
import { FiCalendar, FiDownload, FiEdit2, FiMoreHorizontal, FiPlus, FiRepeat, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import MetricCard from "../../components/metricCard/index.jsx";
import PageHeading from "../../components/pageHeading/index.jsx";
import StatusBadge from "../../components/statusBadge/index.jsx";
import { formatCurrency, formatDate } from "../../data.js";
import { downloadCsv, getSubscriptionReference } from "../../utils.js";
import styles from "./styles.module.css";

const SubscriptionsPage = ({ customers, plans, subscriptions, onCreate, onEdit, onDetails, onDelete, onCancelSubscription, onReactivateSubscription, onNotify }) => {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("All statuses");
    const [planFilter, setPlanFilter] = useState("All plans");
    const [sort, setSort] = useState("renewal");
    const activeCount = subscriptions.filter((subscription) => subscription.status === "Active").length;
    const trialCount = subscriptions.filter((subscription) => subscription.status === "Trial").length;
    const pastDueCount = subscriptions.filter((subscription) => subscription.status === "Past due").length;
    const recurring = subscriptions.filter((subscription) => subscription.status === "Active").reduce((total, subscription) => {
        const plan = plans.find((item) => item.id === subscription.planId);
        return total + (plan ? plan.interval === "Yearly" ? plan.amount / 12 : plan.amount : 0);
    }, 0);

    const filtered = useMemo(() => subscriptions.filter((subscription) => {
        const customer = customers.find((item) => item.id === subscription.customerId);
        const plan = plans.find((item) => item.id === subscription.planId);
        const matchesQuery = `${getSubscriptionReference(subscription)} ${customer?.company || ""} ${customer?.email || ""} ${plan?.name || ""}`.toLowerCase().includes(query.trim().toLowerCase());
        return matchesQuery && (status === "All statuses" || subscription.status === status) && (planFilter === "All plans" || subscription.planId === planFilter);
    }).toSorted((a, b) => sort === "amount"
        ? (plans.find((plan) => plan.id === b.planId)?.amount || 0) - (plans.find((plan) => plan.id === a.planId)?.amount || 0)
        : a.renews.localeCompare(b.renews)), [customers, plans, planFilter, query, sort, status, subscriptions]);

    const exportList = () => {
        const rows = [["Subscription", "Customer", "Plan", "Status", "Next renewal", "Price", "Interval"]];
        filtered.forEach((subscription) => {
            const customer = customers.find((item) => item.id === subscription.customerId);
            const plan = plans.find((item) => item.id === subscription.planId);
            rows.push([getSubscriptionReference(subscription), customer?.company, plan?.name, subscription.status, subscription.renews, plan?.amount, plan?.interval]);
        });
        if (downloadCsv(rows, "ledgerline-subscriptions.csv")) onNotify(`${filtered.length} subscriptions exported`);
    };

    const clearFilters = () => { setQuery(""); setStatus("All statuses"); setPlanFilter("All plans"); };
    const hasFilters = query || status !== "All statuses" || planFilter !== "All plans";

    return (
        <div className={styles.subscriptionsPage}>
            <PageHeading title="Subscriptions" description="Keep customer billing terms, renewals, and account status organized." actions={<><button className={styles.secondaryButton} type="button" onClick={exportList}><FiDownload aria-hidden="true" /> Export list</button><button className={styles.primaryButton} type="button" onClick={() => onCreate("subscription")}><FiPlus aria-hidden="true" /> New subscription</button></>} />

            <section className={styles.summaryGrid} aria-label="Subscription totals">
                <MetricCard label="Active subscriptions" value={activeCount} detail="Currently renewing" icon={FiRepeat} />
                <MetricCard label="Monthly recurring value" value={formatCurrency(Math.round(recurring))} detail="From active plans" icon={FiCalendar} tone="blue" />
                <MetricCard label="Trials" value={trialCount} detail="Evaluation periods" icon={FiUsers} tone="green" />
                <MetricCard label="Past due" value={pastDueCount} detail="Review payment status" icon={FiMoreHorizontal} tone="orange" />
            </section>

            <section className={styles.listPanel}>
                <div className={styles.listHeading}><div><h2>Subscription register</h2><p>{filtered.length} of {subscriptions.length} accounts</p></div><span className={styles.legend}><i /> Recurring accounts</span></div>
                <div className={styles.toolbar}>
                    <label className={styles.searchBox}><FiSearch aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer or subscription" aria-label="Search subscriptions" /></label>
                    <label className={styles.selectBox}><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Active</option><option>Past due</option><option>Trial</option><option>Canceled</option></select></label>
                    <label className={styles.selectBox}><span>Plan</span><select value={planFilter} onChange={(event) => setPlanFilter(event.target.value)}><option>All plans</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>
                    <label className={styles.selectBox}><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="renewal">Next renewal</option><option value="amount">Highest price</option></select></label>
                    {hasFilters && <button className={styles.clearButton} type="button" onClick={clearFilters}>Clear filters</button>}
                </div>
                <div className={styles.tableScroll}>
                    <table>
                        <thead><tr><th>Subscription</th><th>Customer</th><th>Plan</th><th>Status</th><th>Next renewal</th><th>Price</th><th>Actions</th></tr></thead>
                        <tbody>{filtered.map((subscription) => {
                            const customer = customers.find((item) => item.id === subscription.customerId);
                            const plan = plans.find((item) => item.id === subscription.planId);
                            return <tr key={subscription.id}>
                                <td><button className={styles.recordLink} type="button" onClick={() => onDetails("subscription", subscription)}>{getSubscriptionReference(subscription)}</button><small>Started {formatDate(subscription.started, { month: "short", day: "numeric", year: "numeric" })}</small></td>
                                <td><button className={styles.customerCell} type="button" onClick={() => customer && onDetails("customer", customer)}><span className={`${styles.avatar} ${styles[customer?.color || "lilac"]}`}>{customer?.initials || "??"}</span><span><strong>{customer?.company || "Customer removed"}</strong><small>{customer?.name || "Billing account"}</small></span></button></td>
                                <td><strong className={styles.planName}>{plan?.name || "Plan removed"}</strong><small>{plan?.interval || "Billing term"}</small></td>
                                <td><StatusBadge status={subscription.status} /></td>
                                <td><span className={styles.renewalDate}>{subscription.renews ? formatDate(subscription.renews, { month: "short", day: "numeric", year: "numeric" }) : "No renewal"}</span></td>
                                <td><strong className={styles.price}>{formatCurrency(plan?.amount || 0)}</strong><small>/ {plan?.interval === "Yearly" ? "year" : "month"}</small></td>
                                <td><div className={styles.rowActions}>
                                    <button className={styles.iconButton} type="button" aria-label={`Edit ${getSubscriptionReference(subscription)}`} title="Edit" onClick={() => onEdit("subscription", subscription)}><FiEdit2 aria-hidden="true" /></button>
                                    {subscription.status === "Canceled" ? <button className={styles.textAction} type="button" onClick={() => onReactivateSubscription(subscription)}>Reactivate</button> : <button className={styles.textAction} type="button" onClick={() => onCancelSubscription(subscription)}>Cancel</button>}
                                    <button className={styles.iconButton} type="button" aria-label={`Delete ${getSubscriptionReference(subscription)}`} title="Delete" onClick={() => onDelete("subscription", subscription)}><FiTrash2 aria-hidden="true" /></button>
                                </div></td>
                            </tr>;
                        })}</tbody>
                    </table>
                    {!filtered.length && <div className={styles.emptyState}><span>No subscriptions found</span><p>Try changing your search or filters.</p>{hasFilters && <button type="button" onClick={clearFilters}>Clear filters</button>}</div>}
                </div>
                <div className={styles.tableFooter}><span>Subscription changes update the overview and revenue totals.</span><span>{filtered.length} records</span></div>
            </section>
        </div>
    );
};

export default SubscriptionsPage;
