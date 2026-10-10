import { useMemo, useState } from "react";
import { FiArrowUpRight, FiCreditCard, FiDownload, FiFileText, FiMail, FiMapPin, FiPlus, FiSearch, FiTrash2, FiUsers, FiEdit2, FiRepeat } from "react-icons/fi";
import PageHeading from "../../components/pageHeading/index.jsx";
import StatusBadge from "../../components/statusBadge/index.jsx";
import { formatCurrency, formatDate } from "../../data.js";
import { downloadCsv, getInvoiceReference, getSubscriptionReference } from "../../utils.js";
import styles from "./styles.module.css";

const CustomersPage = ({ customers, plans, subscriptions, invoices, onCreate, onEdit, onDelete, onDetails, onMarkInvoicePaid, onNotify }) => {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(customers[0]?.id || "");
    const filtered = useMemo(() => customers.filter((customer) => `${customer.company} ${customer.name} ${customer.email}`.toLowerCase().includes(query.trim().toLowerCase())).toSorted((a, b) => a.company.localeCompare(b.company)), [customers, query]);
    const selected = filtered.find((customer) => customer.id === selectedId) || filtered[0] || customers.find((customer) => customer.id === selectedId) || customers[0];
    const customerSubscriptions = selected ? subscriptions.filter((subscription) => subscription.customerId === selected.id).toSorted((a, b) => b.started.localeCompare(a.started)) : [];
    const customerInvoices = selected ? invoices.filter((invoice) => invoice.customerId === selected.id).toSorted((a, b) => b.issued.localeCompare(a.issued)).slice(0, 5) : [];
    const currentBalance = customerInvoices.filter((invoice) => invoice.status === "Open" || invoice.status === "Overdue").reduce((total, invoice) => total + invoice.amount, 0);
    const activeCount = customerSubscriptions.filter((item) => item.status === "Active").length;

    const exportCustomers = () => {
        const rows = [["Company", "Contact", "Email", "Location", "Joined", "Subscriptions", "Open balance"]];
        filtered.forEach((customer) => {
            const relatedSubscriptions = subscriptions.filter((item) => item.customerId === customer.id);
            const balance = invoices.filter((item) => item.customerId === customer.id && (item.status === "Open" || item.status === "Overdue")).reduce((sum, item) => sum + item.amount, 0);
            rows.push([customer.company, customer.name, customer.email, customer.location, customer.joined, relatedSubscriptions.length, balance]);
        });
        if (downloadCsv(rows, "ledgerline-customers.csv")) onNotify(`${filtered.length} customer accounts exported`);
    };

    return (
        <div className={styles.customersPage}>
            <PageHeading title="Customers" description="Customer accounts, contact details, and their billing history." actions={<><button className={styles.secondaryButton} type="button" onClick={exportCustomers}><FiDownload aria-hidden="true" /> Export</button><button className={styles.primaryButton} type="button" onClick={() => onCreate("customer")}><FiPlus aria-hidden="true" /> Add customer</button></>} />

            <section className={styles.directory}>
                <aside className={styles.customerIndex} aria-label="Customer directory">
                    <div className={styles.indexHeader}><div><h2>Account directory</h2><p>{filtered.length} customers</p></div><span className={styles.indexCount}>{customers.length}</span></div>
                    <label className={styles.searchBox}><FiSearch aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a customer" aria-label="Search customers" /></label>
                    <div className={styles.customerList}>
                        {filtered.map((customer) => {
                            const recordCount = subscriptions.filter((item) => item.customerId === customer.id).length;
                            return <button className={`${styles.customerRow} ${selected?.id === customer.id ? styles.selected : ""}`} key={customer.id} type="button" onClick={() => setSelectedId(customer.id)}>
                                <span className={`${styles.avatar} ${styles[customer.color || "lilac"]}`}>{customer.initials}</span>
                                <span className={styles.customerCopy}><strong>{customer.company}</strong><small>{customer.name}</small></span>
                                <span className={styles.subscriptionCount}>{recordCount}</span>
                            </button>;
                        })}
                        {!filtered.length && <div className={styles.emptyIndex}><strong>No customer matches</strong><button type="button" onClick={() => setQuery("")}>Clear search</button></div>}
                    </div>
                    <button className={styles.addFromIndex} type="button" onClick={() => onCreate("customer")}><FiPlus aria-hidden="true" /> Add customer</button>
                </aside>

                {selected ? <section className={styles.profilePanel} aria-label={`${selected.company} billing profile`}>
                    <div className={styles.profileBanner}>
                        <div className={styles.profileHead}>
                            <span className={`${styles.largeAvatar} ${styles[selected.color || "lilac"]}`}>{selected.initials}</span>
                            <div className={styles.profileTitle}><h2>{selected.company}</h2><p>{selected.name} · Customer since {formatDate(selected.joined, { month: "short", year: "numeric" })}</p></div>
                            <div className={styles.profileActions}><button className={styles.iconButton} type="button" aria-label={`Edit ${selected.company}`} title="Edit customer" onClick={() => onEdit("customer", selected)}><FiEdit2 aria-hidden="true" /></button><button className={styles.iconButton} type="button" aria-label={`Delete ${selected.company}`} title="Delete customer" onClick={() => onDelete("customer", selected)}><FiTrash2 aria-hidden="true" /></button></div>
                        </div>
                        <div className={styles.profileStats}>
                            <div><small>Active subscriptions</small><strong>{activeCount}</strong></div>
                            <div><small>Open balance</small><strong>{formatCurrency(currentBalance)}</strong></div>
                            <div><small>Billing records</small><strong>{customerInvoices.length}</strong></div>
                        </div>
                    </div>

                    <div className={styles.contactStrip}>
                        <span><FiMail aria-hidden="true" /> {selected.email}</span>
                        <span><FiMapPin aria-hidden="true" /> {selected.location}</span>
                        <span><FiUsers aria-hidden="true" /> Contact: {selected.name}</span>
                    </div>

                    <div className={styles.profileContent}>
                        <section className={styles.accountSection}>
                            <div className={styles.sectionHeading}><div><h3>Subscriptions</h3><p>Current and past billing terms</p></div><button className={styles.smallPrimary} type="button" onClick={() => onCreate("subscription", { customerId: selected.id })}><FiPlus aria-hidden="true" /> Add subscription</button></div>
                            <div className={styles.subscriptionList}>
                                {customerSubscriptions.map((subscription) => {
                                    const plan = plans.find((item) => item.id === subscription.planId);
                                    return <button className={styles.subscriptionItem} key={subscription.id} type="button" onClick={() => onDetails("subscription", subscription)}>
                                        <span className={styles.subscriptionIcon}><FiRepeat aria-hidden="true" /></span>
                                        <span className={styles.subscriptionInfo}><strong>{plan?.name || "Plan removed"}</strong><small>{getSubscriptionReference(subscription)} · Renews {formatDate(subscription.renews)}</small></span>
                                        <span className={styles.subscriptionPrice}>{formatCurrency(plan?.amount || 0)}<small> / {plan?.interval === "Yearly" ? "year" : "month"}</small></span>
                                        <StatusBadge status={subscription.status} /><FiArrowUpRight className={styles.openIcon} aria-hidden="true" />
                                    </button>;
                                })}
                                {!customerSubscriptions.length && <div className={styles.emptyMessage}><FiRepeat aria-hidden="true" /><span>No subscriptions yet</span><button type="button" onClick={() => onCreate("subscription", { customerId: selected.id })}>Add the first subscription</button></div>}
                            </div>
                        </section>

                        <section className={styles.accountSection}>
                            <div className={styles.sectionHeading}><div><h3>Recent invoices</h3><p>Most recent billing activity</p></div><button className={styles.textButton} type="button" onClick={() => onCreate("invoice", { customerId: selected.id })}><FiPlus aria-hidden="true" /> New invoice</button></div>
                            <div className={styles.invoiceList}>
                                {customerInvoices.map((invoice) => <div className={styles.invoiceItem} key={invoice.id}>
                                    <button className={styles.invoiceCopy} type="button" onClick={() => onDetails("invoice", invoice)}><span className={styles.invoiceIcon}><FiFileText aria-hidden="true" /></span><span><strong>{getInvoiceReference(invoice)}</strong><small>{invoice.description} · {formatDate(invoice.issued, { month: "short", day: "numeric" })}</small></span></button>
                                    <StatusBadge status={invoice.status} />
                                    <strong className={styles.invoiceAmount}>{formatCurrency(invoice.amount)}</strong>
                                    {invoice.status === "Open" || invoice.status === "Overdue" ? <button className={styles.payButton} type="button" onClick={() => onMarkInvoicePaid(invoice)}><FiCreditCard aria-hidden="true" /> Mark paid</button> : <span className={styles.paidDate}>{invoice.status === "Paid" ? "Settled" : "Draft"}</span>}
                                </div>)}
                                {!customerInvoices.length && <div className={styles.emptyMessage}><FiFileText aria-hidden="true" /><span>No invoices on file</span><button type="button" onClick={() => onCreate("invoice", { customerId: selected.id })}>Create an invoice</button></div>}
                            </div>
                        </section>
                    </div>
                </section> : <section className={styles.noCustomer}><FiUsers aria-hidden="true" /><h2>No customer records yet</h2><p>Add a customer to begin managing billing details.</p><button className={styles.primaryButton} type="button" onClick={() => onCreate("customer")}><FiPlus aria-hidden="true" /> Add customer</button></section>}
            </section>
        </div>
    );
};

export default CustomersPage;
