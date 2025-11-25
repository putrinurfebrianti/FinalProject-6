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
            background: 'linear-gradient(120deg, #0c100e 0%, #0cdc51 100%)',
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
            {/* denser layout: 18 pills with mixed sizes / subtle & bold variants */}
            <div className="auth-pill auth-pill--xs auth-pill--subtle" style={{ left: '4%', bottom: '-10%', animationDelay: '0s' }}><img src="/images/logo/obathijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--sm auth-pill--subtle" style={{ left: '11%', bottom: '-16%', animationDelay: '0.6s' }}><img src="/images/logo/obathijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--sm auth-pill--bold" style={{ left: '16%', bottom: '-12%', animationDelay: '1.2s' }}><img src="/images/logo/obathijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--md auth-pill--subtle" style={{ left: '22%', bottom: '-22%', animationDelay: '1.9s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--xs auth-pill--subtle" style={{ left: '30%', bottom: '-28%', animationDelay: '2.4s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--lg auth-pill--bold" style={{ left: '36%', bottom: '-16%', animationDelay: '3s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>

            <div className="auth-pill auth-pill--sm auth-pill--subtle" style={{ left: '42%', bottom: '-22%', animationDelay: '3.5s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--md auth-pill--bold" style={{ left: '48%', bottom: '-26%', animationDelay: '1.8s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--xs auth-pill--subtle" style={{ left: '52%', bottom: '-14%', animationDelay: '2.1s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>

            <div className="auth-pill auth-pill--sm auth-pill--subtle" style={{ left: '58%', bottom: '-22%', animationDelay: '4.1s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--lg auth-pill--bold" style={{ left: '64%', bottom: '-20%', animationDelay: '0.9s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--md auth-pill--subtle" style={{ left: '70%', bottom: '-30%', animationDelay: '2.9s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>

            <div className="auth-pill auth-pill--sm auth-pill--bold" style={{ left: '74%', bottom: '-18%', animationDelay: '1.5s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--xs auth-pill--subtle" style={{ left: '78%', bottom: '-26%', animationDelay: '3.2s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--sm auth-pill--subtle" style={{ left: '82%', bottom: '-12%', animationDelay: '2.3s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>

            <div className="auth-pill auth-pill--md auth-pill--bold" style={{ left: '88%', bottom: '-22%', animationDelay: '4.6s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
            <div className="auth-pill auth-pill--sm auth-pill--subtle" style={{ left: '94%', bottom: '-16%', animationDelay: '5.1s' }}><img src="/images/logo/obat%20hijau.jpg" alt=""/></div>
          </div>

          {/* Center logo + translucent backing */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-6">
            {/* Logo centered and slightly larger (no circular backdrop) */}
            <Link to="/" className="relative z-20 block">
              <img
                src="/images/logo/Herbaflow.png"
                alt="HerbaFlow Logo"
                className="w-[760px] h-[760px] object-contain mx-auto"
                style={{ filter: 'drop-shadow(0 22px 48px rgb(3, 6, 3))' }}
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
