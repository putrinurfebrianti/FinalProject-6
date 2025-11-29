import { useState } from "react";
import { Link } from "react-router-dom";

import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // 🔥 Tambahan: handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isChecked) {
      alert("You must agree to the Terms & Conditions.");
      return;
    }

    alert("Form submitted! (tambahkan API fetch disini)");
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
              {/* Name */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label className="dark:text-gray-200">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input placeholder="Enter your first name" />
                </div>

                <div>
                  <Label className="dark:text-gray-200">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input placeholder="Enter your last name" />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="dark:text-gray-200">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input placeholder="example@mail.com" />
              </div>

              {/* Password */}
              <div>
                <Label className="dark:text-gray-200">
                  Password <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="your password"
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

              {/* Checkbox */}
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />

                <span className="text-gray-700 dark:text-gray-400">
                  I agree to the Terms & Conditions
                </span>
              </div>

              {/* Submit */}
              <div>
                {/* 🔥 Tambahan type="submit" */}
                <Button
                  type="submit"
                  className="w-full bg-[#2ac45b] hover:bg-[#3bde64] text-gray-800
                             dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  size="sm"
                >
                  Sign Up
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
