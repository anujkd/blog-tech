import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle, keyframes, css } from "styled-components";

// ─────────────────────────────────────────────
// DESIGN TOKENS — Lloyds Brand System
// ─────────────────────────────────────────────
const tokens = {
  green: {
    primary: "#006A4D",
    dark: "#004D38",
    deeper: "#003327",
    light: "#00A878",
    pale: "#E6F4F0",
    accent: "#00C896",
  },
  black: "#0A0A0A",
  white: "#FFFFFF",
  grey: {
    50: "#F7F8F7",
    100: "#EAECEB",
    200: "#D3D7D5",
    400: "#8A9490",
    700: "#3D4743",
    900: "#1A1F1D",
  },
  gold: "#C9A84C",
};

// ─────────────────────────────────────────────
// PAGE CONFIG — maps each page to hero content
// ─────────────────────────────────────────────
export type PageVariant =
  | "home"
  | "wallet"
  | "offers"
  | "achievements"
  | "support"
  | "contact"
  | "admin";

interface PageConfig {
  label: string;
  heading: string;
  subheading: string;
  tag: string;
  accent: string;
  illustration: React.ReactNode;
  badge?: string;
}

// ─────────────────────────────────────────────
// KEYFRAMES
// ─────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideRight = keyframes`
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const floatY = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-14px) rotate(1.5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.04); }
`;

const lineGrow = keyframes`
  from { width: 0; }
  to   { width: 56px; }
`;

const rotateHorse = keyframes`
  0%   { transform: rotate(-4deg) scale(1); }
  50%  { transform: rotate(4deg)  scale(1.03); }
  100% { transform: rotate(-4deg) scale(1); }
`;

const orbPulse = keyframes`
  0%, 100% { transform: scale(1) translate(0,0); opacity: 0.15; }
  33%       { transform: scale(1.15) translate(12px,-8px); opacity: 0.22; }
  66%       { transform: scale(0.9) translate(-8px,12px); opacity: 0.18; }
`;

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Gill+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif; background: ${tokens.grey[50]}; }
`;

// ─────────────────────────────────────────────
// STYLED SVG COMPONENTS
// ─────────────────────────────────────────────
const HorseGroup = styled.g`
  animation: ${rotateHorse} 6s ease-in-out infinite;
  transform-origin: 160px 200px;
`;

const FloatingCardGroup = styled.g`
  animation: ${floatY} 4s ease-in-out infinite;
`;

const FloatingCoinGroup = styled.g<{ $delay?: number }>`
  animation: ${floatY} ${p => 3 + (p.$delay ?? 0)}s ease-in-out ${p => p.$delay ?? 0}s infinite;
`;

const FloatingTagGroup = styled.g<{ $delay?: number }>`
  animation: ${floatY} ${p => 3.5 + (p.$delay ?? 0) * 0.5}s ease-in-out ${p => p.$delay ?? 0}s infinite;
`;

const PulsingCircle = styled.g<{ $delay?: number }>`
  animation: ${pulse} ${p => 2 + (p.$delay ?? 0) * 0.4}s ease-in-out infinite;
`;

const FloatingTrophyGroup = styled.g`
  animation: ${floatY} 4s ease-in-out infinite;
  transform-origin: 160px 140px;
`;

const FloatingMedalGroup = styled.g<{ $delay?: number }>`
  animation: ${floatY} ${p => 3 + (p.$delay ?? 0)}s ease-in-out ${p => p.$delay ?? 0}s infinite;
`;

const FloatingHeadsetGroup = styled.g`
  animation: ${floatY} 4.5s ease-in-out infinite;
`;

const FloatingEnvelopeGroup = styled.g`
  animation: ${floatY} 5s ease-in-out infinite;
`;

const FloatingDashboardGroup = styled.g`
  animation: ${floatY} 4s ease-in-out infinite;
`;

const FloatingShieldGroup = styled.g`
  animation: ${floatY} 3s ease-in-out 0.4s infinite;
`;

