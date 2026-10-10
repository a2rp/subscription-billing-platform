import styles from "./styles.module.css";

const Loading = () => (
    <div
        className={styles.loading}
        role="status"
        aria-label="Loading billing workspace"
    >
        <span className={styles.spinner} aria-hidden="true" />
    </div>
);

export default Loading;
