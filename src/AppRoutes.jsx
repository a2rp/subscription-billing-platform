import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Loading from "./components/loading/index.jsx";

const OverviewPage = lazy(() => import("./pages/overview/index.jsx"));
const SubscriptionsPage = lazy(() => import("./pages/subscriptions/index.jsx"));
const InvoicesPage = lazy(() => import("./pages/invoices/index.jsx"));
const CustomersPage = lazy(() => import("./pages/customers/index.jsx"));
const PlansPage = lazy(() => import("./pages/plans/index.jsx"));
const ReportsPage = lazy(() => import("./pages/reports/index.jsx"));
const NotFoundPage = lazy(() => import("./pages/notFound/index.jsx"));

const AppRoutes = (props) => {
    const location = useLocation();

    return (
        <Suspense key={location.pathname} fallback={<Loading />}>
            <Routes>
                <Route path="/" element={<OverviewPage {...props} />} />
                <Route path="/subscriptions" element={<SubscriptionsPage {...props} />} />
                <Route path="/invoices" element={<InvoicesPage {...props} />} />
                <Route path="/customers" element={<CustomersPage {...props} />} />
                <Route path="/plans" element={<PlansPage {...props} />} />
                <Route path="/reports" element={<ReportsPage {...props} />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
