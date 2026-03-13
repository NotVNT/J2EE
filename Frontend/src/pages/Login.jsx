import { useContext, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import Input from "../components/Input.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { validateEmail } from "../util/validation.js";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter valid email address");
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.LOGIN, { email, password });
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        setUser(user);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-5xl items-center justify-center px-6 py-16">
        <div className="grid w-full gap-10 md:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-6">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700">
              Login Module
            </span>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Sign in with JWT-based authentication.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              This step adds the login form, stores the returned token in localStorage, updates app
              context with the logged-in user, and redirects to a protected dashboard placeholder.
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Welcome Back</h2>
              <p className="text-sm text-slate-500">Please enter your details to login in.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                type="text"
                value={email}
              />
              <Input
                label="Password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                type="password"
                value={password}
              />

              {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              ) : null}

              <button className="btn-primary flex items-center justify-center gap-2" disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Logging in...
                  </>
                ) : (
                  "LOGIN"
                )}
              </button>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link className="font-medium text-blue-600 hover:text-blue-700" to="/signup">
                  Signup
                </Link>
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Login;
