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
            background: 'linear-gradient(120deg, #58ea90 0%, #0a9a3a 100%)',
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

          {/* Moving pills / herbs animation container (behind overlay & logo) */}
          <div className="auth-pills -z-0" aria-hidden>
            <div className="auth-pill auth-pill--sm" style={{ left: '6%', bottom: '-12%', animationDelay: '0s', animationDuration: '14s' }}>
              <img src="/images/logo/obat%20hijau.jpg" alt="" />
            </div>
            <div className="auth-pill auth-pill--md" style={{ left: '20%', bottom: '-18%', animationDelay: '1.6s', animationDuration: '15s' }}>
              <img src="/images/logo/obat%20hijau.jpg" alt="" />
            </div>
            <div className="auth-pill auth-pill--sm" style={{ left: '34%', bottom: '-22%', animationDelay: '0.9s', animationDuration: '13s' }}>
              <img src="/images/logo/obat%20hijau.jpg" alt="" />
            </div>
            <div className="auth-pill auth-pill--lg" style={{ left: '50%', bottom: '-16%', animationDelay: '3s', animationDuration: '18s' }}>
              <img src="/images/logo/obat%20hijau.jpg" alt="" />
            </div>
            <div className="auth-pill auth-pill--md" style={{ left: '66%', bottom: '-20%', animationDelay: '2.4s', animationDuration: '15s' }}>
              <img src="/images/logo/obat%20hijau.jpg" alt="" />
            </div>
            <div className="auth-pill auth-pill--xs" style={{ left: '82%', bottom: '-14%', animationDelay: '1s', animationDuration: '11s' }}>
              <img src="/images/logo/obat%20hijau.jpg" alt="" />
            </div>
            <div className="auth-pill auth-pill--sm" style={{ left: '28%', bottom: '-26%', animationDelay: '4.1s', animationDuration: '20s' }}>
              <img src="/images/logo/obat%20hijau.jpg" alt="" />
            </div>
            <div className="auth-pill auth-pill--md" style={{ left: '44%', bottom: '-18%', animationDelay: '2.7s', animationDuration: '17s' }}>
              <img src="/images/logo/obat%20hijau.jpg" alt="" />
            </div>
          </div>

          {/* Center logo + translucent backing */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-6">
            {/* Logo centered and slightly larger (no circular backdrop) */}
            <Link to="/" className="relative z-20 block">
              <img
                src="/images/logo/Herbaflow.png"
                alt="HerbaFlow Logo"
                className="w-[760px] h-[760px] object-contain mx-auto"
                style={{ filter: 'drop-shadow(0 22px 48px rgba(20,30,20,0.2))' }}
                width={460}
                height={460}
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
