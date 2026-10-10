import styles from "./styles.module.css";

const PageHeading = ({ title, description, actions, children }) => (
    <div className={styles.heading}>
        <div className={styles.copy}>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
            {children}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
    </div>
);

export default PageHeading;
