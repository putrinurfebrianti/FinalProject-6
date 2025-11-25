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
          className="items-center hidden w-full h-full lg:w-1/2 lg:flex justify-center items-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(120deg, #eafaf0 0%, #cff6dc 100%)',
          }}
        >
          {/* Soft vignette to give depth */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.045), transparent 45%)',
            }}
          />

          {/* Decorative subtle grid (keeps original design language) */}
          <div className="absolute inset-0 opacity-10 -z-0">
            <GridShape />
          </div>

          {/* Center logo + translucent backing */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-6">
            {/* translucent rounded backdrop so the logo pops */}
            <div
              aria-hidden
              style={{
                width: 420,
                height: 420,
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.78)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
                transform: 'translateY(-4%)',
              }}
            />

            <Link to="/" className="relative z-20 block">
              <img
                src="/images/logo/Herbaflow.png"
                alt="HerbaFlow Logo"
                className="w-[360px] h-[360px] object-contain"
                style={{ filter: 'drop-shadow(0 18px 40px rgba(20,30,20,0.18))' }}
                width={360}
                height={360}
              />
            </Link>

            <p className="max-w-xs text-center text-gray-600 dark:text-white/70">
              HerbaFlow — solusi herbal modern, dirancang dengan estetika & kualitas HD.
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
