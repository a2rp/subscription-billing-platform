import styles from "./styles.module.css";

const StatusBadge = ({ status }) => {
    const tone = status.toLowerCase().replaceAll(" ", "-");
    return (
        <span className={`${styles.badge} ${styles[tone] || ""}`}>
            <span aria-hidden="true" />
            {status}
        </span>
    );
};

export default StatusBadge;