// ─────────────────────────────────────────────
// ILLUSTRATIONS — SVG art per page
// ─────────────────────────────────────────────
const HorseIllustration = () => (
  <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    {/* Stylised black horse — Lloyds icon */}
    <HorseGroup>
      {/* Body */}
      <ellipse cx="160" cy="210" rx="68" ry="52" fill={tokens.green.primary} opacity="0.9" />
      {/* Neck */}
      <path d="M188 175 Q200 145 195 115" stroke={tokens.green.primary} strokeWidth="30" strokeLinecap="round" fill="none"/>
      {/* Head */}
      <ellipse cx="196" cy="108" rx="22" ry="28" fill={tokens.green.dark} transform="rotate(-15 196 108)"/>
      {/* Mane */}
      <path d="M178 100 Q168 85 175 70 Q182 85 185 75 Q188 90 195 82" fill={tokens.green.accent} opacity="0.8"/>
      {/* Front legs */}
      <line x1="148" y1="255" x2="138" y2="305" stroke={tokens.green.dark} strokeWidth="14" strokeLinecap="round"/>
      <line x1="168" y1="255" x2="172" y2="308" stroke={tokens.green.dark} strokeWidth="14" strokeLinecap="round"/>
      {/* Back legs */}
      <line x1="192" y1="255" x2="200" y2="305" stroke={tokens.green.dark} strokeWidth="14" strokeLinecap="round"/>
      <line x1="212" y1="248" x2="226" y2="300" stroke={tokens.green.dark} strokeWidth="14" strokeLinecap="round"/>
      {/* Tail */}
      <path d="M98 215 Q70 230 62 260 Q80 240 90 265" fill="none" stroke={tokens.green.accent} strokeWidth="8" strokeLinecap="round"/>
      {/* Eye */}
      <circle cx="202" cy="103" r="4" fill={tokens.white}/>
      <circle cx="203" cy="103" r="2" fill={tokens.black}/>
    </HorseGroup>
    {/* Shadow */}
    <ellipse cx="168" cy="316" rx="75" ry="8" fill={tokens.green.dark} opacity="0.25"/>
  </svg>
);

const WalletIllustration = () => (
  <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <FloatingCardGroup>
      {/* Card back */}
      <rect x="50" y="60" width="200" height="130" rx="16" fill={tokens.green.dark} opacity="0.7" transform="rotate(-6 150 125)"/>
      {/* Card front */}
      <rect x="60" y="80" width="200" height="130" rx="16" fill={tokens.green.primary}/>
      {/* Card stripe */}
      <rect x="60" y="116" width="200" height="32" fill={tokens.green.dark} opacity="0.5"/>
      {/* Chip */}
      <rect x="90" y="100" width="36" height="26" rx="6" fill={tokens.gold} opacity="0.9"/>
      <line x1="90" y1="111" x2="126" y2="111" stroke={tokens.green.dark} strokeWidth="1" opacity="0.4"/>
      <line x1="108" y1="100" x2="108" y2="126" stroke={tokens.green.dark} strokeWidth="1" opacity="0.4"/>
      {/* Card number dots */}
      {[0,1,2,3].map(i => <circle key={i} cx={106 + i*46} cy={167} r={4} fill={tokens.white} opacity={i===3?1:0.5}/>)}
      {/* Bank name */}
      <text x="88" y="198" fill={tokens.white} fontSize="13" fontFamily="Gill Sans, sans-serif" fontWeight="600" opacity="0.9">LLOYDS BANK</text>
      {/* Contactless icon */}
      <path d="M230 97 Q248 108 248 125 Q248 142 230 153" stroke={tokens.white} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M222 103 Q236 112 236 125 Q236 138 222 147" stroke={tokens.white} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
    </FloatingCardGroup>
    {/* Coins */}
    {[{x:290,y:70,r:20,d:0},{x:40,y:190,r:14,d:0.5}].map((c,i) => (
      <FloatingCoinGroup key={i} $delay={c.d}>
        <circle cx={c.x} cy={c.y} r={c.r} fill={tokens.gold} opacity="0.85"/>
        <circle cx={c.x} cy={c.y} r={c.r-4} fill="none" stroke={tokens.white} strokeWidth="1.5" opacity="0.4"/>
      </FloatingCoinGroup>
    ))}
  </svg>
);

