import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./components/Dashboard.jsx";
import DashboardPlaceholder from "./pages/DashboardPlaceholder.jsx";
import Category from "./pages/Category.jsx";
import Income from "./pages/Income.jsx";
import Expense from "./pages/Expense.jsx";


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate replace to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/expense" element={<Expense />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard activeMenu="Dashboard">
                <DashboardPlaceholder />
            </Dashboard>
          </PrivateRoute>
        }
      />
      <Route
        path="/category"
        element={
          <PrivateRoute>
            <Category />
          </PrivateRoute>
        }
      />
      <Route
        path="/income"
        element={
          <PrivateRoute>
            <Income />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
