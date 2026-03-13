import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../components/Header.jsx";
import Input from "../components/Input.jsx";
import ProfilePhotoSelector from "../components/ProfilePhotoSelector.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import uploadProfileImage from "../util/uploadProfileImage.js";
import { validateEmail } from "../util/validation.js";

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your fullname");
      setIsLoading(false);
      return;
    }

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
      let profileImageUrl = "";
      if (profilePhoto) {
        profileImageUrl = (await uploadProfileImage(profilePhoto)) || "";
      }

      const response = await axiosConfig.post(API_ENDPOINTS.REGISTER, {
        fullName,
        email,
        password,
        profileImageUrl
      });

      if (response.status === 201) {
        toast.success("Profile created successfully.");
        navigate("/login");
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
      <main className="mx-auto flex max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full items-center gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-6">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
              Signup Module
            </span>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Create an account and start tracking your money.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              This frontend step adds the registration page, API call to backend register endpoint,
              optional profile photo upload, and a working route structure for the auth entry flow.
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Create An Account</h2>
              <p className="text-sm text-slate-500">
                Start tracking your spendings by joining with us.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <ProfilePhotoSelector image={profilePhoto} setImage={setProfilePhoto} />

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Full Name"
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="John Doe"
                  type="text"
                  value={fullName}
                />
                <Input
                  label="Email Address"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  type="text"
                  value={email}
                />
              </div>

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
                    Signing Up...
                  </>
                ) : (
                  "SIGN UP"
                )}
              </button>

              <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link className="font-medium text-blue-600 hover:text-blue-700" to="/login">
                  Login
                </Link>
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Signup;
