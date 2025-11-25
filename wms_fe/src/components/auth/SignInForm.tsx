import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  // ------------------------
  // Handle Submit
  // ------------------------
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login Gagal. Cek email atau password."
        );
      }

      login(data.access_token, data.user);

      // Redirect berdasarkan role
      switch (data.user.role) {
        case "supervisor":
          navigate("/supervisor/dashboard");
          break;
        case "user":
          navigate("/");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi error yang tidak diketahui."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------
  // UI
  // ------------------------
  return (
    <div className="flex flex-col flex-1 bg-[#F0FFF7] dark:bg-gray-900">
      {/* Back Link */}
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Title */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 dark:text-white text-title-sm sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          {/* Divider */}
          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-500 bg-[#F0FFF7] dark:bg-gray-900 sm:px-5 sm:py-2">
                Please Sign In
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email */}
              <div>
                <Label className="dark:text-gray-200">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="supervisor.bogor@herbalife.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  
                />
              </div>

              {/* Password */}
              <div>
                <Label className="dark:text-gray-200">
                  Password <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="password123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 cursor-pointer -translate-y-1/2 right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>

              {/* Keep me logged in + Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="text-gray-700 dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>

                <Link
                  to="/reset-password"
                  className="text-sm text-green-700 hover:text-green-800 dark:text-green-400"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-center text-red-500 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <Button
                  className="w-full bg-[#2ac45b] hover:bg-[#3bde64] text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign in"}
                </Button>
              </div>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-5">
            <p className="text-sm text-center text-gray-700 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-green-700 hover:text-green-800 dark:text-green-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
