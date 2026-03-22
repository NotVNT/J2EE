import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminLayout from "./pages/Admin/AdminLayout.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminPayments from "./pages/Admin/AdminPayments.jsx";
import AdminSettings from "./pages/Admin/AdminSettings.jsx";
import AdminSubscription from "./pages/Admin/AdminSubscription.jsx";
import Home from "./pages/Home.jsx";
import Income from "./pages/Income.jsx";
import Expense from "./pages/Expense.jsx";
import Category from "./pages/Category.jsx";
import Filter from "./pages/Filter.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Payment from "./pages/Payment.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentCancel from "./pages/PaymentCancel.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AccountActivation from "./pages/AccountActivation.jsx";

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Root />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/dashboard" element={<Home />} />
                <Route path="/income" element={<Income />} />
                <Route path="/expense" element={<Expense />} />
                <Route path="/category" element={<Category />} />
                <Route path="/filter" element={<Filter />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/activate" element={<AccountActivation />} />
                <Route path="/admin" element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="payments" element={<AdminPayments />} />
                        <Route path="subscriptions" element={<AdminSubscription />} />
                        <Route path="settings" element={<AdminSettings />} />
                    </Route>
                </Route>
            </Routes>
        </>
    )
}

const Root = () => {
    return <Navigate to="/home" replace />;
}

export default App;
