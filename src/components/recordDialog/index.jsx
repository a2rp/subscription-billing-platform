import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowUpRight, FiCalendar, FiCreditCard, FiFileText, FiLayers, FiMail, FiMapPin, FiRepeat, FiUsers, FiX } from "react-icons/fi";
import { formatCurrency, formatDate } from "../../data.js";
import styles from "./styles.module.css";

const today = () => {
    const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
};

const nextWeek = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const getInitialValues = (entity, record, customers, plans) => {
    if (record) return { ...record };
    const customerId = customers[0]?.id || "";
    const planId = plans[0]?.id || "";
    if (entity === "customer") return { name: "", company: "", email: "", location: "", joined: today() };
    if (entity === "plan") return { name: "", description: "", amount: 89, interval: "Monthly", trialDays: 14, seats: 10, color: "violet" };
    if (entity === "subscription") return { customerId, planId, status: "Active", started: today(), renews: nextWeek(), paymentMethod: "Visa ···· 4242" };
    return { customerId, subscriptionId: "", number: "", description: "", amount: 89, issued: today(), due: nextWeek(), status: "Open" };
};

const getFields = (entity, customers, plans, subscriptions) => {
    if (entity === "customer") return [
        { name: "name", label: "Contact name", required: true },
        { name: "company", label: "Company", required: true },
        { name: "email", label: "Billing email", type: "email", required: true },
        { name: "location", label: "Location", required: true },
        { name: "joined", label: "Customer since", type: "date", required: true },
    ];
    if (entity === "plan") return [
        { name: "name", label: "Plan name", required: true },
        { name: "description", label: "Description", type: "textarea", required: true, wide: true },
        { name: "amount", label: "Price", type: "number", prefix: "$", min: 1, required: true },
        { name: "interval", label: "Billing interval", type: "select", options: ["Monthly", "Yearly"] },
        { name: "trialDays", label: "Trial days", type: "number", min: 0 },
        { name: "seats", label: "Included seats", type: "number", min: 1 },
    ];
    if (entity === "subscription") return [
        { name: "customerId", label: "Customer", type: "select", options: customers.map((customer) => ({ value: customer.id, label: customer.company })), required: true },
        { name: "planId", label: "Plan", type: "select", options: plans.map((plan) => ({ value: plan.id, label: `${plan.name} · ${formatCurrency(plan.amount)} / ${plan.interval.toLowerCase()}` })), required: true },
        { name: "status", label: "Status", type: "select", options: ["Active", "Past due", "Trial", "Canceled"] },
        { name: "started", label: "Start date", type: "date", required: true },
        { name: "renews", label: "Next renewal", type: "date", required: true },
        { name: "paymentMethod", label: "Payment method", required: true, wide: true },
    ];
    const customerOptions = customers.map((customer) => ({ value: customer.id, label: customer.company }));
    const subscriptionOptions = [{ value: "", label: "No subscription linked" }, ...subscriptions.map((subscription) => ({ value: subscription.id, label: `${subscription.id.replace("sub-", "SUB-")} · ${customers.find((customer) => customer.id === subscription.customerId)?.company || "Customer"}` }))];
    return [
        { name: "customerId", label: "Customer", type: "select", options: customerOptions, required: true },
        { name: "subscriptionId", label: "Subscription", type: "select", options: subscriptionOptions },
        { name: "description", label: "Invoice description", required: true, wide: true },
        { name: "amount", label: "Amount due", type: "number", prefix: "$", min: 0, required: true },
        { name: "status", label: "Status", type: "select", options: ["Draft", "Open", "Overdue", "Paid"] },
        { name: "issued", label: "Issue date", type: "date", required: true },
        { name: "due", label: "Due date", type: "date", required: true },
    ];
};

const getEntityLabel = (entity) => ({ customer: "customer", plan: "plan", subscription: "subscription", invoice: "invoice" }[entity] || "record");

