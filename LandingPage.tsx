// Lloyds Bank Employee Total Reward Platform — Landing Page
// React + Styled Components (JSX preview build)
// For production, use the .tsx version with TypeScript

import styled, { createGlobalStyle, keyframes } from "styled-components";

const C = {
  gd: "#006A4D", gm: "#00874E", gl: "#00A862", gv: "#4CAF50",
  black: "#0A0A0A", ch: "#1A1A1A", dark: "#111827",
  g9: "#1F2937", g7: "#374151", g4: "#9CA3AF", g1: "#F3F4F6",
  w: "#FFFFFF", gold: "#C9A84C", goldL: "#F0D080",
  gb: "rgba(255,255,255,0.04)", gbr: "rgba(255,255,255,0.08)",
};

const fadeUp = keyframes`from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}`;
const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const floatY = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}`;
const floatSlow = keyframes`0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(2deg)}`;
const shimmer = keyframes`0%{background-position:-400px 0}100%{background-position:400px 0}`;
const pulseRing = keyframes`0%{transform:scale(1);opacity:.6}100%{transform:scale(1.8);opacity:0}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const morphBlob = keyframes`
  0%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}
  50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}
  100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}`;
const slideInLeft = keyframes`from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}`;
const glowPulse = keyframes`0%,100%{box-shadow:0 0 20px rgba(0,168,98,.3)}50%{box-shadow:0 0 40px rgba(0,168,98,.7),0 0 80px rgba(0,168,98,.2)}`;
const rippleAnim = keyframes`0%{transform:scale(0);opacity:1}100%{transform:scale(4);opacity:0}`;
const scrollLeft = keyframes`from{transform:translateX(0)}to{transform:translateX(-50%)}`;

const GlobalStyle = createGlobalStyle`
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'DM Sans',system-ui,sans-serif;background:#0A0A0A;color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:#1A1A1A}
  ::-webkit-scrollbar-thumb{background:#006A4D;border-radius:4px}
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
`;

const Page = styled.div`position:relative;min-height:100vh;overflow:hidden`;
const BgCanvas = styled.div`
  position:fixed;inset:0;z-index:0;
  background:
    radial-gradient(ellipse at 20% 20%,rgba(0,106,77,.25) 0%,transparent 50%),
    radial-gradient(ellipse at 80% 80%,rgba(0,135,78,.15) 0%,transparent 50%),
    radial-gradient(ellipse at 50% 50%,rgba(10,10,10,.9) 0%,#0A0A0A 100%);`;
const GridOverlay = styled.div`
  position:fixed;inset:0;z-index:0;
  background-image:
    linear-gradient(rgba(0,106,77,.04) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,106,77,.04) 1px,transparent 1px);
  background-size:60px 60px;`;

// NAV
const Nav = styled.nav`
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 48px;
  background:rgba(10,10,10,.75);backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.08);
  animation:${fadeIn} .8s ease both;
  @media(max-width:700px){padding:14px 20px}`;
const NavLogo = styled.div`display:flex;align-items:center;gap:10px`;
const LogoPrimary = styled.span`font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:700;color:#fff;letter-spacing:.02em`;
const LogoSub = styled.span`font-size:9px;font-weight:600;color:${C.gl};letter-spacing:.14em;text-transform:uppercase`;
const NavLogoText = styled.div`display:flex;flex-direction:column;line-height:1.1`;
const NavRight = styled.div`display:flex;align-items:center;gap:10px;@media(max-width:600px){gap:6px}`;
const NavLink = styled.button`
  background:none;border:none;color:${C.g4};font-family:'DM Sans',sans-serif;
  font-size:13px;font-weight:500;cursor:pointer;padding:8px 14px;border-radius:8px;
  transition:all .2s;
  &:hover{color:#fff;background:rgba(255,255,255,.05)}
  @media(max-width:680px){display:none}`;
const PrimaryBtn = styled.button`
  position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:8px;
  font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;
  padding:14px 30px;border-radius:12px;cursor:pointer;border:none;
  background:${C.gd};color:#fff;
  box-shadow:0 4px 24px rgba(0,106,77,.35);
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
  animation:${glowPulse} 3s ease-in-out infinite;
  &:hover{background:${C.gm};transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,106,77,.5)}
  &::after{
    content:'';position:absolute;inset:0;
    background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.15) 50%,transparent 65%);
    background-size:200% 100%;animation:${shimmer} 2.5s infinite}
  .ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.2);animation:${rippleAnim} .6s linear;pointer-events:none}`;