const OffersIllustration = () => (
  <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    {/* Tag shapes */}
    {[
      { x: 80, y: 60, r: -8, scale: 1, delay: 0 },
      { x: 180, y: 40, r: 6,  scale: 0.85, delay: 0.4 },
      { x: 210, y: 140, r: -4, scale: 0.7, delay: 0.8 },
    ].map((t, i) => (
      <FloatingTagGroup key={i} $delay={i} style={{ transformOrigin: `${t.x+60}px ${t.y+55}px` }}>
        <g transform={`translate(${t.x},${t.y}) rotate(${t.r}) scale(${t.scale})`}>
          <path d="M0,20 L20,0 L100,0 L120,20 L120,80 L100,100 L20,100 L0,80 Z" fill={i===0?tokens.green.primary:i===1?tokens.green.dark:tokens.green.light} opacity="0.92"/>
          <circle cx="20" cy="20" r="8" fill={tokens.white} opacity="0.6"/>
          <text x="32" y="52" fill={tokens.white} fontSize="18" fontWeight="700" fontFamily="Playfair Display, serif">
            {i===0?"20%":i===1?"£50":"+5x"}
          </text>
          <text x="32" y="72" fill={tokens.white} fontSize="9" opacity="0.8" fontFamily="Gill Sans, sans-serif">
            {i===0?"CASHBACK":i===1?"BONUS":"POINTS"}
          </text>
        </g>
      </FloatingTagGroup>
    ))}
    {/* Stars */}
    {[[260,100,12],[60,190,8],[290,200,10]].map(([x,y,r],i)=>(
      <PulsingCircle key={i} $delay={i}>
        <circle cx={x} cy={y} r={r} fill={tokens.gold} opacity="0.7"/>
      </PulsingCircle>
    ))}
  </svg>
);

const AchievementsIllustration = () => (
  <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    {/* Trophy */}
    <FloatingTrophyGroup>
      {/* Cup */}
      <path d="M110 60 Q110 150 160 165 Q210 150 210 60 Z" fill={tokens.gold} opacity="0.9"/>
      {/* Handles */}
      <path d="M110 80 Q80 80 80 110 Q80 140 110 140" stroke={tokens.gold} strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M210 80 Q240 80 240 110 Q240 140 210 140" stroke={tokens.gold} strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.8"/>
      {/* Stem */}
      <rect x="148" y="165" width="24" height="40" rx="4" fill={tokens.gold} opacity="0.8"/>
      {/* Base */}
      <rect x="120" y="200" width="80" height="18" rx="9" fill={tokens.gold}/>
      {/* Star in cup */}
      <polygon points="160,85 167,105 188,105 172,117 178,138 160,125 142,138 148,117 132,105 153,105" fill={tokens.white} opacity="0.4"/>
      {/* Shine */}
      <ellipse cx="138" cy="95" rx="8" ry="16" fill={tokens.white} opacity="0.2" transform="rotate(-15 138 95)"/>
    </FloatingTrophyGroup>
    {/* Medals */}
    {[{x:65,y:175,c:tokens.green.primary},{x:260,y:175,c:tokens.green.light}].map((m,i)=>(
      <FloatingMedalGroup key={i} $delay={i*0.6}>
        <circle cx={m.x} cy={m.y} r={22} fill={m.c} opacity="0.85"/>
        <circle cx={m.x} cy={m.y} r={16} fill="none" stroke={tokens.gold} strokeWidth="2" opacity="0.6"/>
        <text x={m.x} y={m.y+5} textAnchor="middle" fill={tokens.white} fontSize="13" fontWeight="700">{i===0?"1st":"2nd"}</text>
        <rect x={m.x-4} y={m.y-42} width="8" height="22" rx="2" fill={tokens.gold} opacity="0.7"/>
      </FloatingMedalGroup>
    ))}
  </svg>
);