const RecordDialog = ({ dialog, customers, plans, subscriptions, invoices, onClose, onSave, onEdit, onDelete }) => {
    const { entity, mode, record } = dialog;
    const [values, setValues] = useState(() => getInitialValues(entity, dialog.initialValues || record, customers, plans));
    const [errors, setErrors] = useState({});
    const firstControlRef = useRef(null);
    const dialogRef = useRef(null);
    const fields = useMemo(() => getFields(entity, customers, plans, subscriptions), [customers, entity, plans, subscriptions]);
    const entityLabel = getEntityLabel(entity);
    const isDetails = mode === "details";
    const title = isDetails ? "Billing record" : `${mode === "edit" ? "Edit" : "New"} ${entityLabel}`;
    const customer = entity === "customer" ? record : customers.find((item) => item.id === record?.customerId);
    const plan = entity === "plan" ? record : plans.find((item) => item.id === record?.planId);

    useEffect(() => {
        const previous = document.activeElement;
        firstControlRef.current?.focus();
        const handleKeydown = (event) => {
            if (event.key === "Escape") onClose();
            if (event.key !== "Tab") return;
            const controls = dialogRef.current?.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]");
            if (!controls?.length) return;
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("keydown", handleKeydown);
            previous?.focus?.();
        };
    }, [onClose]);

    const updateValue = (name, value) => {
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: "" }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const nextErrors = {};
        fields.forEach((field) => {
            const value = values[field.name];
            if (field.required && !String(value ?? "").trim()) nextErrors[field.name] = `${field.label} is required.`;
            if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) nextErrors[field.name] = "Enter a valid email address.";
            if (field.type === "number" && value !== "" && Number(value) < Number(field.min || 0)) nextErrors[field.name] = `${field.label} must be at least ${field.min || 0}.`;
        });
        if (entity === "subscription" && values.started && values.renews && values.renews < values.started) nextErrors.renews = "Renewal cannot be before the start date.";
        if (entity === "invoice" && values.issued && values.due && values.due < values.issued) nextErrors.due = "Due date cannot be before the issue date.";
        if (entity === "customer" && customers.some((item) => item.email.toLowerCase() === values.email?.toLowerCase() && item.id !== record?.id)) nextErrors.email = "A customer with this email already exists.";
        if (entity === "plan" && plans.some((item) => item.name.toLowerCase() === values.name?.toLowerCase() && item.id !== record?.id)) nextErrors.name = "A plan with this name already exists.";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        const nextValues = { ...values };
        if (entity === "plan") {
            nextValues.amount = Number(values.amount);
            nextValues.trialDays = Number(values.trialDays || 0);
            nextValues.seats = Number(values.seats || 1);
        }
        if (entity === "invoice") nextValues.amount = Number(values.amount);
        if (entity === "customer") nextValues.initials = values.company.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
        onSave(entity, nextValues);
    };

    const details = () => {
        if (entity === "customer") {
            const customerSubscriptions = subscriptions.filter((item) => item.customerId === record.id);
            const customerInvoices = invoices.filter((item) => item.customerId === record.id);
            return [
                [FiUsers, "Contact", record.name], [FiMail, "Billing email", record.email], [FiMapPin, "Location", record.location], [FiCalendar, "Customer since", formatDate(record.joined)],
                [FiRepeat, "Subscriptions", `${customerSubscriptions.length} total · ${customerSubscriptions.filter((item) => item.status === "Active").length} active`],
                [FiFileText, "Invoices", `${customerInvoices.length} billing records`],
            ];
        }
        if (entity === "plan") {
            return [[FiLayers, "Price", `${formatCurrency(record.amount)} / ${record.interval.toLowerCase()}`], [FiUsers, "Included seats", `${record.seats} seats`], [FiCalendar, "Trial period", `${record.trialDays} days`], [FiRepeat, "Subscriptions", `${subscriptions.filter((item) => item.planId === record.id).length} linked subscriptions`]];
        }
        if (entity === "subscription") {
            return [[FiUsers, "Customer", customer?.company || "Customer removed"], [FiLayers, "Plan", plan?.name || "Plan removed"], [FiCreditCard, "Payment method", record.paymentMethod], [FiCalendar, "Started", formatDate(record.started)], [FiRepeat, "Next renewal", formatDate(record.renews)], [FiFileText, "Invoices", `${invoices.filter((item) => item.subscriptionId === record.id).length} linked invoices`]];
        }
        return [[FiUsers, "Customer", customer?.company || "Customer removed"], [FiFileText, "Description", record.description], [FiCalendar, "Issued", formatDate(record.issued)], [FiCalendar, "Due date", formatDate(record.due)], [FiCreditCard, "Amount", formatCurrency(record.amount)]];
    };

    const recordTitle = entity === "customer" ? record.company : entity === "plan" ? record.name : entity === "subscription" ? record.id.replace("sub-", "SUB-") : record.number || record.id;

    return (
        <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <section className={`${styles.dialog} ${isDetails ? styles.detailDialog : ""}`} role="dialog" aria-modal="true" aria-labelledby="record-dialog-title" ref={dialogRef}>
                <div className={styles.dialogHeader}>
                    <div className={styles.titleBlock}>
                        <span className={styles.titleIcon} aria-hidden="true">{entity === "customer" ? <FiUsers /> : entity === "plan" ? <FiLayers /> : entity === "subscription" ? <FiRepeat /> : <FiFileText />}</span>
                        <div><h2 id="record-dialog-title">{title}</h2><p>{isDetails ? recordTitle : `Add billing details for this ${entityLabel}.`}</p></div>
                    </div>
                    <button className={styles.closeButton} ref={isDetails ? firstControlRef : undefined} type="button" aria-label="Close dialog" onClick={onClose}><FiX aria-hidden="true" /></button>
                </div>

                {isDetails ? (
                    <>
                        <div className={styles.detailTop}>
                            <span className={`${styles.status} ${styles[(record.status || "active").toLowerCase().replaceAll(" ", "-")] || ""}`}>{record.status || "Active"}</span>
                            {entity === "customer" && <strong className={styles.detailName}>{record.name}</strong>}
                            {entity === "plan" && <strong className={styles.detailName}>{record.description}</strong>}
                            {entity === "subscription" && <strong className={styles.detailName}>{formatCurrency(plan?.amount || 0)} / {plan?.interval?.toLowerCase() || "month"}</strong>}
                            {entity === "invoice" && <strong className={styles.detailName}>{formatCurrency(record.amount)}</strong>}
                        </div>
                        <div className={styles.detailGrid}>
                            {details().map(([Icon, label, value]) => <div className={styles.detailItem} key={label}><span className={styles.detailIcon}><Icon aria-hidden="true" /></span><span><small>{label}</small><strong>{value}</strong></span></div>)}
                        </div>
                        <div className={styles.dialogFooter}>
                            <button className={styles.deleteButton} type="button" onClick={() => onDelete(entity, record)}>Delete</button>
                            <div className={styles.footerActions}><button className={styles.secondaryButton} type="button" onClick={onClose}>Close</button><button className={styles.primaryButton} type="button" onClick={() => onEdit(entity, record)}>Edit details <FiArrowUpRight aria-hidden="true" /></button></div>
                        </div>
                    </>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        <div className={styles.fields}>
                            {fields.map((field, index) => (
                                <label className={`${styles.field} ${field.wide ? styles.wide : ""}`} key={field.name}>
                                    <span>{field.label}{field.required && <b aria-hidden="true"> *</b>}</span>
                                    {field.type === "textarea" ? (
                                        <textarea ref={index === 0 ? firstControlRef : undefined} rows="3" value={values[field.name] || ""} onChange={(event) => updateValue(field.name, event.target.value)} aria-invalid={Boolean(errors[field.name])} />
                                    ) : field.type === "select" ? (
                                        <select ref={index === 0 ? firstControlRef : undefined} value={values[field.name] ?? ""} onChange={(event) => updateValue(field.name, event.target.value)} aria-invalid={Boolean(errors[field.name])}>
                                            {field.options.map((option) => typeof option === "string" ? <option key={option} value={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                    ) : (
                                        <span className={`${styles.inputWrap} ${field.prefix ? styles.withPrefix : ""}`}>
                                            {field.prefix && <span className={styles.prefix}>{field.prefix}</span>}
                                            <input
                                                ref={index === 0 ? firstControlRef : undefined}
                                                type={field.type || "text"}
                                                min={field.min}
                                                step={field.type === "number" ? "1" : undefined}
                                                value={values[field.name] ?? ""}
                                                onChange={(event) => updateValue(field.name, event.target.value)}
                                                aria-invalid={Boolean(errors[field.name])}
                                            />
                                        </span>
                                    )}
                                    {errors[field.name] && <small className={styles.errorText}>{errors[field.name]}</small>}
                                </label>
                            ))}
                        </div>
                        <div className={styles.dialogFooter}>
                            <span className={styles.requiredHint}>Fields marked * are required</span>
                            <div className={styles.footerActions}><button className={styles.secondaryButton} type="button" onClick={onClose}>Cancel</button><button className={styles.primaryButton} type="submit">{mode === "edit" ? "Save changes" : `Create ${entityLabel}`}</button></div>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
};

export default RecordDialog;