const SecondaryBtn = styled.button`
  position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:8px;
  font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;
  padding:14px 30px;border-radius:12px;cursor:pointer;
  background:transparent;color:#fff;
  border:1.5px solid rgba(255,255,255,.2);
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
  &:hover{border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.06);transform:translateY(-2px)}
  .ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.15);animation:${rippleAnim} .6s linear;pointer-events:none}`;
const SmallPrimaryBtn = styled(PrimaryBtn)`font-size:13px;padding:9px 20px;border-radius:9px;animation:none`;

// HERO
const Hero = styled.section`
  position:relative;z-index:1;min-height:100vh;
  display:flex;align-items:center;padding:120px 48px 80px;gap:60px;
  @media(max-width:900px){flex-direction:column;padding:100px 24px 60px;gap:40px}`;
const HeroContent = styled.div`flex:1;max-width:580px`;
const Badge = styled.div`
  display:inline-flex;align-items:center;gap:8px;
  background:rgba(0,106,77,.15);border:1px solid rgba(0,106,77,.3);
  border-radius:100px;padding:6px 16px;margin-bottom:28px;
  animation:${fadeUp} .8s ease .1s both;`;
const BadgeDot = styled.div`
  width:7px;height:7px;border-radius:50%;background:${C.gl};position:relative;
  &::after{content:'';position:absolute;inset:-3px;border-radius:50%;background:${C.gl};opacity:.4;animation:${pulseRing} 1.5s ease-out infinite}`;
const BadgeText = styled.span`font-size:11px;font-weight:700;color:${C.gl};letter-spacing:.1em;text-transform:uppercase`;
const HeroTitle = styled.h1`
  font-family:'Playfair Display',Georgia,serif;font-size:clamp(40px,5vw,70px);
  font-weight:700;line-height:1.08;margin-bottom:24px;
  animation:${fadeUp} .8s ease .2s both;color:#fff;`;
const GreenSpan = styled.span`
  background:linear-gradient(135deg,${C.gl} 0%,${C.gv} 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;`;
const HeroSub = styled.p`
  font-size:17px;line-height:1.75;color:${C.g4};margin-bottom:40px;
  animation:${fadeUp} .8s ease .3s both;`;
const HeroCTAs = styled.div`display:flex;align-items:center;gap:14px;animation:${fadeUp} .8s ease .4s both`;
const HeroStats = styled.div`
  display:flex;gap:40px;margin-top:52px;padding-top:36px;
  border-top:1px solid rgba(255,255,255,.07);
  animation:${fadeUp} .8s ease .5s both;
  @media(max-width:480px){gap:24px}`;
const StatNum = styled.div`
  font-family:'Playfair Display',serif;font-size:30px;font-weight:700;
  background:linear-gradient(135deg,#fff 0%,${C.gl} 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;`;
const StatLabel = styled.div`font-size:12px;color:${C.g4};font-weight:500;margin-top:2px`;

// VISUAL
const HeroVisual = styled.div`
  flex:1;display:flex;align-items:center;justify-content:center;
  position:relative;animation:${fadeIn} 1s ease .5s both;
  @media(max-width:900px){width:100%;justify-content:center}`;
const CardStack = styled.div`position:relative;width:380px;height:480px;@media(max-width:480px){width:320px;height:420px}`;
const FloatCard = styled.div`
  position:absolute;border-radius:18px;padding:20px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
  backdrop-filter:blur(20px);transition:transform .3s;
  &:hover{z-index:10!important}`;
const NotifCard = styled.div`
  display:flex;align-items:center;gap:10px;
  background:rgba(20,20,20,.92);border:1px solid rgba(0,168,98,.25);
  border-radius:14px;padding:12px 14px;backdrop-filter:blur(20px);
  animation:${slideInLeft} .6s ease 1.2s both;`;

