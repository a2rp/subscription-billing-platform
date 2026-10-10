import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiBarChart2, FiCreditCard, FiFileText, FiGrid, FiLayers, FiRepeat, FiUsers, FiX } from "react-icons/fi";
import styles from "./styles.module.css";

const navigation = [
    { label: "Overview", to: "/", icon: FiGrid, end: true },
    { label: "Subscriptions", to: "/subscriptions", icon: FiRepeat },
    { label: "Invoices", to: "/invoices", icon: FiFileText },
    { label: "Customers", to: "/customers", icon: FiUsers },
    { label: "Plans", to: "/plans", icon: FiLayers },
];

const Sidebar = ({ isOpen, onClose, pastDueCount }) => {
    const location = useLocation();

    useEffect(() => {
        if (isOpen) onClose();
    }, [isOpen, onClose, location.pathname]);

    return (
        <>
            <button
                className={`${styles.backdrop} ${isOpen ? styles.visible : ""}`}
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
            />
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`} aria-label="Main navigation">
                <div className={styles.brandRow}>
                    <NavLink className={styles.brand} to="/" aria-label="Ledgerline overview">
                        <span className={styles.brandMark} aria-hidden="true"><FiCreditCard /></span>
                        <span>ledgerline<span className={styles.brandDot}>.</span></span>
                    </NavLink>
                    <button className={styles.closeButton} type="button" aria-label="Close navigation" onClick={onClose}>
                        <FiX aria-hidden="true" />
                    </button>
                </div>

                <div className={styles.workspace}>
                    <span className={styles.workspaceIcon} aria-hidden="true">A</span>
                    <span className={styles.workspaceCopy}><strong>Atlas workspace</strong><span>Billing admin</span></span>
                    <span className={styles.workspaceCaret} aria-hidden="true">⌄</span>
                </div>

                <nav className={styles.navigation} aria-label="Billing pages">
                    <p className={styles.sectionLabel}>BILLING</p>
                    {navigation.map(({ label, to, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            end={end}
                            to={to}
                            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
                            onClick={onClose}
                        >
                            <Icon aria-hidden="true" />
                            <span>{label}</span>
                            {label === "Invoices" && pastDueCount > 0 && <span className={styles.navCount}>{pastDueCount}</span>}
                        </NavLink>
                    ))}
                    <p className={styles.sectionLabel}>INSIGHTS</p>
                    <NavLink to="/reports" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`} onClick={onClose}>
                        <FiBarChart2 aria-hidden="true" />
                        <span>Revenue report</span>
                    </NavLink>
                </nav>

                <div className={styles.sidebarBottom}>
                    <NavLink className={styles.attentionCard} to="/invoices" onClick={onClose}>
                        <span className={styles.attentionIcon}><FiFileText aria-hidden="true" /></span>
                        <span><strong>{pastDueCount} invoices need attention</strong><small>Review overdue payments</small></span>
                        <span className={styles.cardArrow} aria-hidden="true">›</span>
                    </NavLink>
                    <div className={styles.profile}>
                        <span className={styles.avatar}>AR</span>
                        <span className={styles.profileText}><strong>Alex Rivera</strong><small>Workspace owner</small></span>
                        <span className={styles.profileMenu} aria-hidden="true">•••</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
