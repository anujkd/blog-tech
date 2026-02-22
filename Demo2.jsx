import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes, css } from "styled-components";

// ─── Keyframes ────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floatIn = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.85); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const scaleIn = keyframes`
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const ambientFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

const glowBreath = keyframes`
  0%, 100% { filter: drop-shadow(0 0 6px #f59e0baa) drop-shadow(0 0 12px #f59e0b44); }
  50% { filter: drop-shadow(0 0 14px #fbbf24ee) drop-shadow(0 0 28px #f59e0b66); }
`;

const orbitSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const orbitSpinRev = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;

const shimmerText = keyframes`
  0% { background-position: -300% center; }
  100% { background-position: 300% center; }
`;

const chipReveal = keyframes`
  from { opacity: 0; transform: translateX(-8px) scale(0.9); }
  to { opacity: 1; transform: translateX(0) scale(1); }
`;

const rippleOut = keyframes`
  0% { r: 2; opacity: 1; }
  100% { r: 52; opacity: 0; }
`;

const drawLine = keyframes`
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
`;

const nodePop = keyframes`
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.15; transform: scale(0.8); }
  50% { opacity: 0.6; transform: scale(1.2); }
`;

const confettiFall = keyframes`
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(90px) rotate(720deg); opacity: 0; }
`;

const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
`;

// ─── Styled Components ─────────────────────────────────────────────────────────

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 460px;
  background: linear-gradient(160deg, #1a1108 0%, #120e04 50%, #1a1008 100%);
  border-radius: 20px;
  border: 1px solid #3d2a0a;
  overflow: hidden;
  font-family: 'Georgia', 'Times New Roman', serif;
  box-shadow:
    0 0 0 1px #f59e0b08,
    0 20px 60px rgba(0,0,0,0.7),
    0 8px 20px rgba(245,158,11,0.06),
    inset 0 1px 0 rgba(245,158,11,0.08);
  animation: ${floatIn} 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
`;

const TopAccent = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    #b45309 15%,
    #f59e0b 40%,
    #fbbf24 50%,
    #f59e0b 60%,
    #b45309 85%,
    transparent 100%
  );
`;

const AmbientOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(40px);

  &.orb1 {
    width: 180px; height: 180px;
    top: -40px; right: -40px;
    background: radial-gradient(circle, #f59e0b18 0%, transparent 70%);
  }
  &.orb2 {
    width: 120px; height: 120px;
    bottom: -20px; left: 20px;
    background: radial-gradient(circle, #b4530918 0%, transparent 70%);
  }
`;

const StarField = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const SVGArea = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 0 16px;
  position: relative;
  z-index: 1;
  animation: ${ambientFloat} 5s ease-in-out infinite;
`;

const Body = styled.div`
  padding: 0 28px 28px;
  position: relative;
  z-index: 1;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  animation: ${fadeSlideUp} 0.5s ease forwards 0.3s;
  opacity: 0;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'Courier New', monospace;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #f59e0b;
  background: #f59e0b0f;
  border: 1px solid #f59e0b28;
  border-radius: 100px;
  padding: 4px 10px;
`;

const BadgeDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 6px #f59e0b;
  animation: ${glowBreath} 2s ease-in-out infinite;
`;

const Divider = styled.div`
  width: 24px;
  height: 1px;
  background: #3d2a0a;
`;

const BadgeTimestamp = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 9px;
  color: #4a330a;
  letter-spacing: 1px;
`;

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  font-style: italic;
  line-height: 1.2;
  color: #fef3c7;
  letter-spacing: -0.3px;
  animation: ${fadeSlideUp} 0.5s ease forwards 0.45s;
  opacity: 0;

  em {
    font-style: normal;
    background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b, #fde68a, #f59e0b);
    background-size: 300% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${shimmerText} 4s linear infinite;
  }
`;

const Subtitle = styled.p`
  margin: 0 0 20px;
  font-size: 13px;
  color: #78552a;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  animation: ${fadeSlideUp} 0.5s ease forwards 0.55s;
  opacity: 0;
`;

const ChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #1f1507;
  border: 1px solid #3d2a0a;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: #a16207;
  letter-spacing: 0.5px;
  opacity: 0;
  animation: ${chipReveal} 0.4s ease forwards;
  animation-delay: ${({ delay }) => delay || '0.6s'};

  svg { flex-shrink: 0; }
`;

const ChipLabel = styled.span`
  color: #4a330a;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 9px;
`;

const Separator = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, #3d2a0a, transparent);
  margin-bottom: 20px;
  opacity: 0;
  animation: ${fadeIn} 0.4s ease forwards 0.9s;
`;