// Styled components for animated divs
const BlobBg = styled.div`
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:280px;height:280px;
  background:radial-gradient(circle,rgba(0,106,77,0.28) 0%,transparent 70%);
  animation:${morphBlob} 8s ease-in-out infinite;
  border-radius:60% 40% 30% 70%/60% 30% 70% 40%;`;

const MainRewardCardWrapper = styled.div`
  position:absolute;left:0;top:50px;z-index:3;
  animation:${floatY} 5s ease-in-out infinite;`;

const WalletMiniCard = styled(FloatCard)`
  left:-30px;top:280px;z-index:4;width:170px;
  background:rgba(0,20,12,0.88);
  transform:rotate(-4deg);
  animation:${floatY} 4s ease-in-out 0.5s infinite;`;

const OfferBadge = styled(FloatCard)`
  right:-20px;top:280px;z-index:4;width:148px;
  background:rgba(15,10,0,0.88);text-align:center;
  transform:rotate(5deg);
  animation:${floatY} 4.5s ease-in-out 1s infinite;`;

const CashbackBubble = styled.div`
  position:absolute;left:240px;top:130px;z-index:4;
  width:72px;height:72px;border-radius:50%;
  background:rgba(201,168,76,0.1);
  border:1.5px solid rgba(240,208,128,0.3);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  animation:${floatSlow} 4s ease-in-out 2s infinite;`;

const SpinRingOuter = styled.div`
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:430px;height:430px;
  border:1px dashed rgba(0,106,77,0.12);border-radius:50%;
  animation:${spin} 30s linear infinite;pointer-events:none;`;

const SpinRingInner = styled.div`
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:350px;height:350px;
  border:1px solid rgba(0,106,77,0.07);border-radius:50%;
  animation:${spin} 20s linear infinite reverse;pointer-events:none;`;

// STRIP
const StripTrack = styled.div`
  display:flex;gap:20px;white-space:nowrap;
  animation:${scrollLeft} 22s linear infinite;`;
const StripItem = styled.div`
  flex-shrink:0;display:inline-flex;align-items:center;gap:8px;
  padding:12px 22px;background:rgba(0,106,77,.08);
  border:1px solid rgba(0,106,77,.2);border-radius:100px;
  font-size:13px;font-weight:500;color:${C.g4};
  span{color:${C.gl}}`;

// FEATURES
const Section = styled.section`position:relative;z-index:1;padding:90px 48px;@media(max-width:700px){padding:60px 20px}`;
const SectionLabel = styled.div`font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${C.gl};margin-bottom:14px`;
const SectionTitle = styled.h2`font-family:'Playfair Display',serif;font-size:clamp(30px,4vw,50px);font-weight:700;line-height:1.1;color:#fff;margin-bottom:14px`;
const SectionSub = styled.p`font-size:16px;color:${C.g4};max-width:520px;line-height:1.75`;
const FeaturesGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:54px`;
const FeatureCard = styled.div`
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);
  border-radius:20px;padding:32px 28px;position:relative;overflow:hidden;
  transition:all .4s cubic-bezier(.34,1.56,.64,1);cursor:default;
  &::before{content:'';position:absolute;inset:0;
    background:radial-gradient(ellipse at top left,rgba(0,106,77,.12) 0%,transparent 60%);
    opacity:0;transition:opacity .4s}
  &:hover{transform:translateY(-6px);border-color:rgba(0,168,98,.3);
    box-shadow:0 24px 60px rgba(0,0,0,.4),0 0 0 1px rgba(0,168,98,.15);
    &::before{opacity:1}}`;
const IconWrap = styled.div`
  width:58px;height:58px;border-radius:16px;
  background:rgba(0,106,77,.15);border:1px solid rgba(0,106,77,.25);
  display:flex;align-items:center;justify-content:center;
  margin-bottom:22px;font-size:28px;
  animation:${floatSlow} 5s ease-in-out infinite;`;
const FTitle = styled.h3`font-family:'Playfair Display',serif;font-size:21px;font-weight:600;color:#fff;margin-bottom:10px`;
const FDesc = styled.p`font-size:13px;color:${C.g4};line-height:1.75`;
const FTag = styled.div`
  display:inline-flex;margin-top:18px;font-size:10px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:${C.gl};
  background:rgba(0,168,98,.1);border:1px solid rgba(0,168,98,.2);
  border-radius:100px;padding:4px 12px;`;

