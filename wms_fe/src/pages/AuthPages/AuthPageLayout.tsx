import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 p-6 bg-white dark:bg-gray-900 sm:p-0">
      <div className="relative flex h-screen w-full flex-col justify-center lg:flex-row dark:bg-gray-900 sm:p-0">
        
        {/* Left / Form Section */}
        {children}

        {/* Right / Illustration Section */}
        <div
          className="relative hidden h-full w-full items-center justify-center overflow-hidden lg:flex lg:w-1/2"
          style={{
            background: "linear-gradient(120deg, #0c100e 0%, #0cdc51 100%)",
          }}
        >
          {/* Soft vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.045), transparent 45%)",
            }}
          />

          {/* Subtle grid */}
          <div className="absolute inset-0 -z-0 opacity-10">
            <GridShape />
          </div>

          {/* Center content (Logo + Text) */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-6">
            <Link to="/" className="relative z-20 block">
              <img
                src="/images/logo/Herbaflow.png"
                alt="HerbaFlow Logo"
                className="mx-auto h-[760px] w-[760px] object-contain"
                style={{
                  filter: "drop-shadow(0 22px 48px rgb(3, 6, 3))",
                }}
                width={460}
                height={460}
              />
            </Link>

            <p className="max-w-xs text-center text-white">
              HerbaFlow — kesehatan alami yang dikemas dengan gaya modern dan detail berkualitas.
            </p>
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