const CTARow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
  animation: ${fadeSlideUp} 0.5s ease forwards 1s;
`;

const PrimaryBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  background: linear-gradient(135deg, #f59e0b, #b45309);
  border-radius: 10px;
  color: #1a0f00;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px #f59e0b33, 0 1px 0 #fbbf2444 inset;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px #f59e0b44;

    &::before { opacity: 1; }
  }

  &:active { transform: translateY(0); }

  span, svg { position: relative; z-index: 1; }

  svg { transition: transform 0.25s ease; }
  &:hover svg { transform: translateX(3px); }
`;

const SecondaryBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 16px;
  background: transparent;
  border: 1px solid #3d2a0a;
  border-radius: 10px;
  color: #78552a;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 1px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    border-color: #a16207;
    color: #d97706;
    background: #f59e0b08;
  }
`;

// ─── Confetti Piece ────────────────────────────────────────────────────────────

const ConfettiPiece = styled.div`
  position: absolute;
  width: ${({ w }) => w}px;
  height: ${({ h }) => h}px;
  background: ${({ color }) => color};
  border-radius: ${({ round }) => round ? '50%' : '2px'};
  left: ${({ x }) => x}%;
  top: ${({ y }) => y}px;
  opacity: 0;
  animation: ${confettiFall} ${({ dur }) => dur}s ease-out ${({ delay }) => delay}s forwards;
  transform-origin: center;
`;

// ─── Animated SVG Elements (Constellation) ────────────────────────────────────

const AmbientGlowCircle = styled.circle`
  animation: ${glowBreath} 3s ease-in-out infinite;
`;

const ConstellationLine = styled.line`
  animation: ${drawLine} 0.6s ease forwards ${props => props.delay || '0s'};
`;

const SatelliteNodeGroup = styled.g`
  transform-origin: ${props => props.origin};
  animation: ${nodePop} 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${props => props.delay || '0s'};
  opacity: 0;
`;

const CoreNodeGroup = styled.g`
  transform-origin: 80px 80px;
  animation: ${nodePop} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0s;
  opacity: 0;
`;

const OrbitCircle = styled.circle`
  animation: ${props => props.reverse ? orbitSpinRev : orbitSpin} ${props => props.duration || '12s'} linear infinite;
  transform-origin: 80px 80px;
`;

const StarCircle = styled.circle`
  animation: ${twinkle} ${props => props.duration} ease-in-out ${props => props.delay} infinite;
