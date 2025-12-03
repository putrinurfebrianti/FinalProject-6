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
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div
          className="relative items-center justify-center hidden w-full h-full overflow-hidden lg:flex lg:w-1/2"
          style={{
            background: "linear-gradient(120deg, #0c100e 0%, #0cdc51 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.045), transparent 45%)",
            }}
          />

          <div className="absolute inset-0 -z-0 opacity-10">
            <GridShape />
          </div>

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
              HerbaFlow — Smart System For Your Inventory.
            </p>
          </div>
        </div>

        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
