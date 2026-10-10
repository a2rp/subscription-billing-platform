import { useCallback, useMemo, useState } from "react";
import AppRoutes from "./AppRoutes.jsx";
import ConfirmDialog from "./components/confirmDialog/index.jsx";
import Footer from "./components/footer/index.jsx";
import Header from "./components/header/index.jsx";
import RecordDialog from "./components/recordDialog/index.jsx";
import ScrollToTop from "./components/scrollToTop/index.jsx";
import Sidebar from "./components/sidebar/index.jsx";
import Toast from "./components/toast/index.jsx";
import {
    initialCustomers,
    initialInvoices,
    initialPlans,
    initialSubscriptions,
    makeId,
} from "./data.js";
import styles from "./App.module.css";

const App = () => {
    const [customers, setCustomers] = useState(initialCustomers);
    const [plans, setPlans] = useState(initialPlans);
    const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
    const [invoices, setInvoices] = useState(initialInvoices);
    const [dialog, setDialog] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [toast, setToast] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const notify = useCallback((message, tone = "success") => {
        setToast({ id: Date.now(), message, tone });
    }, []);

    const openCreate = useCallback(
        (entity, initialValues) =>
            setDialog({ entity, mode: "create", initialValues }),
        [],
    );
    const openEdit = useCallback(
        (entity, record) => setDialog({ entity, mode: "edit", record }),
        [],
    );
    const openDetails = useCallback(
        (entity, record) => setDialog({ entity, mode: "details", record }),
        [],
    );
    const closeDialog = useCallback(() => setDialog(null), []);
    const closeConfirmation = useCallback(() => setConfirmation(null), []);
    const dismissToast = useCallback(() => setToast(null), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const openSidebar = useCallback(() => setSidebarOpen(true), []);

    const saveRecord = useCallback(
        (entity, values) => {
            const editing = Boolean(values.id);
            if (entity === "customer") {
                const next = {
                    ...values,
                    id: values.id || makeId("customer"),
                    color: values.color || "lilac",
                };
                setCustomers((current) =>
                    editing
                        ? current.map((item) =>
                              item.id === next.id ? next : item,
                          )
                        : [next, ...current],
                );
            }
            if (entity === "plan") {
                const next = {
                    ...values,
                    id: values.id || makeId("plan"),
                    color: values.color || "violet",
                };
                setPlans((current) =>
                    editing
                        ? current.map((item) =>
                              item.id === next.id ? next : item,
                          )
                        : [next, ...current],
                );
            }
            if (entity === "subscription") {
                const next = {
                    ...values,
                    id: values.id || `sub-${Date.now()}`,
                };
                setSubscriptions((current) =>
                    editing
                        ? current.map((item) =>
                              item.id === next.id ? next : item,
                          )
                        : [next, ...current],
                );
            }
            if (entity === "invoice") {
                const next = {
                    ...values,
                    id: values.id || makeId("invoice"),
                    number: values.number || `INV-${2100 + invoices.length}`,
                };
                setInvoices((current) =>
                    editing
                        ? current.map((item) =>
                              item.id === next.id ? next : item,
                          )
                        : [next, ...current],
                );
            }
            setDialog(null);
            notify(
                editing
                    ? `${entity[0].toUpperCase()}${entity.slice(1)} updated`
                    : `${entity[0].toUpperCase()}${entity.slice(1)} created`,
            );
        },
        [invoices.length, notify],
    );

    const requestDelete = useCallback(
        (entity, record) => {
            const customerSubscriptions = subscriptions.filter(
                (item) => item.customerId === record.id,
            );
            const customerInvoices = invoices.filter(
                (item) => item.customerId === record.id,
            );
            const planSubscriptions = subscriptions.filter(
                (item) => item.planId === record.id,
            );
            const planSubscriptionIds = planSubscriptions.map(
                (item) => item.id,
            );
            const planInvoices = invoices.filter((item) =>
                planSubscriptionIds.includes(item.subscriptionId),
            );
            const recordName =
                entity === "customer"
                    ? record.company
                    : entity === "plan"
                      ? record.name
                      : entity === "subscription"
                        ? record.id.replace("sub-", "SUB-")
                        : record.number || record.id;
            const message =
                entity === "customer"
                    ? `Delete ${recordName} and remove its linked subscription and invoice records?`
                    : entity === "plan"
                      ? `Delete the ${recordName} plan and remove its linked subscriptions and invoices?`
                      : entity === "subscription"
                        ? `Delete ${recordName}? Historical invoices will remain in the billing ledger.`
                        : `Delete invoice ${recordName} from the billing ledger?`;
            const note =
                entity === "customer"
                    ? `${customerSubscriptions.length} subscriptions and ${customerInvoices.length} invoices will be removed with this customer.`
                    : entity === "plan"
                      ? `${planSubscriptions.length} subscriptions and ${planInvoices.length} invoices will be removed with this plan.`
                      : "This action cannot be undone in this demo workspace.";
            setDialog(null);
            setConfirmation({
                action: "delete",
                entity,
                record,
                title: `Delete ${entity === "customer" ? "customer" : entity === "plan" ? "plan" : entity === "subscription" ? "subscription" : "invoice"}?`,
                message,
                note,
                confirmLabel: `Delete ${entity}`,
            });
        },
        [invoices, subscriptions],
    );

    const requestCancel = useCallback(
        (record) => {
            const customer = customers.find(
                (item) => item.id === record.customerId,
            );
            setConfirmation({
                action: "cancel-subscription",
                entity: "subscription",
                record,
                title: "Cancel this subscription?",
                message: `Billing for ${customer?.company || "this customer"} will stop at the end of the current term.`,
                note: "The subscription stays in the record list and can be reactivated later.",
                confirmLabel: "Cancel subscription",
            });
        },
        [customers],
    );

    const confirmAction = useCallback(() => {
        if (!confirmation) return;
        const { action, entity, record } = confirmation;
        if (action === "cancel-subscription") {
            setSubscriptions((current) =>
                current.map((item) =>
                    item.id === record.id
                        ? { ...item, status: "Canceled" }
                        : item,
                ),
            );
            notify("Subscription canceled");
        } else if (entity === "customer") {
            setCustomers((current) =>
                current.filter((item) => item.id !== record.id),
            );
            setSubscriptions((current) =>
                current.filter((item) => item.customerId !== record.id),
            );
            setInvoices((current) =>
                current.filter((item) => item.customerId !== record.id),
            );
            notify("Customer and linked billing records deleted");
        } else if (entity === "plan") {
            const linked = subscriptions
                .filter((item) => item.planId === record.id)
                .map((item) => item.id);
            setPlans((current) =>
                current.filter((item) => item.id !== record.id),
            );
            setSubscriptions((current) =>
                current.filter((item) => item.planId !== record.id),
            );
            setInvoices((current) =>
                current.filter((item) => !linked.includes(item.subscriptionId)),
            );
            notify("Plan and linked billing records deleted");
        } else if (entity === "subscription") {
            setSubscriptions((current) =>
                current.filter((item) => item.id !== record.id),
            );
            notify("Subscription deleted. Historical invoices were kept.");
        } else {
            setInvoices((current) =>
                current.filter((item) => item.id !== record.id),
            );
            notify("Invoice deleted");
        }
        setConfirmation(null);
    }, [confirmation, notify, subscriptions]);

    const markInvoicePaid = useCallback(
        (invoice) => {
            setInvoices((current) =>
                current.map((item) =>
                    item.id === invoice.id
                        ? {
                              ...item,
                              status: "Paid",
                              paidAt: new Date().toISOString().slice(0, 10),
                          }
                        : item,
                ),
            );
            setSubscriptions((current) =>
                current.map((item) =>
                    item.id === invoice.subscriptionId &&
                    item.status === "Past due"
                        ? { ...item, status: "Active" }
                        : item,
                ),
            );
            notify(`${invoice.number || invoice.id} marked as paid`);
        },
        [notify],
    );

    const logReminder = useCallback(
        (invoice) => {
            setInvoices((current) =>
                current.map((item) =>
                    item.id === invoice.id
                        ? {
                              ...item,
                              reminderSent: new Date()
                                  .toISOString()
                                  .slice(0, 10),
                          }
                        : item,
                ),
            );
            notify(
                `Payment reminder recorded for ${invoice.number || invoice.id}`,
                "info",
            );
        },
        [notify],
    );

    const reactivateSubscription = useCallback(
        (subscription) => {
            setSubscriptions((current) =>
                current.map((item) =>
                    item.id === subscription.id
                        ? { ...item, status: "Active" }
                        : item,
                ),
            );
            notify("Subscription reactivated");
        },
        [notify],
    );

    const counts = useMemo(
        () => ({
            overdueInvoices: invoices.filter(
                (invoice) => invoice.status === "Overdue",
            ).length,
        }),
        [invoices],
    );
    const sharedProps = {
        customers,
        plans,
        subscriptions,
        invoices,
        onCreate: openCreate,
        onEdit: openEdit,
        onDetails: openDetails,
        onDelete: requestDelete,
        onCancelSubscription: requestCancel,
        onReactivateSubscription: reactivateSubscription,
        onMarkInvoicePaid: markInvoicePaid,
        onLogReminder: logReminder,
        onNotify: notify,
    };

    return (
        <div className={styles.appShell}>
            <a className={styles.skipLink} href="#main-content">
                Skip to content
            </a>
            <ScrollToTop />
            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                pastDueCount={counts.overdueInvoices}
            />
            <Header
                customers={customers}
                plans={plans}
                subscriptions={subscriptions}
                invoices={invoices}
                onCreate={openCreate}
                onOpenDetails={openDetails}
                onMenuOpen={openSidebar}
            />
            <main className={styles.mainContent} id="main-content">
                <AppRoutes {...sharedProps} />
            </main>
            <Footer />
            {dialog && (
                <RecordDialog
                    key={`${dialog.entity}-${dialog.mode}-${dialog.record?.id || "new"}`}
                    dialog={dialog}
                    customers={customers}
                    plans={plans}
                    subscriptions={subscriptions}
                    invoices={invoices}
                    onClose={closeDialog}
                    onSave={saveRecord}
                    onEdit={openEdit}
                    onDelete={requestDelete}
                />
            )}
            <ConfirmDialog
                confirmation={confirmation}
                onCancel={closeConfirmation}
                onConfirm={confirmAction}
            />
            <Toast toast={toast} onDismiss={dismissToast} />
        </div>
    );
};

export default App;