`;

// ─── Constellation SVG ─────────────────────────────────────────────────────────

const NODES = [
    { id: 'center', x: 80, y: 80, r: 16, label: 'UC' },
    { id: 'n1', x: 80, y: 22, r: 7 },
    { id: 'n2', x: 130, y: 44, r: 9 },
    { id: 'n3', x: 140, y: 108, r: 6 },
    { id: 'n4', x: 100, y: 140, r: 8 },
    { id: 'n5', x: 32, y: 118, r: 7 },
    { id: 'n6', x: 22, y: 52, r: 8 },
    { id: 'n7', x: 54, y: 20, r: 5 },
    { id: 'n8', x: 142, y: 74, r: 5 },
];

const EDGES = [
    ['center', 'n1'], ['center', 'n2'], ['center', 'n3'],
    ['center', 'n4'], ['center', 'n5'], ['center', 'n6'],
    ['n1', 'n7'], ['n2', 'n8'], ['n6', 'n7'],
];

function getNode(id) { return NODES.find(n => n.id === id); }

function lineDashProps(x1, y1, x2, y2) {
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return { strokeDasharray: len, strokeDashoffset: len };
}

const ConstellationSVG = ({ phase }) => {
    // phase: 'idle' | 'assembling' | 'done'
    const showNodes = phase !== 'idle';
    const showLines = phase === 'done' || phase === 'assembling';

    return (
        <svg width="164" height="164" viewBox="0 0 164 164" overflow="visible">
            <defs>
                <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                </radialGradient>
                <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#d97706" />
                </radialGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="coreGlow">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* Ambient glow behind center */}
            {showNodes && (
                <AmbientGlowCircle cx="80" cy="80" r="40" fill="#f59e0b" opacity="0.06" />
            )}

            {/* Edges */}
            {showLines && EDGES.map(([a, b], i) => {
                const na = getNode(a), nb = getNode(b);
                const { strokeDasharray, strokeDashoffset } = lineDashProps(na.x, na.y, nb.x, nb.y);
                return (
                    <ConstellationLine key={`${a}-${b}`}
                        x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                        stroke="url(#edgeGrad)"
                        strokeWidth="1"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        opacity="0.5"
                        delay={`${0.2 + i * 0.08}s`}
                    />
                );
            })}

            <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b4530966" />
                </linearGradient>
            </defs>

            {/* Satellite nodes */}
            {showNodes && NODES.filter(n => n.id !== 'center').map((node, i) => (
                <SatelliteNodeGroup key={node.id}
                    origin={`${node.x}px ${node.y}px`}
                    delay={`${0.05 + i * 0.07}s`}>
                    <circle cx={node.x} cy={node.y} r={node.r + 4}
                        fill="#f59e0b" opacity="0.06" />
                    <circle cx={node.x} cy={node.y} r={node.r}
                        fill="#1f1507" stroke="#d97706" strokeWidth="1.2"
                        filter="url(#glow)" />
                    <circle cx={node.x} cy={node.y} r={node.r * 0.35}
                        fill="#fbbf24" opacity="0.8" />
                </SatelliteNodeGroup>
            ))}

            {/* Center core */}
            {showNodes && (
                <CoreNodeGroup>
                    {/* Ripple rings */}
                    <circle cx="80" cy="80" r="2" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                        <animate attributeName="r" values="2;52" dur="2.5s" begin="0.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.7;0" dur="2.5s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="80" cy="80" r="2" fill="none" stroke="#fbbf24" strokeWidth="1">
                        <animate attributeName="r" values="2;52" dur="2.5s" begin="1.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0" dur="2.5s" begin="1.2s" repeatCount="indefinite" />
                    </circle>

                    {/* Outer orbit ring */}
                    <OrbitCircle cx="80" cy="80" r="28" fill="none" stroke="#f59e0b" strokeWidth="0.8"
                        strokeDasharray="4 6" opacity="0.25" />
                    <OrbitCircle cx="80" cy="80" r="22" fill="none" stroke="#fbbf24" strokeWidth="0.5"
                        strokeDasharray="2 8" opacity="0.15" duration="8s" reverse />

                    {/* Core circle */}
                    <circle cx="80" cy="80" r="16" fill="#1a0f00" stroke="#f59e0b" strokeWidth="1.5"
                        filter="url(#coreGlow)" />
                    <circle cx="80" cy="80" r="16" fill="url(#coreGrad)" opacity="0.15" />

                    {/* UC icon inside core */}
                    {/* Lightbulb idea icon */}
                    <g transform="translate(72, 70)">
                        <path d="M8 0 C3.58 0 0 3.58 0 8 C0 10.8 1.5 13.2 3.8 14.5 L3.8 16 L12.2 16 L12.2 14.5 C14.5 13.2 16 10.8 16 8 C16 3.58 12.42 0 8 0Z"
                            fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeLinejoin="round" />
                        <line x1="5" y1="18" x2="11" y2="18" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="6" y1="20.5" x2="10" y2="20.5" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="8" y1="4" x2="8" y2="8" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx="8" cy="10" r="1" fill="#fbbf24" />
                    </g>
                </CoreNodeGroup>
            )}
        </svg>
    );
};

// ─── Star field dots ───────────────────────────────────────────────────────────
const STARS = Array.from({ length: 18 }, (_, i) => ({
    x: `${(i * 37 + 11) % 100}%`,
    y: `${(i * 53 + 7) % 100}%`,
    r: (i % 3) + 1,
    delay: `${(i * 0.3) % 3}s`,
    dur: `${2 + (i % 3)}s`,
}));

// ─── Confetti data ─────────────────────────────────────────────────────────────
const COLORS = ['#f59e0b', '#fbbf24', '#fde68a', '#d97706', '#b45309', '#fef3c7'];
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
    x: 10 + (i * 23 + 7) % 82,
    y: -10,
    w: 4 + (i % 4),
    h: 4 + (i % 3) + 4,
    dur: 1.2 + (i % 5) * 0.3,
    delay: 0.1 + (i % 8) * 0.1,
    color: COLORS[i % COLORS.length],
    round: i % 4 === 0,
}));

// ─── Chip definitions ──────────────────────────────────────────────────────────
const CHIPS = [
    {
        icon: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L7.5 4.5H11L8.5 6.8L9.5 10.5L6 8.5L2.5 10.5L3.5 6.8L1 4.5H4.5L6 1Z"
                    stroke="#d97706" strokeWidth="1" strokeLinejoin="round" fill="#d97706" fillOpacity="0.3" />
            </svg>
        ),
        label: 'Status',
        value: 'Active',
    },
    {
        icon: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="10" height="10" rx="2" stroke="#d97706" strokeWidth="1" />
                <path d="M4 6H8M6 4V8" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
            </svg>
        ),
        label: 'Type',
        value: 'Automation',
    },
    {
        icon: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#d97706" strokeWidth="1" />
                <path d="M6 3V6L8 8" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
            </svg>
        ),
        label: 'Created',
        value: 'Just now',
    },
];

// ─── Main Component ────────────────────────────────────────────────────────────

/**
 * UseCaseCreated
 *
 * Props:
 *   useCaseName   — string  (e.g. "Customer Onboarding Flow")
 *   description   — string  (short description)
 *   meta          — array of { label, value } to override default chips
 *   exploreHref   — string  (primary CTA link)
 *   shareHref     — string  (secondary CTA link, optional)
 *   onExplore     — function
 *   onShare       — function
 */
export const UseCaseCreated = ({
    useCaseName = "Customer Onboarding Flow",
    description = "Your use case has been mapped, structured, and is ready to power intelligent automation.",
    meta,
    exploreHref = "#",
    shareHref = "#",
    onExplore,
    onShare,
}) => {
    const [svgPhase, setSvgPhase] = useState("idle");
    const [showConfetti, setShowConfetti] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        // Stagger: nodes appear, then lines connect
        timerRef.current = setTimeout(() => {
            setSvgPhase("assembling");
            setTimeout(() => {
                setSvgPhase("done");
                setShowConfetti(true);
            }, 600);
        }, 200);

        return () => clearTimeout(timerRef.current);
    }, []);

    const chips = meta || CHIPS;

    // timestamp
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} UTC`;

    return (
        <Card>
            <TopAccent />
            <AmbientOrb className="orb1" />
            <AmbientOrb className="orb2" />

            {/* Star field */}
            <StarField>
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                    {STARS.map((s, i) => (
                        <StarCircle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f59e0b"
                            opacity="0.15"
                            duration={s.dur}
                            delay={s.delay} />
                    ))}
                </svg>
            </StarField>

            {/* Confetti burst */}
            {showConfetti && CONFETTI.map((c, i) => (
                <ConfettiPiece key={i} {...c} style={{ zIndex: 10, pointerEvents: 'none' }} />
            ))}

            {/* Central SVG */}
            <SVGArea>
                <ConstellationSVG phase={svgPhase} />
            </SVGArea>

            <Body>
                {/* Badge row */}
                <BadgeRow>
                    <Badge>
                        <BadgeDot />
                        Use Case Created
                    </Badge>
                    <Divider />
                    <BadgeTimestamp>{ts}</BadgeTimestamp>
                </BadgeRow>

                {/* Title */}
                <Title>
                    <em>{useCaseName}</em>
                    {' '}is ready.
                </Title>

                {/* Subtitle */}
                <Subtitle>{description}</Subtitle>

                {/* Meta chips */}
                <ChipGrid>
                    {chips.map((chip, i) => (
                        <Chip key={i} delay={`${0.65 + i * 0.12}s`}>
                            {chip.icon}
                            <ChipLabel>{chip.label}:</ChipLabel>
                            {chip.value}
                        </Chip>
                    ))}
                </ChipGrid>

                <Separator />

                {/* CTA */}
                <CTARow>
                    <PrimaryBtn href={exploreHref} onClick={onExplore}>
                        <span>Explore Use Case</span>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7h10M8 3l4 4-4 4" stroke="#1a0f00" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </PrimaryBtn>
                    <SecondaryBtn href={shareHref} onClick={onShare}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <circle cx="10" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <circle cx="10" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <circle cx="2.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M8.5 2.8L4 5.8M4 7.2L8.5 10.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        Share
                    </SecondaryBtn>
                </CTARow>
            </Body>
        </Card>
    );
};

// ─── Demo ─────────────────────────────────────────────────────────────────────

export default function Demo() {
    const [key, setKey] = useState(0);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0c0904',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            padding: 24,
        }}>
            <UseCaseCreated
                key={key}
                useCaseName="Customer Onboarding Flow"
                description="Your use case has been mapped and structured. The agent is ready to automate and orchestrate this workflow end-to-end."
                exploreHref="#"
                shareHref="#"
            />
            <button
                onClick={() => setKey(k => k + 1)}
                style={{
                    background: 'none',
                    border: '1px solid #3d2a0a',
                    color: '#78552a',
                    padding: '8px 18px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontFamily: 'Courier New, monospace',
                    fontSize: 11,
                    letterSpacing: '1px',
                }}
            >
                ↺ REPLAY
            </button>
        </div>
    );
}