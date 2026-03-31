import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import AdminRoute from "./components/AdminRoute.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

const AdminLayout = lazy(() => import("./pages/Admin/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard.jsx"));
const AdminPayments = lazy(() => import("./pages/Admin/AdminPayments.jsx"));
const AdminSettings = lazy(() => import("./pages/Admin/AdminSettings.jsx"));
const AdminSubscription = lazy(() => import("./pages/Admin/AdminSubscription.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Income = lazy(() => import("./pages/Income.jsx"));
const Expense = lazy(() => import("./pages/Expense.jsx"));
const Budget = lazy(() => import("./pages/Budget.jsx"));
const Category = lazy(() => import("./pages/Category.jsx"));
const Filter = lazy(() => import("./pages/Filter.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const Payment = lazy(() => import("./pages/Payment.jsx"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.jsx"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx")); // Ensure jsx extension if needed or it's resolved by vite
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const AccountActivation = lazy(() => import("./pages/AccountActivation.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const SavingGoals = lazy(() => import("./pages/SavingGoals.jsx"));

const LoadingFallback = () => (
    <div className="flex justify-center items-center h-screen w-full">
        <LoaderCircle className="w-8 h-8 animate-spin text-blue-600" />
    </div>
);

const App = () => {
    return (
        <>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<Root />} />
                    <Route path="/home" element={<LandingPage />} />
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/expense" element={<Expense />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/saving-goals" element={<SavingGoals />} />
                    <Route path="/category" element={<Category />} />
                    <Route path="/filter" element={<Filter />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/cancel" element={<PaymentCancel />} />
                    <Route path="/profile" element={<Profile />} />
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
            </Suspense>
            <ChatWidget />
        </>
    )
}

const Root = () => {
    return <Navigate to="/home" replace />;
}

export default App;
