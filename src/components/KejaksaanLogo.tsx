/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const KejaksaanLogo: React.FC<LogoProps> = ({ className = '', size = 44 }) => {
  return (
    <img
      src="/src/utils/image/logo.png"
      width={size}
      height={size} 
      alt="Lambang Kejaksaan Republik Indonesia"
      className={`shrink-0 object-contain ${className}`}
    />
    // <svg
    //   width={size}
    //   height={size}
    //   viewBox="0 0 100 100"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    //   className={`shrink-0 ${className}`}
    //   aria-label="Lambang Kejaksaan Republik Indonesia"
    // >
    //   {/* Outer shield / wreath backdrop */}
    //   <circle cx="50" cy="50" r="48" fill="#0A382C" stroke="#D4AF37" strokeWidth="2.5" />
    //   <circle cx="50" cy="50" r="43" fill="#0F5132" stroke="#B8860B" strokeWidth="1" />

    //   {/* Golden decorative starburst rays */}
    //   <circle cx="50" cy="50" r="39" stroke="#E2C158" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.6" />

    //   {/* Padi & Kapas stylized circle */}
    //   <path
    //     d="M20 50 C20 32, 34 20, 50 20 C66 20, 80 32, 80 50 C80 68, 66 80, 50 80 C34 80, 20 68, 20 50"
    //     stroke="#E6B800"
    //     strokeWidth="1.8"
    //     strokeDasharray="3 2"
    //     fill="none"
    //   />

    //   {/* Trapsila Adhyaksa Center: Timbangan Keadilan (Scales of Justice) */}
    //   {/* Center column / sword spine */}
    //   <line x1="50" y1="24" x2="50" y2="76" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    //   <polygon points="50,21 47,27 53,27" fill="#FACC15" />

    //   {/* Crossbar */}
    //   <line x1="32" y1="36" x2="68" y2="36" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
    //   <circle cx="50" cy="36" r="2.8" fill="#FFFFFF" />

    //   {/* Left pan */}
    //   <line x1="34" y1="37" x2="28" y2="52" stroke="#FEF08A" strokeWidth="1" />
    //   <line x1="34" y1="37" x2="40" y2="52" stroke="#FEF08A" strokeWidth="1" />
    //   <path d="M26 52 Q34 57 42 52 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.75" />

    //   {/* Right pan */}
    //   <line x1="66" y1="37" x2="60" y2="52" stroke="#FEF08A" strokeWidth="1" />
    //   <line x1="66" y1="37" x2="72" y2="52" stroke="#FEF08A" strokeWidth="1" />
    //   <path d="M58 52 Q66 57 74 52 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.75" />

    //   {/* Pedestal base */}
    //   <path d="M42 76 L58 76 L55 72 L45 72 Z" fill="#FDE047" />

    //   {/* Central Star: Satya Adhi Wicaksana */}
    //   <polygon
    //     points="50,27 52,32 57,32 53,35 55,40 50,37 45,40 47,35 43,32 48,32"
    //     fill="#FDE047"
    //     stroke="#A16207"
    //     strokeWidth="0.5"
    //   />
    // </svg>
  );
};
