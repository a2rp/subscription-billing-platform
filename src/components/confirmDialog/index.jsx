import { useEffect, useRef } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import styles from "./styles.module.css";

const ConfirmDialog = ({ confirmation, onCancel, onConfirm }) => {
    const cancelRef = useRef(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!confirmation) return undefined;
        const previous = document.activeElement;
        cancelRef.current?.focus();
        const handleKeydown = (event) => {
            if (event.key === "Escape") onCancel();
            if (event.key !== "Tab") return;
            const controls = dialogRef.current?.querySelectorAll("button:not(:disabled)");
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
    }, [confirmation, onCancel]);

    if (!confirmation) return null;

    return (
        <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
            <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" ref={dialogRef}>
                <button className={styles.closeButton} type="button" aria-label="Close confirmation" onClick={onCancel}><FiX aria-hidden="true" /></button>
                <span className={styles.alertIcon}><FiAlertTriangle aria-hidden="true" /></span>
                <h2 id="confirm-title">{confirmation.title}</h2>
                <p id="confirm-message">{confirmation.message}</p>
                {confirmation.note && <p className={styles.note}>{confirmation.note}</p>}
                <div className={styles.actions}>
                    <button className={styles.cancelButton} ref={cancelRef} type="button" onClick={onCancel}>Keep record</button>
                    <button className={styles.confirmButton} type="button" onClick={onConfirm}>{confirmation.confirmLabel || "Confirm removal"}</button>
                </div>
            </section>
        </div>
    );
};

export default ConfirmDialog;
