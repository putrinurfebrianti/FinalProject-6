import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (!firstName || !lastName || !email || !password || !passwordConfirmation) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (!isChecked) {
      setError("Anda harus menyetujui Terms & Conditions.");
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`;
      
      // Register
      const registerResponse = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        if (registerData.errors) {
          const errorMessages = Object.values(registerData.errors).flat().join(", ");
          setError(errorMessages);
        } else {
          setError(registerData.message || "Registrasi gagal.");
        }
        setIsLoading(false);
        return;
      }

      // Auto login setelah registrasi berhasil
      const loginResponse = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setError("Registrasi berhasil, silakan login.");
        setTimeout(() => navigate("/signin"), 2000);
        setIsLoading(false);
        return;
      }

      // Simpan token dan user ke context
      login(loginData.access_token, loginData.user);

      // Tampilkan pesan sukses
      alert("Registrasi berhasil! Selamat datang, " + loginData.user.name);

      // Redirect ke dashboard customer
      navigate("/");
      
    } catch (err) {
      console.error("Registration error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#F0FFF7] dark:bg-gray-900">
      {/* Back */}
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      {/* Main */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Title */}
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 dark:text-white text-title-sm sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your details to create your account!
            </p>
          </div>

          {/* Divider */}
          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-500 bg-[#F0FFF7] dark:bg-gray-900 sm:px-5 sm:py-2">
                Please Sign Up
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label className="dark:text-gray-200">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    placeholder="Enter your first name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label className="dark:text-gray-200">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    placeholder="Enter your last name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="dark:text-gray-200">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input 
                  type="email"
                  placeholder="example@mail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
                    placeholder="your password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label className="dark:text-gray-200">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="confirm your password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />

                <span className="text-gray-700 dark:text-gray-400">
                  I agree to the Terms & Conditions
                </span>
              </div>

              {/* Submit */}
              <div>
                <Button
                  type="submit"
                  className="w-full bg-herbalife-600 hover:bg-herbalife-700 text-white
                             dark:bg-herbalife-700 dark:hover:bg-herbalife-600"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Sign Up"}
                </Button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-5">
            <p className="text-sm text-center text-gray-700 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-green-700 hover:text-green-800 dark:text-green-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
