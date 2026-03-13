import { Navigate, Route, Routes } from "react-router-dom";
import LoginPlaceholder from "./pages/LoginPlaceholder.jsx";
import Signup from "./pages/Signup.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<LoginPlaceholder />} />
    </Routes>
  );
};

export default App;