// CTA
const CTASection = styled.section`position:relative;z-index:1;padding:60px 48px 100px;display:flex;justify-content:center;@media(max-width:700px){padding:40px 20px 80px}`;
const CTACard = styled.div`
  max-width:780px;width:100%;
  background:linear-gradient(135deg,rgba(0,106,77,.2) 0%,rgba(0,106,77,.05) 100%);
  border:1px solid rgba(0,106,77,.3);border-radius:28px;
  padding:64px 56px;text-align:center;position:relative;overflow:hidden;
  @media(max-width:600px){padding:44px 28px}
  &::before{content:'';position:absolute;top:-60px;left:50%;transform:translateX(-50%);
    width:300px;height:300px;
    background:radial-gradient(circle,rgba(0,168,98,.2) 0%,transparent 70%);
    pointer-events:none}`;
const CTASub = styled.p`font-size:15px;color:${C.g4};margin-bottom:40px;line-height:1.75`;
const CTABtns = styled.div`display:flex;justify-content:center;gap:14px;flex-wrap:wrap`;

// FOOTER
const Footer = styled.footer`
  position:relative;z-index:1;padding:36px 48px;
  border-top:1px solid rgba(255,255,255,.07);
  display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;
  @media(max-width:700px){padding:28px 20px;flex-direction:column;align-items:flex-start}`;
const FooterLink = styled.a`font-size:12px;color:${C.g7};text-decoration:none;cursor:pointer;transition:color .2s;&:hover{color:${C.gl}}`;

// Horse Logo SVG
const HorseSVG = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="38" fill="rgba(0,106,77,0.2)" stroke="rgba(0,106,77,0.4)" strokeWidth="1"/>
    <path d="M40 8 C34 8, 24 16, 22 28 C20 40, 26 46, 32 48 L30 58 C28 66, 32 74, 36 78 L36 80 L44 80 L44 78 C48 74, 52 66, 50 58 L48 48 C54 46, 60 40, 58 28 C56 16 46 8 40 8Z" fill="#00A862" opacity="0.9"/>
    <path d="M34 22 Q28 14, 24 10 Q34 12, 36 24" fill="rgba(255,255,255,0.6)"/>
    <ellipse cx="35" cy="20" rx="3" ry="3.5" fill="#0A0A0A" opacity="0.7"/>
  </svg>
);

// Reward Card SVG
const RewardCard = () => (
  <svg width="320" height="190" viewBox="0 0 320 190" fill="none" style={{filter:"drop-shadow(0 20px 40px rgba(0,106,77,0.35))"}}>
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="320" y2="190" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#003D2A"/>
        <stop offset="100%" stopColor="#006A4D"/>
      </linearGradient>
      <linearGradient id="chipG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C9A84C"/>
        <stop offset="100%" stopColor="#F0D080"/>
      </linearGradient>
    </defs>
    <rect width="320" height="190" rx="16" fill="url(#cg)"/>
    <rect width="320" height="190" rx="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
    <ellipse cx="280" cy="35" rx="75" ry="75" fill="rgba(0,168,98,0.12)"/>
    <ellipse cx="50" cy="155" rx="55" ry="55" fill="rgba(0,106,77,0.18)"/>
    {/* Chip */}
    <rect x="22" y="65" width="42" height="32" rx="5" fill="url(#chipG)"/>
    <line x1="22" y1="77" x2="64" y2="77" stroke="#996B20" strokeWidth="0.8"/>
    <line x1="22" y1="87" x2="64" y2="87" stroke="#996B20" strokeWidth="0.8"/>
    <line x1="42" y1="65" x2="42" y2="97" stroke="#996B20" strokeWidth="0.8"/>
    {/* Contactless */}
    <path d="M78 74 Q83 81, 78 88" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M83 70 Q91 81, 83 92" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M88 66 Q99 81, 88 96" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Card number */}
    <text x="22" y="135" fontSize="13" fill="rgba(255,255,255,0.65)" fontFamily="monospace" letterSpacing="2.5">•••• •••• •••• 4892</text>
    {/* Labels */}
    <text x="22" y="158" fontSize="9" fill="rgba(255,255,255,0.45)" letterSpacing="2">LLOYDS REWARD</text>
    <text x="264" y="158" fontSize="9" fill="rgba(255,255,255,0.45)">12/28</text>
    {/* Points */}
    <rect x="200" y="14" width="106" height="36" rx="9" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
    <text x="210" y="27" fontSize="8" fill="rgba(255,255,255,0.5)">POINTS BALANCE</text>
    <text x="210" y="44" fontSize="14" fill="#00A862" fontWeight="bold">2,840 pts</text>
  </svg>
);

