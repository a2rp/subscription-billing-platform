import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiFileText, FiLayers, FiMenu, FiPlus, FiSearch, FiUsers, FiRepeat, FiGithub } from "react-icons/fi";
import styles from "./styles.module.css";

const pageNames = {
    "/": "Overview",
    "/subscriptions": "Subscriptions",
    "/invoices": "Invoices",
    "/customers": "Customers",
    "/plans": "Plans",
    "/reports": "Revenue report",
};

const Header = ({ customers, plans, subscriptions, invoices, onCreate, onOpenDetails, onMenuOpen }) => {
    const [query, setQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const rootRef = useRef(null);
    const searchInputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const pageName = pageNames[location.pathname] || "Workspace";

    const results = useMemo(() => {
        const allRecords = [
            ...customers.map((record) => ({ entity: "customer", record, path: "/customers", title: record.company, detail: record.email })),
            ...subscriptions.map((record) => ({ entity: "subscription", record, path: "/subscriptions", title: record.id.replace("sub-", "SUB-"), detail: customers.find((customer) => customer.id === record.customerId)?.company || "Subscription" })),
            ...invoices.map((record) => ({ entity: "invoice", record, path: "/invoices", title: record.id, detail: customers.find((customer) => customer.id === record.customerId)?.company || "Invoice" })),
            ...plans.map((record) => ({ entity: "plan", record, path: "/plans", title: record.name, detail: `${record.interval} · $${record.amount}` })),
        ];
        const normalized = query.trim().toLowerCase();
        return normalized ? allRecords.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalized)).slice(0, 7) : [];
    }, [customers, invoices, plans, query, subscriptions]);

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (rootRef.current?.contains(event.target)) return;
            setSearchOpen(false);
            setCreateOpen(false);
        };
        const handleKeydown = (event) => {
            if (event.key === "Escape") {
                setSearchOpen(false);
                setCreateOpen(false);
            }
            if (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                searchInputRef.current?.focus();
                setSearchOpen(true);
                setCreateOpen(false);
            }
        };
        document.addEventListener("pointerdown", closeOnOutsideClick);
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideClick);
            document.removeEventListener("keydown", handleKeydown);
        };
    }, []);

    const chooseResult = (result) => {
        setQuery("");
        setSearchOpen(false);
        navigate(result.path);
        onOpenDetails(result.entity, result.record);
    };

    const createItems = [
        { entity: "subscription", label: "Subscription", icon: FiRepeat },
        { entity: "invoice", label: "Invoice", icon: FiFileText },
        { entity: "customer", label: "Customer", icon: FiUsers },
        { entity: "plan", label: "Plan", icon: FiLayers },
    ];

    return (
        <header className={styles.header} ref={rootRef}>
            <div className={styles.headerLeft}>
                <button className={styles.menuButton} type="button" aria-label="Open navigation" onClick={onMenuOpen}>
                    <FiMenu aria-hidden="true" />
                </button>
                <div className={styles.breadcrumb}>
                    <span>Workspace</span><span className={styles.separator}>/</span><strong>{pageName}</strong>
                </div>
            </div>
            <div className={styles.headerActions}>
                <div className={styles.searchWrap}>
                    <label className={styles.searchBox}>
                        <FiSearch aria-hidden="true" />
                        <input
                            ref={searchInputRef}
                            value={query}
                            onFocus={() => setSearchOpen(true)}
                            onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
                            onKeyDown={(event) => { if (event.key === "Enter" && results[0]) chooseResult(results[0]); }}
                            placeholder="Search billing"
                            aria-label="Search customers, plans, subscriptions, and invoices"
                            aria-expanded={searchOpen && Boolean(query)}
                        />
                        <kbd>Ctrl K</kbd>
                    </label>
                    {searchOpen && query && (
                        <div className={styles.searchResults} role="listbox" aria-label="Search results">
                            {results.length ? results.map((result) => (
                                <button key={`${result.entity}-${result.record.id}`} type="button" role="option" onClick={() => chooseResult(result)}>
                                    <span className={styles.resultIcon}><FiSearch aria-hidden="true" /></span>
                                    <span><strong>{result.title}</strong><small>{result.detail}</small></span>
                                    <small className={styles.resultType}>{result.entity}</small>
                                </button>
                            )) : <p className={styles.noResults}>No billing records match “{query}”.</p>}
                        </div>
                    )}
                </div>
                <div className={styles.createWrap}>
                    <button
                        className={styles.createButton}
                        type="button"
                        aria-expanded={createOpen}
                        aria-haspopup="menu"
                        onClick={() => { setCreateOpen((open) => !open); setSearchOpen(false); }}
                    >
                        <FiPlus aria-hidden="true" /><span>Create</span><FiChevronDown aria-hidden="true" className={styles.chevron} />
                    </button>
                    {createOpen && (
                        <div className={styles.createMenu} role="menu" aria-label="Create billing record">
                            {createItems.map(({ entity, label, icon: Icon }) => (
                                <button key={entity} type="button" role="menuitem" onClick={() => { setCreateOpen(false); onCreate(entity); }}>
                                    <Icon aria-hidden="true" /><span>New {label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <a className={styles.repository} href="https://github.com/a2rp/subscription-billing-platform" target="_blank" rel="noreferrer">
                    <FiGithub aria-hidden="true" /><span>Repository</span>
                </a>
            </div>
        </header>
    );
};

export default Header;
