import { Link } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiSearch } from "react-icons/fi";
import styles from "./styles.module.css";

const NotFoundPage = () => (
    <section className={styles.notFound}>
        <div className={styles.ticket}>
            <span className={styles.icon}>
                <FiSearch aria-hidden="true" />
            </span>
            <strong>404</strong>
            <h1>This billing page is missing</h1>
            <p>
                The page address may have changed. Return to the workspace or
                open the invoice ledger.
            </p>
            <div className={styles.actions}>
                <Link to="/">
                    <FiArrowLeft aria-hidden="true" /> Back to overview
                </Link>
                <Link to="/invoices">
                    <FiFileText aria-hidden="true" /> Invoice ledger
                </Link>
            </div>
        </div>
    </section>
);

export default NotFoundPage;