const SupportIllustration = () => (
  <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <FloatingHeadsetGroup>
      {/* Headset arc */}
      <path d="M80 140 Q80 60 160 60 Q240 60 240 140" stroke={tokens.green.primary} strokeWidth="14" fill="none" strokeLinecap="round"/>
      {/* Left ear */}
      <rect x="64" y="130" width="36" height="56" rx="18" fill={tokens.green.primary}/>
      {/* Right ear */}
      <rect x="220" y="130" width="36" height="56" rx="18" fill={tokens.green.primary}/>
      {/* Mic arm */}
      <path d="M100 180 Q100 220 140 220" stroke={tokens.green.dark} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <circle cx="148" cy="220" r="12" fill={tokens.green.light}/>
      {/* Chat bubbles */}
      {[{x:170,y:150,w:110,h:46,d:0},{x:150,y:208,w:90,h:36,d:0.3}].map((b,i)=>(
        <g key={i} style={{ animation: `${fadeIn} 0.5s ease ${b.d}s both` }}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.h/2} fill={i===0?tokens.green.pale:tokens.white} opacity="0.9"/>
          <circle cx={b.x+12} cy={b.y+b.h} r={6} fill={i===0?tokens.green.pale:tokens.white} opacity="0.9"/>
          {/* dot typing animation */}
          {[0,1,2].map(d=>(
            <circle key={d} cx={b.x+28+d*14} cy={b.y+b.h/2} r={4} fill={tokens.green.primary} opacity="0.6"
              style={{ animation: `${pulse} 1.2s ease-in-out ${d*0.2}s infinite` }}/>
          ))}
        </g>
      ))}
    </FloatingHeadsetGroup>
  </svg>
);

const ContactIllustration = () => (
  <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <FloatingEnvelopeGroup>
      {/* Envelope */}
      <rect x="60" y="80" width="200" height="140" rx="12" fill={tokens.green.primary}/>
      {/* Envelope flap */}
      <path d="M60 80 L160 155 L260 80" stroke={tokens.green.dark} strokeWidth="3" fill="none"/>
      <path d="M60 92 L140 150" stroke={tokens.green.dark} strokeWidth="2" opacity="0.4"/>
      <path d="M260 92 L180 150" stroke={tokens.green.dark} strokeWidth="2" opacity="0.4"/>
      {/* @ symbol */}
      <text x="128" y="178" fill={tokens.white} fontSize="42" fontWeight="300" opacity="0.35" fontFamily="Gill Sans">@</text>
      {/* Notification dot */}
      <circle cx="248" cy="88" r="18" fill={tokens.green.accent}/>
      <text x="248" y="94" textAnchor="middle" fill={tokens.white} fontSize="14" fontWeight="700">3</text>
    </FloatingEnvelopeGroup>
    {/* Floating icons */}
    {[{x:50,y:60,icon:"📞"},{x:270,y:180,icon:"💬"}].map((ic,i)=>(
      <text key={i} x={ic.x} y={ic.y} fontSize="28" style={{ animation: `${floatY} ${3+i}s ease-in-out ${i*0.5}s infinite` }}>{ic.icon}</text>
    ))}
  </svg>
);

const AdminIllustration = () => (
  <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <FloatingDashboardGroup>
      {/* Dashboard frame */}
      <rect x="50" y="50" width="220" height="160" rx="12" fill={tokens.green.pale} stroke={tokens.green.primary} strokeWidth="2"/>
      {/* Sidebar */}
      <rect x="50" y="50" width="55" height="160" rx="12" fill={tokens.green.primary}/>
      <rect x="60" y="74" width="34" height="6" rx="3" fill={tokens.white} opacity="0.7"/>
      {[100,120,140,160,180].map(y => <rect key={y} x="60" y={y} width="24" height="4" rx="2" fill={tokens.white} opacity="0.4"/>)}
      {/* Charts */}
      {/* Bar chart */}
      {[60,90,70,110,85,95].map((h,i)=>(
        <rect key={i} x={116+i*22} y={148-h*0.5} width="14" height={h*0.5} rx="3"
          fill={i%2===0?tokens.green.primary:tokens.green.light} opacity="0.85"/>
      ))}
      {/* Line */}
      <polyline points="116,110 138,95 160,102 182,80 204,88 226,72 248,78" stroke={tokens.gold} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* KPI numbers */}
      <text x="116" y="72" fill={tokens.green.dark} fontSize="11" fontWeight="700">↑ 24.6%</text>
      <text x="180" y="72" fill={tokens.green.dark} fontSize="9" opacity="0.6">vs last month</text>
    </FloatingDashboardGroup>
    {/* Shield badge */}
    <FloatingShieldGroup>
      <path d="M264 52 Q280 58 280 80 Q280 98 264 106 Q248 98 248 80 Q248 58 264 52Z" fill={tokens.green.primary}/>
      <text x="264" y="84" textAnchor="middle" fill={tokens.white} fontSize="16">✓</text>
    </FloatingShieldGroup>
  </svg>
);