const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
  const btn = e.currentTarget;
  const circle = document.createElement("span");
  const d = Math.max(btn.clientWidth, btn.clientHeight);
  const r = btn.getBoundingClientRect();
  circle.className = "ripple";
  circle.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px;position:absolute;border-radius:50%;background:rgba(255,255,255,0.2);animation-duration:.6s`;
  btn.appendChild(circle);
  setTimeout(()=>circle.remove(),700);
};

const features = [
  { icon:"💳", title:"Smart Wallet", desc:"Your rewards, cashback, and allowances all in one intelligent wallet. Spend, save, or transfer with ease.", tag:"Instant Access" },
  { icon:"🎁", title:"Redeem & Earn", desc:"Redeem points for gift cards, experiences, or cashback. Every interaction earns you more.", tag:"10,000+ Options" },
  { icon:"🛍️", title:"Shopping Hub", desc:"Shop your favourite brands with exclusive employee discounts, curated offers, and real cashback.", tag:"500+ Brands" },
  { icon:"📊", title:"Personalised Offers", desc:"AI-powered offers tailored to you — from local dining to online subscriptions. Save more, stress less.", tag:"Updated Daily" },
];

const stripItems = [
  "🎁 Redeem Rewards","💳 Digital Wallet","🛍️ Exclusive Offers","🏪 Shopping Benefits",
  "✈️ Travel Perks","🍽️ Dining Cashback","💊 Wellbeing Allowance","📱 Tech Discounts","🎟️ Entertainment",
  "🎁 Redeem Rewards","💳 Digital Wallet","🛍️ Exclusive Offers","🏪 Shopping Benefits",
  "✈️ Travel Perks","🍽️ Dining Cashback","💊 Wellbeing Allowance","📱 Tech Discounts","🎟️ Entertainment",
];

export default function LandingPage() {
  return (
    <>
      <GlobalStyle />
      <Page>
        <BgCanvas />
        <GridOverlay />

        {/* NAV */}
        <Nav>
          <NavLogo>
            <HorseSVG size={34} />
            <NavLogoText>
              <LogoPrimary>Lloyds Banking Group</LogoPrimary>
              <LogoSub>Total Reward Platform</LogoSub>
            </NavLogoText>
          </NavLogo>
          <NavRight>
            <NavLink>Features</NavLink>
            <NavLink>Benefits</NavLink>
            <NavLink>Support</NavLink>
            <SecondaryBtn style={{padding:"9px 20px",fontSize:"13px",borderRadius:"9px"}} onClick={createRipple}>Sign In</SecondaryBtn>
            <SmallPrimaryBtn onClick={createRipple}>Register Now</SmallPrimaryBtn>
          </NavRight>
        </Nav>

        {/* HERO */}
        <Hero>
          <HeroContent>
            <Badge>
              <BadgeDot />
              <BadgeText>Lloyds Employee Benefits 2025</BadgeText>
            </Badge>
            <HeroTitle>
              Your Rewards,<br/>
              <GreenSpan>Reimagined.</GreenSpan>
            </HeroTitle>
            <HeroSub>
              Access your total reward package in one beautiful platform.
              Redeem points, explore offers, manage your wallet, and discover
              benefits built exclusively for Lloyds Banking Group colleagues.
            </HeroSub>
            <HeroCTAs>
              <PrimaryBtn onClick={createRipple}>
                Get Started
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </PrimaryBtn>
              <SecondaryBtn onClick={createRipple}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 5.5L11 8l-5 2.5V5.5z" fill="currentColor"/>
                </svg>
                Watch Demo
              </SecondaryBtn>
            </HeroCTAs>
            <HeroStats>
              {[["65K+","Colleagues Enrolled"],["£12M","Benefits Redeemed"],["98%","Satisfaction Rate"]].map(([n,l])=>(
                <div key={l}><StatNum>{n}</StatNum><StatLabel>{l}</StatLabel></div>
              ))}
            </HeroStats>
          </HeroContent>

          {/* HERO VISUAL */}
          <HeroVisual>
            <CardStack>
              {/* Blob bg */}
              <BlobBg />

              {/* Main reward card */}
              <MainRewardCardWrapper>
                <RewardCard />
              </MainRewardCardWrapper>

              {/* Wallet mini card */}
              <WalletMiniCard>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:34,height:34,borderRadius:10,background:"rgba(0,106,77,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💳</div>
                  <div>
                    <div style={{fontSize:10,color:C.g4}}>Wallet Balance</div>
                    <div style={{fontSize:18,fontWeight:700,color:C.gl,fontFamily:"Playfair Display,serif"}}>£420.00</div>
                  </div>
                </div>
              </WalletMiniCard>

              {/* Offer badge */}
              <OfferBadge>
                <div style={{fontSize:26}}>🎁</div>
                <div style={{fontSize:11,color:C.g4,marginTop:6}}>New offer</div>
                <div style={{fontSize:13,fontWeight:700,color:C.goldL}}>20% off Trainline</div>
              </OfferBadge>

              {/* Notif */}
              <div style={{position:"absolute",right:-10,top:20,zIndex:5}}>
                <NotifCard>
                  <div style={{width:34,height:34,borderRadius:9,background:"rgba(0,106,77,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎉</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:"#fff"}}>Points Added!</div>
                    <div style={{fontSize:11,color:C.gl}}>+350 pts this month</div>
                  </div>
                </NotifCard>
              </div>

              {/* Cashback bubble */}
              <CashbackBubble>
                <span style={{fontSize:9,color:C.goldL,fontWeight:700,letterSpacing:"0.05em"}}>CASHBACK</span>
                <span style={{fontSize:18,fontWeight:800,color:C.goldL}}>5%</span>
              </CashbackBubble>

              {/* Spin ring */}
              <SpinRingOuter />
              <SpinRingInner />
            </CardStack>
          </HeroVisual>
        </Hero>

        {/* SCROLLING STRIP */}
        <section style={{position:"relative",zIndex:1,paddingBottom:60,overflow:"hidden"}}>
          <StripTrack>
            {stripItems.map((item,i)=>(
              <StripItem key={i}>
                {item.slice(0,3)}<span>{item.slice(3)}</span>
              </StripItem>
            ))}
          </StripTrack>
        </section>

        {/* FEATURES */}
        <Section>
          <div style={{textAlign:"center"}}>
            <SectionLabel>What's Inside</SectionLabel>
            <SectionTitle>Everything you deserve,<br/><GreenSpan>in one place.</GreenSpan></SectionTitle>
            <SectionSub style={{margin:"14px auto 0",textAlign:"center"}}>
              From exclusive shopping discounts to wellbeing budgets — your total reward package has never been more rewarding.
            </SectionSub>
          </div>
          <FeaturesGrid>
            {features.map((f,i)=>(
              <FeatureCard key={i}>
                <IconWrap style={{animationDelay:`${i*0.4}s`}}>{f.icon}</IconWrap>
                <FTitle>{f.title}</FTitle>
                <FDesc>{f.desc}</FDesc>
                <FTag>{f.tag}</FTag>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </Section>

        {/* BENEFITS VISUAL ROW */}
        <Section style={{paddingTop:0}}>
          <div style={{
            display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,
            background:"rgba(0,106,77,0.05)",border:"1px solid rgba(0,106,77,0.15)",
            borderRadius:24,padding:40,
          }}>
            <div>
              <SectionLabel>Your Benefits at a Glance</SectionLabel>
              <SectionTitle style={{fontSize:"clamp(26px,3vw,38px)"}}>
                Saving you more,<br/><GreenSpan>every single day.</GreenSpan>
              </SectionTitle>
              <SectionSub>
                The average Lloyds colleague saves over £1,200 per year through their reward platform.
              </SectionSub>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:32}}>
                {[
                  {icon:"🍕",label:"Dining Cashback",val:"Up to 15%"},
                  {icon:"🛒",label:"Grocery Savings",val:"Up to 10%"},
                  {icon:"💆",label:"Wellbeing Budget",val:"£500/yr"},
                  {icon:"🚆",label:"Commuter Loans",val:"0% interest"},
                ].map(b=>(
                  <div key={b.label} style={{
                    background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",
                    borderRadius:14,padding:"18px 16px",
                  }}>
                    <div style={{fontSize:24,marginBottom:8}}>{b.icon}</div>
                    <div style={{fontSize:11,color:C.g4,fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase"}}>{b.label}</div>
                    <div style={{fontSize:16,fontWeight:700,color:C.gl,marginTop:4}}>{b.val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {/* Circular progress visualization */}
              <svg width="260" height="260" viewBox="0 0 260 260">
                <circle cx="130" cy="130" r="110" fill="none" stroke="rgba(0,106,77,0.1)" strokeWidth="1"/>
                <circle cx="130" cy="130" r="90" fill="none" stroke="rgba(0,106,77,0.07)" strokeWidth="1"/>
                {/* Segments */}
                <circle cx="130" cy="130" r="100" fill="none" stroke="rgba(0,106,77,0.5)" strokeWidth="18"
                  strokeDasharray="200 430" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 130 130)"/>
                <circle cx="130" cy="130" r="100" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="18"
                  strokeDasharray="130 430" strokeDashoffset="-200" strokeLinecap="round" transform="rotate(-90 130 130)"/>
                <circle cx="130" cy="130" r="100" fill="none" stroke="rgba(0,168,98,0.4)" strokeWidth="18"
                  strokeDasharray="80 430" strokeDashoffset="-330" strokeLinecap="round" transform="rotate(-90 130 130)"/>
                <circle cx="130" cy="130" r="70" fill="rgba(0,0,0,0.5)"/>
                <text x="130" y="122" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#fff" fontFamily="Playfair Display,serif">£1,240</text>
                <text x="130" y="142" textAnchor="middle" fontSize="11" fill={C.g4}>avg annual saving</text>
              </svg>
              {/* Legend */}
              <div style={{position:"absolute",right:-20,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",gap:10}}>
                {[{c:"rgba(0,106,77,0.6)",l:"Shopping"},
                  {c:"rgba(201,168,76,0.6)",l:"Dining"},
                  {c:"rgba(0,168,98,0.5)",l:"Wellbeing"},
                ].map(x=>(
                  <div key={x.l} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:3,background:x.c}}/>
                    <span style={{fontSize:11,color:C.g4}}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* CTA */}
        <CTASection>
          <CTACard>
            <SectionLabel style={{textAlign:"center"}}>Ready to explore?</SectionLabel>
            <SectionTitle style={{marginBottom:14}}>
              Start unlocking your<br/><GreenSpan>total reward</GreenSpan> today
            </SectionTitle>
            <CTASub>
              Join 65,000+ Lloyds Banking Group colleagues already using the platform.
              Register in under 2 minutes with your employee ID.
            </CTASub>
            <CTABtns>
              <PrimaryBtn onClick={createRipple} style={{fontSize:"16px",padding:"18px 40px"}}>
                Register Now
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </PrimaryBtn>
              <SecondaryBtn onClick={createRipple} style={{fontSize:"16px",padding:"18px 40px"}}>Sign In</SecondaryBtn>
            </CTABtns>
            <p style={{marginTop:24,fontSize:11,color:C.g7}}>
              Lloyds Banking Group colleagues only · Secured by enterprise SSO · GDPR compliant
            </p>
          </CTACard>
        </CTASection>

        {/* FOOTER */}
        <Footer>
          <NavLogo>
            <HorseSVG size={26}/>
            <NavLogoText>
              <LogoPrimary style={{fontSize:13}}>Lloyds Banking Group</LogoPrimary>
              <LogoSub>Total Reward Platform</LogoSub>
            </NavLogoText>
          </NavLogo>
          <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
            {["Privacy Policy","Cookie Settings","Accessibility","Contact HR"].map(l=>(
              <FooterLink key={l}>{l}</FooterLink>
            ))}
          </div>
          <p style={{fontSize:12,color:C.g7}}>© 2025 Lloyds Banking Group. Internal use only.</p>
        </Footer>
      </Page>
    </>
  );
}