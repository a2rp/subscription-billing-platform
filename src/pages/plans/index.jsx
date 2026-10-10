import { useMemo, useState } from "react";
import {
    FiArrowUpRight,
    FiCheck,
    FiDownload,
    FiEdit2,
    FiLayers,
    FiPlus,
    FiSearch,
    FiTrash2,
    FiUsers,
} from "react-icons/fi";
import MetricCard from "../../components/metricCard/index.jsx";
import PageHeading from "../../components/pageHeading/index.jsx";
import { formatCurrency } from "../../data.js";
import { downloadCsv } from "../../utils.js";
import styles from "./styles.module.css";

const PlansPage = ({
    plans,
    subscriptions,
    onCreate,
    onEdit,
    onDetails,
    onDelete,
    onNotify,
}) => {
    const [query, setQuery] = useState("");
    const [interval, setInterval] = useState("All intervals");
    const activeSubscriptions = subscriptions.filter(
        (subscription) => subscription.status === "Active",
    );
    const monthlyValue = activeSubscriptions.reduce((sum, subscription) => {
        const plan = plans.find((item) => item.id === subscription.planId);
        return (
            sum +
            (plan
                ? plan.interval === "Yearly"
                    ? plan.amount / 12
                    : plan.amount
                : 0)
        );
    }, 0);

    const filtered = useMemo(
        () =>
            plans
                .filter(
                    (plan) =>
                        `${plan.name} ${plan.description}`
                            .toLowerCase()
                            .includes(query.trim().toLowerCase()) &&
                        (interval === "All intervals" ||
                            plan.interval === interval),
                )
                .toSorted((a, b) => a.amount - b.amount),
        [interval, plans, query],
    );

    const exportPlans = () => {
        const rows = [
            [
                "Plan",
                "Description",
                "Price",
                "Interval",
                "Seats",
                "Trial days",
                "Active subscriptions",
            ],
        ];
        filtered.forEach((plan) =>
            rows.push([
                plan.name,
                plan.description,
                plan.amount,
                plan.interval,
                plan.seats,
                plan.trialDays,
                activeSubscriptions.filter((item) => item.planId === plan.id)
                    .length,
            ]),
        );
        if (downloadCsv(rows, "ledgerline-plans.csv"))
            onNotify(`${filtered.length} plans exported`);
    };

    return (
        <div className={styles.plansPage}>
            <PageHeading
                title="Plans"
                description="Shape your billing catalog and see how each tier is performing."
                actions={
                    <>
                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={exportPlans}
                        >
                            <FiDownload aria-hidden="true" /> Export catalog
                        </button>
                        <button
                            className={styles.primaryButton}
                            type="button"
                            onClick={() => onCreate("plan")}
                        >
                            <FiPlus aria-hidden="true" /> Create plan
                        </button>
                    </>
                }
            />

            <section
                className={styles.summaryGrid}
                aria-label="Plan catalog summary"
            >
                <MetricCard
                    label="Published plans"
                    value={plans.length}
                    detail="Available in this workspace"
                    icon={FiLayers}
                />
                <MetricCard
                    label="Active customers"
                    value={activeSubscriptions.length}
                    detail="Subscribed accounts"
                    icon={FiUsers}
                    tone="blue"
                />
                <MetricCard
                    label="Monthly plan value"
                    value={formatCurrency(Math.round(monthlyValue))}
                    detail="Normalized active revenue"
                    icon={FiCheck}
                    tone="green"
                />
            </section>

            <div className={styles.catalogHeading}>
                <div>
                    <h2>Plan catalog</h2>
                    <p>
                        Choose a plan to see included terms and linked accounts.
                    </p>
                </div>
                <div className={styles.catalogFilters}>
                    <label className={styles.searchBox}>
                        <FiSearch aria-hidden="true" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search plans"
                            aria-label="Search plans"
                        />
                    </label>
                    <label className={styles.selectBox}>
                        <span>Billing</span>
                        <select
                            value={interval}
                            onChange={(event) =>
                                setInterval(event.target.value)
                            }
                        >
                            <option>All intervals</option>
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select>
                    </label>
                </div>
            </div>

            <section
                className={styles.planGrid}
                aria-label="Subscription plans"
            >
                {filtered.map((plan) => {
                    const planSubscriptions = subscriptions.filter(
                        (subscription) => subscription.planId === plan.id,
                    );
                    const activeCount = planSubscriptions.filter(
                        (subscription) => subscription.status === "Active",
                    ).length;
                    const planRevenue = planSubscriptions
                        .filter(
                            (subscription) => subscription.status === "Active",
                        )
                        .reduce(
                            (sum) =>
                                sum +
                                (plan.interval === "Yearly"
                                    ? plan.amount / 12
                                    : plan.amount),
                            0,
                        );
                    return (
                        <article
                            className={`${styles.planCard} ${styles[plan.color || "violet"]}`}
                            key={plan.id}
                        >
                            <div className={styles.planTop}>
                                <span className={styles.planIcon}>
                                    <FiLayers aria-hidden="true" />
                                </span>
                                <button
                                    className={styles.moreButton}
                                    type="button"
                                    aria-label={`View ${plan.name} plan details`}
                                    onClick={() => onDetails("plan", plan)}
                                >
                                    <FiArrowUpRight aria-hidden="true" />
                                </button>
                            </div>
                            <button
                                className={styles.planName}
                                type="button"
                                onClick={() => onDetails("plan", plan)}
                            >
                                {plan.name}
                            </button>
                            <p className={styles.planDescription}>
                                {plan.description}
                            </p>
                            <div className={styles.priceLine}>
                                <strong>{formatCurrency(plan.amount)}</strong>
                                <span>/ {plan.interval.toLowerCase()}</span>
                            </div>
                            <div className={styles.planRules}>
                                <span>
                                    <FiUsers aria-hidden="true" /> {plan.seats}{" "}
                                    seats included
                                </span>
                                <span>
                                    <FiCheck aria-hidden="true" />{" "}
                                    {plan.trialDays
                                        ? `${plan.trialDays}-day trial`
                                        : "No trial period"}
                                </span>
                            </div>
                            <div className={styles.planStats}>
                                <div>
                                    <small>Active accounts</small>
                                    <strong>{activeCount}</strong>
                                </div>
                                <div>
                                    <small>Current monthly value</small>
                                    <strong>
                                        {formatCurrency(
                                            Math.round(planRevenue),
                                        )}
                                    </strong>
                                </div>
                            </div>
                            <div className={styles.planActions}>
                                <button
                                    type="button"
                                    onClick={() => onEdit("plan", plan)}
                                >
                                    <FiEdit2 aria-hidden="true" /> Edit plan
                                </button>
                                <button
                                    className={styles.deleteButton}
                                    type="button"
                                    aria-label={`Delete ${plan.name} plan`}
                                    title="Delete plan"
                                    onClick={() => onDelete("plan", plan)}
                                >
                                    <FiTrash2 aria-hidden="true" />
                                </button>
                            </div>
                        </article>
                    );
                })}
                {!filtered.length && (
                    <div className={styles.emptyState}>
                        <FiLayers aria-hidden="true" />
                        <strong>No plans match those filters</strong>
                        <span>Try another search or billing interval.</span>
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                setInterval("All intervals");
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </section>
            <p className={styles.catalogFootnote}>
                Plan edits affect the catalog preview. Existing subscription
                prices update with the selected plan in this demo.
            </p>
        </div>
    );
};

export default PlansPage;