// ─────────────────────────────────────────────
// PAGE CONFIGS
// ─────────────────────────────────────────────
const pageConfigs: Record<PageVariant, PageConfig> = {
  home: {
    label: "Home",
    tag: "Employee Rewards",
    heading: "Your rewards,\nyour way.",
    subheading: "Discover personalised perks, cashback offers, and exclusive benefits — all in one place, powered by Lloyds.",
    accent: tokens.green.accent,
    illustration: <HorseIllustration />,
    badge: "NEW PLATFORM",
  },
  wallet: {
    label: "My Wallet",
    tag: "Finance",
    heading: "Every penny\nworking for you.",
    subheading: "Track your balances, manage reward points, and redeem earnings instantly with your digital reward wallet.",
    accent: tokens.gold,
    illustration: <WalletIllustration />,
  },
  offers: {
    label: "Offers",
    tag: "Exclusive Deals",
    heading: "Unmissable\noffers await.",
    subheading: "Hundreds of curated cashback deals and partner discounts — refreshed weekly, just for Lloyds employees.",
    accent: tokens.green.light,
    illustration: <OffersIllustration />,
    badge: "12 NEW TODAY",
  },
  achievements: {
    label: "Achievements",
    tag: "Recognition",
    heading: "Celebrate\nyour wins.",
    subheading: "Unlock badges, climb leaderboards and earn bonus points as you reach milestones in your reward journey.",
    accent: tokens.gold,
    illustration: <AchievementsIllustration />,
  },
  support: {
    label: "Support",
    tag: "Help Centre",
    heading: "We're here\nwhenever you need.",
    subheading: "Instant answers, live chat support, and a comprehensive knowledge base — available around the clock.",
    accent: tokens.green.accent,
    illustration: <SupportIllustration />,
  },
  contact: {
    label: "Contact Us",
    tag: "Get in Touch",
    heading: "Talk to us,\nanytime.",
    subheading: "Reach your dedicated rewards team by email, phone, or live chat. We typically respond within 2 hours.",
    accent: tokens.green.light,
    illustration: <ContactIllustration />,
  },
  admin: {
    label: "Admin Dashboard",
    tag: "Management",
    heading: "Full control.\nComplete clarity.",
    subheading: "Monitor platform performance, manage users, configure offers and track reward distributions — all at a glance.",
    accent: tokens.gold,
    illustration: <AdminIllustration />,
    badge: "ADMIN ONLY",
  },
};

// ─────────────────────────────────────────────
// STYLED COMPONENTS
// ─────────────────────────────────────────────
const Wrapper = styled.section`
  position: relative;
  min-height: 540px;
  background: ${tokens.green.deeper};
  overflow: hidden;
  display: flex;
  align-items: stretch;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
`;

const Background = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 70% 50%, ${tokens.green.dark} 0%, transparent 70%),
    radial-gradient(ellipse 60% 80% at 10% 80%, ${tokens.green.primary}55 0%, transparent 60%),
    linear-gradient(135deg, ${tokens.green.deeper} 0%, ${tokens.green.dark} 50%, ${tokens.green.primary}33 100%);
`;

const OrbA = styled.div`
  position: absolute;
  width: 520px; height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, ${tokens.green.primary}40 0%, transparent 70%);
  top: -180px; right: -100px;
  animation: ${orbPulse} 8s ease-in-out infinite;
  pointer-events: none;
