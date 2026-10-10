import styles from "./styles.module.css";

const MetricCard = ({
    label,
    value,
    detail,
    icon: Icon,
    tone = "violet",
    trend,
}) => (
    <article className={`${styles.metricCard} ${styles[tone] || ""}`}>
        <div className={styles.topLine}>
            <span className={styles.icon}>
                {Icon && <Icon aria-hidden="true" />}
            </span>
            {trend && <span className={styles.trend}>{trend}</span>}
        </div>
        <p className={styles.label}>{label}</p>
        <strong className={styles.value}>{value}</strong>
        {detail && <p className={styles.detail}>{detail}</p>}
    </article>
);

export default MetricCard;
