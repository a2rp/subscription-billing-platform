import { useEffect } from "react";
import { FiCheckCircle, FiInfo, FiX, FiXCircle } from "react-icons/fi";
import styles from "./styles.module.css";

const icons = {
    success: FiCheckCircle,
    error: FiXCircle,
    info: FiInfo,
};

const Toast = ({ toast, onDismiss }) => {
    useEffect(() => {
        if (!toast) return undefined;
        const timeout = window.setTimeout(onDismiss, 3800);
        return () => window.clearTimeout(timeout);
    }, [toast, onDismiss]);

    if (!toast) return null;
    const Icon = icons[toast.tone] || icons.success;

    return (
        <div className={`${styles.toast} ${styles[toast.tone] || ""}`} role="status" aria-live="polite">
            <Icon aria-hidden="true" />
            <span>{toast.message}</span>
            <button type="button" aria-label="Dismiss notification" onClick={onDismiss}><FiX aria-hidden="true" /></button>
        </div>
    );
};

export default Toast;