`;

const OrbB = styled.div`
  position: absolute;
  width: 360px; height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, ${tokens.green.accent}25 0%, transparent 70%);
  bottom: -120px; left: 30%;
  animation: ${orbPulse} 11s ease-in-out 2s infinite;
  pointer-events: none;
`;

const GridLines = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(${tokens.white}06 1px, transparent 1px),
    linear-gradient(90deg, ${tokens.white}06 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
`;

const Inner = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 40px;
  padding: 72px 64px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 48px 32px;
    text-align: center;
  }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const PageTag = styled.div<{ $visible: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${tokens.green.accent};
  margin-bottom: 16px;
  opacity: ${p => p.$visible ? 1 : 0};
  animation: ${p => p.$visible ? css`${slideRight} 0.5s ease 0.05s forwards` : "none"};

  &::before {
    content: '';
    display: block;
    width: 0;
    height: 2px;
    background: currentColor;
    border-radius: 2px;
    animation: ${p => p.$visible ? css`${lineGrow} 0.5s ease 0.05s forwards` : "none"};
  }
`;

const Badge = styled.span`
  display: inline-block;
  background: ${tokens.green.accent}22;
  border: 1px solid ${tokens.green.accent}55;
  color: ${tokens.green.accent};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 3px 8px;
  border-radius: 4px;
  margin-left: 12px;
  vertical-align: middle;
`;

const Heading = styled.h1<{ $visible: boolean }>`
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: clamp(2.4rem, 4.5vw, 3.8rem);
  font-weight: 800;
  line-height: 1.1;
  color: ${tokens.white};
  margin-bottom: 20px;
  white-space: pre-line;
  opacity: ${p => p.$visible ? 1 : 0};
  animation: ${p => p.$visible ? css`${fadeUp} 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s forwards` : "none"};

  span {
    background: linear-gradient(135deg, ${tokens.green.accent}, ${tokens.green.light});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const SubHeading = styled.p<{ $visible: boolean }>`
  font-size: 1.05rem;
  line-height: 1.7;
  color: ${tokens.white}bb;
  font-weight: 300;
  max-width: 480px;
  margin-bottom: 36px;
  opacity: ${p => p.$visible ? 1 : 0};
  animation: ${p => p.$visible ? css`${fadeUp} 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s forwards` : "none"};
`;

const Actions = styled.div<{ $visible: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  opacity: ${p => p.$visible ? 1 : 0};
  animation: ${p => p.$visible ? css`${fadeUp} 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s forwards` : "none"};
`;

const PrimaryBtn = styled.button`
  background: ${tokens.green.primary};
  color: ${tokens.white};
  border: none;
  border-radius: 6px;
  padding: 14px 32px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background 0.2s, transform 0.15s;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, ${tokens.white}20, transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    background: ${tokens.green.light};
    transform: translateY(-2px);
    &::after { opacity: 1; }
  }

  &:active { transform: translateY(0); }
`;

const SecondaryBtn = styled.button`
  background: transparent;
  color: ${tokens.white};
  border: 1.5px solid ${tokens.white}44;
  border-radius: 6px;
  padding: 13px 28px;
  font-size: 0.95rem;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  letter-spacing: 0.02em;

  &:hover {
    border-color: ${tokens.white}99;
    background: ${tokens.white}0d;
    transform: translateY(-2px);
  }
`;

const StatRow = styled.div<{ $visible: boolean }>`
  display: flex;
  gap: 40px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid ${tokens.white}18;
  opacity: ${p => p.$visible ? 1 : 0};
  animation: ${p => p.$visible ? css`${fadeUp} 0.6s ease 0.45s forwards` : "none"};
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .value {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: ${tokens.white};
    line-height: 1;
  }

  .label {
    font-size: 0.75rem;
    color: ${tokens.white}77;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const Right = styled.div<{ $visible: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  opacity: ${p => p.$visible ? 1 : 0};
  animation: ${p => p.$visible ? css`${fadeIn} 0.7s ease 0.15s forwards` : "none"};

  @media (max-width: 900px) { display: none; }
`;

const IllustrationRing = styled.div`
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, ${tokens.green.primary}55 0%, ${tokens.green.dark}33 60%, transparent 80%);
  border: 1px solid ${tokens.green.accent}22;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -16px;
    border-radius: 50%;
    border: 1px dashed ${tokens.white}18;
    animation: ${rotateHorse} 40s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    inset: -32px;
    border-radius: 50%;
    border: 1px dashed ${tokens.white}0c;
    animation: ${rotateHorse} 60s linear infinite reverse;
  }
`;

const IllustrationInner = styled.div`
  width: 300px;
  height: 300px;
`;

// Logo SVG component (Lloyds Black Horse wordmark simplified)
const LloydsBrandmark = styled.div`
  position: absolute;
  top: 28px;
  left: 64px;
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 10;

  @media (max-width: 900px) { left: 32px; }
`;

const BrandName = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${tokens.white};
  letter-spacing: 0.05em;

  span { color: ${tokens.green.accent}; }
`;

const NavDots = styled.div`
  position: absolute;
  bottom: 28px;
  left: 64px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
`;

const NavDot = styled.button<{ $active: boolean }>`
  width: ${p => p.$active ? "24px" : "8px"};
  height: 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: ${p => p.$active ? tokens.green.accent : tokens.white + "44"};
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  padding: 0;
`;

// ─────────────────────────────────────────────
// PAGE SELECTOR (Demo nav strip)
// ─────────────────────────────────────────────
const NavStrip = styled.div`
  background: ${tokens.green.deeper};
  border-bottom: 1px solid ${tokens.white}11;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 64px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }

  @media (max-width: 900px) { padding: 0 32px; }
`;

const NavItem = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  border-bottom: 2.5px solid ${p => p.$active ? tokens.green.accent : "transparent"};
  color: ${p => p.$active ? tokens.white : tokens.white + "77"};
  font-family: 'Gill Sans', Calibri, sans-serif;
  font-size: 0.85rem;
  font-weight: ${p => p.$active ? 600 : 400};
  letter-spacing: 0.04em;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover { color: ${tokens.white}; }
`;

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
interface HeroBannerProps {
  page?: PageVariant;
  onCtaClick?: (page: PageVariant) => void;
}

const PAGES: PageVariant[] = ["home","wallet","offers","achievements","support","contact","admin"];

const PAGE_STATS: Record<PageVariant, Array<{value:string; label:string}>> = {
  home:         [{value:"£2.4k",label:"Avg. Annual Reward"},{value:"98%",label:"Employee Satisfaction"},{value:"500+",label:"Partner Brands"}],
  wallet:       [{value:"£840",label:"Your Balance"},{value:"4,200",label:"Points Earned"},{value:"£120",label:"This Month"}],
  offers:       [{value:"350+",label:"Active Offers"},{value:"Up to 30%",label:"Cashback"},{value:"Weekly",label:"New Deals"}],
  achievements: [{value:"12",label:"Badges Unlocked"},{value:"Top 8%",label:"Leaderboard Rank"},{value:"2,100",label:"Points to Next Tier"}],
  support:      [{value:"<2hr",label:"Avg. Response Time"},{value:"24/7",label:"Live Chat"},{value:"96%",label:"Resolution Rate"}],
  contact:      [{value:"5",label:"Support Channels"},{value:"92%",label:"CSAT Score"},{value:"Mon–Sun",label:"Available"}],
  admin:        [{value:"14.2k",label:"Active Users"},{value:"£380k",label:"Rewards Issued"},{value:"99.9%",label:"Uptime"}],
};

export const HeroBanner: React.FC<HeroBannerProps> = ({ page = "home", onCtaClick }) => {
  const [activePage, setActivePage] = useState<PageVariant>(page);
  const [visible, setVisible] = useState(true);
  const config = pageConfigs[activePage];
  const stats = PAGE_STATS[activePage];
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const switchPage = (p: PageVariant) => {
    if (p === activePage) return;
    setVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActivePage(p);
      setVisible(true);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <GlobalStyle />

      {/* Navigation strip */}
      <NavStrip>
        {PAGES.map(p => (
          <NavItem key={p} $active={p === activePage} onClick={() => switchPage(p)}>
            {pageConfigs[p].label}
          </NavItem>
        ))}
      </NavStrip>

      {/* Hero */}
      <Wrapper>
        <Background />
        <OrbA />
        <OrbB />
        <GridLines />

        {/* Brandmark */}
        <LloydsBrandmark>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill={tokens.green.primary}/>
            {/* simplified horse silhouette */}
            <path d="M21 7 Q22 5 20 5 Q18 5 18 7 Q17 8 16 8 Q13 8 11 11 Q10 14 11 17 L12 24 L15 24 L14 17 Q14 15 16 14 Q18 13 19 11 Q20 9 22 9 Q24 9 24 7 Z" fill={tokens.white}/>
          </svg>
          <BrandName>Lloyds <span>Rewards</span></BrandName>
        </LloydsBrandmark>

        <Inner>
          {/* LEFT */}
          <Left>
            <PageTag $visible={visible}>
              {config.tag}
              {config.badge && <Badge>{config.badge}</Badge>}
            </PageTag>

            <Heading $visible={visible}>
              {config.heading.split('\n').map((line, i) =>
                i === 0 ? <span key={i}>{line}</span> : <React.Fragment key={i}><br />{line}</React.Fragment>
              )}
            </Heading>

            <SubHeading $visible={visible}>{config.subheading}</SubHeading>

            <Actions $visible={visible}>
              <PrimaryBtn onClick={() => onCtaClick?.(activePage)}>
                Get Started →
              </PrimaryBtn>
              <SecondaryBtn>Learn More</SecondaryBtn>
            </Actions>

            <StatRow $visible={visible}>
              {stats.map((s, i) => (
                <Stat key={i}>
                  <span className="value">{s.value}</span>
                  <span className="label">{s.label}</span>
                </Stat>
              ))}
            </StatRow>
          </Left>

          {/* RIGHT */}
          <Right $visible={visible}>
            <IllustrationRing>
              <IllustrationInner>{config.illustration}</IllustrationInner>
            </IllustrationRing>
          </Right>
        </Inner>

        {/* Page indicator dots */}
        <NavDots>
          {PAGES.map(p => (
            <NavDot key={p} $active={p === activePage} onClick={() => switchPage(p)} aria-label={pageConfigs[p].label}/>
          ))}
        </NavDots>
      </Wrapper>
    </>
  );
};

// ─────────────────────────────────────────────
// DEMO — standalone preview
// ─────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: tokens.grey[50] }}>
      <HeroBanner
        page="home"
        onCtaClick={(p) => console.log("CTA clicked on:", p)}
      />
      <div style={{
        padding: "48px 64px",
        fontFamily: "Gill Sans, Calibri, sans-serif",
        color: tokens.grey[700],
        fontSize: "0.95rem",
        lineHeight: 1.8,
        maxWidth: 700,
      }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", color: tokens.green.primary, marginBottom: 12, fontSize: "1.6rem" }}>
          Reusable Hero Banner — Usage
        </h2>
        <p>
          Import <code style={{background:tokens.green.pale,padding:"2px 6px",borderRadius:4,color:tokens.green.dark}}>HeroBanner</code> and pass any <code style={{background:tokens.green.pale,padding:"2px 6px",borderRadius:4,color:tokens.green.dark}}>page</code> prop:
          <br/><strong>home | wallet | offers | achievements | support | contact | admin</strong>
        </p>
        <pre style={{background:tokens.grey[900],color:tokens.green.accent,padding:20,borderRadius:8,marginTop:16,fontSize:"0.85rem",overflow:"auto"}}>
{`import { HeroBanner } from "./HeroBanner";

// On your home page
<HeroBanner page="home" onCtaClick={(p) => navigate(p)} />

// On your wallet page
<HeroBanner page="wallet" />

// On admin dashboard
<HeroBanner page="admin" />`}
        </pre>
      </div>
    </div>
  );
}