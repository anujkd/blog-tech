import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes, css } from "styled-components";

// ─── Keyframes ────────────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.95); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const dashDraw = keyframes`
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
`;

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const glowPulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 4px #00ffc8aa); }
  50% { filter: drop-shadow(0 0 12px #00ffc8ff) drop-shadow(0 0 24px #00ffc855); }
`;

const ripple = keyframes`
  0% { r: 16; opacity: 0.6; }
  100% { r: 38; opacity: 0; }
`;

const particleFloat = keyframes`
  0% { transform: translateY(0px) translateX(0px); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-60px) translateX(var(--dx, 20px)); opacity: 0; }
`;

const checkDraw = keyframes`
  from { stroke-dashoffset: 50; }
  to { stroke-dashoffset: 0; }
`;

const successBurst = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const lineTravel = keyframes`
  0% { stroke-dashoffset: 120; }
  100% { stroke-dashoffset: 0; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// ─── Styled Components ─────────────────────────────────────────────────────────

const Wrapper = styled.div`
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  background: linear-gradient(135deg, #0a0e1a 0%, #0d1424 60%, #0a1018 100%);
  border: 1px solid #1a2640;
  border-radius: 16px;
  padding: 28px 24px 24px;
  width: 100%;
  max-width: 480px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.04);

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #00ffc844, #00b4ff44, transparent);
  }
`;

const GridBg = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 255, 200, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 200, 0.025) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
`;

const HeaderDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color || '#00ffc8'};
  box-shadow: 0 0 6px ${({ color }) => color || '#00ffc8'};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const HeaderTitle = styled.span`
  font-size: 11px;
  color: #4a6080;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

const CentralSVGArea = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  height: 140px;
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  z-index: 1;
`;

const StepRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 10px 0;
  position: relative;
  animation: ${({ visible }) => visible ? css`${fadeSlideUp} 0.4s ease forwards` : 'none'};
  opacity: ${({ visible }) => visible ? 1 : 0};
`;

const StepConnector = styled.div`
  position: absolute;
  left: 13px;
  top: 32px;
  width: 2px;
  height: calc(100% - 10px);
  background: ${({ done }) => done
        ? 'linear-gradient(#00ffc8, #00b4ff)'
        : 'linear-gradient(#1e2d44, #1e2d44)'};
  transition: background 0.6s ease;
  border-radius: 2px;
`;

const StepIconWrap = styled.div`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StepContent = styled.div`
  flex: 1;
  padding-top: 2px;
`;

const StepLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ status }) =>
        status === 'done' ? '#00ffc8' :
            status === 'active' ? '#e0eeff' :
                '#2e4260'};
  transition: color 0.4s ease;
  letter-spacing: 0.3px;
`;

const StepSubLabel = styled.div`
  font-size: 10px;
  color: ${({ status }) =>
        status === 'done' ? '#00b4ff88' :
            status === 'active' ? '#4a7aaa' :
                '#1e2d44'};
  margin-top: 2px;
  letter-spacing: 1px;
  transition: color 0.4s ease;
`;

const TerminalLine = styled.div`
  font-size: 10px;
  color: #2e7d5a;
  margin-top: 4px;
  letter-spacing: 0.5px;
  
  &::before {
    content: '> ';
    color: #00ffc844;
  }

  span.cursor {
    display: inline-block;
    width: 6px;
    height: 10px;
    background: #00ffc8;
    margin-left: 2px;
    vertical-align: middle;
    animation: ${blink} 1s step-end infinite;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${successBurst} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  position: relative;
  z-index: 1;
`;

const SuccessMessage = styled.div`
  text-align: center;
`;

const SuccessTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #00ffc8;
  letter-spacing: 1px;
  margin-bottom: 6px;
  text-shadow: 0 0 20px #00ffc855;
`;

const SuccessSubtext = styled.div`
  font-size: 11px;
  color: #4a7a6a;
  letter-spacing: 0.5px;
  line-height: 1.6;
`;

const ViewButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #00ffc811, #00b4ff11);
  border: 1px solid #00ffc844;
  border-radius: 8px;
  color: #00ffc8;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background-size: 200% auto;

  &:hover {
    background: linear-gradient(135deg, #00ffc822, #00b4ff22);
    border-color: #00ffc8aa;
    box-shadow: 0 0 20px #00ffc822;
    transform: translateY(-1px);
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

const AgentId = styled.div`
  font-size: 9px;
  color: #1e3a2a;
  letter-spacing: 2px;
  text-align: center;
  margin-top: 4px;

  background: linear-gradient(90deg, #1e3a2a, #00ffc8, #00b4ff, #1e3a2a);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
`;

// ─── Animated SVG Elements ─────────────────────────────────────────────────────

const SpinCircle = styled.circle`
  animation: ${spin} ${props => props.duration || '2s'} linear infinite ${props => props.reverse ? 'reverse' : ''};
  transform-origin: ${props => props.origin || 'center'};
`;

const ParticleCircle = styled.circle`
  animation: ${particleFloat} ${props => props.duration}s ease-out ${props => props.delay}s infinite;
  transform-origin: ${props => props.origin};
  opacity: 0;
`;

const GlowPulseRect = styled.rect`
  animation: ${glowPulse} ${props => props.duration || '2s'} ease-in-out ${props => props.delay || '0s'} infinite;
`;

const GlowPulseCircle = styled.circle`
  animation: ${glowPulse} ${props => props.duration || '2s'} ease-in-out infinite;
`;

const LineTravelPath = styled.path`
  animation: ${lineTravel} 1s ease forwards;
`;

const SuccessBurstSvg = styled.svg`
  animation: ${successBurst} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
`;

const DashDrawCircle = styled.circle`
  animation: ${dashDraw} 1s ease forwards 0.2s;
  transform-origin: 50px 50px;
`;

const CheckDrawPolyline = styled.polyline`
  animation: ${checkDraw} ${props => props.duration || '0.5s'} ease forwards ${props => props.delay || '0s'};
`;

const PulseCircle = styled.circle`
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SpinStepCircle = styled.circle`
  animation: ${spin} 6s linear infinite;
  transform-origin: 14px 14px;
`;

// ─── SVG Components ────────────────────────────────────────────────────────────

const ProcessingSVG = ({ step }) => (
    <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Outer rotating ring */}
        <circle
            cx="70" cy="70" r="58"
            fill="none"
            stroke="#0d2030"
            strokeWidth="2"
        />
        <SpinCircle
            cx="70" cy="70" r="58"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="2"
            strokeDasharray="60 300"
            origin="70px 70px"
        />

        {/* Middle ring */}
        <circle
            cx="70" cy="70" r="44"
            fill="none"
            stroke="#0a1820"
            strokeWidth="1"
        />
        <SpinCircle
            cx="70" cy="70" r="44"
            fill="none"
            stroke="#00b4ff33"
            strokeWidth="1"
            strokeDasharray="20 200"
            duration="3s"
            reverse
            origin="70px 70px"
        />

        {/* Inner glow circle */}
        <circle cx="70" cy="70" r="32" fill="#050d18" />
        <circle
            cx="70" cy="70" r="32"
            fill="none"
            stroke="#00ffc822"
            strokeWidth="1"
        />

        {/* Ripple circles */}
        <circle cx="70" cy="70" r="16" fill="none" stroke="#00ffc8" strokeWidth="1.5" opacity="0.6">
            <animate attributeName="r" values="16;38" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="70" cy="70" r="16" fill="none" stroke="#00b4ff" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="16;38" dur="2s" begin="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2s" begin="0.7s" repeatCount="indefinite" />
        </circle>

        {/* Center icon — changes per step */}
        {step === 0 && <AgentIcon cx={70} cy={70} />}
        {step === 1 && <GitIcon cx={70} cy={70} />}
        {step === 2 && <PipelineIcon cx={70} cy={70} />}

        {/* Step nodes on ring */}
        {[0, 1, 2].map((i) => {
            const angle = (i * 120 - 90) * (Math.PI / 180);
            const x = 70 + 58 * Math.cos(angle);
            const y = 70 + 58 * Math.sin(angle);
            const isActive = i <= step;
            return (
                <g key={i}>
                    <circle cx={x} cy={y} r="5" fill={isActive ? '#00ffc8' : '#0d2030'} stroke={isActive ? '#00ffc8' : '#1a3050'} strokeWidth="1.5" />
                    {isActive && <circle cx={x} cy={y} r="5" fill="none" stroke="#00ffc8" strokeWidth="1.5">
                        <animate attributeName="r" values="5;10" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="1.5s" repeatCount="indefinite" />
                    </circle>}
                </g>
            );
        })}

        {/* Floating particles */}
        {[0, 1, 2, 3].map((i) => (
            <ParticleCircle
                key={i}
                cx={70 + (i % 2 === 0 ? 1 : -1) * (10 + i * 5)}
                cy={70}
                r="2"
                fill="#00ffc8"
                duration={1.5 + i * 0.4}
                delay={i * 0.35}
                origin={`${70 + (i % 2 === 0 ? 1 : -1) * (10 + i * 5)}px 70px`}
                style={{
                    '--dx': `${(i % 2 === 0 ? 1 : -1) * (8 + i * 4)}px`
                }}
            />
        ))}

        <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ffc8" />
                <stop offset="100%" stopColor="#00b4ff" />
            </linearGradient>
        </defs>
    </svg>
);

const AgentIcon = ({ cx, cy }) => (
    <g transform={`translate(${cx - 12}, ${cy - 12})`}>
        {/* Robot/agent head */}
        <GlowPulseRect x="3" y="4" width="18" height="14" rx="3" fill="none" stroke="#00ffc8" strokeWidth="1.5" />
        <circle cx="9" cy="10" r="2" fill="#00ffc8" />
        <circle cx="15" cy="10" r="2" fill="#00ffc8" />
        <line x1="8" y1="14" x2="16" y2="14" stroke="#00ffc8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="4" x2="12" y2="2" stroke="#00ffc8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="1.5" r="1.2" fill="#00b4ff" />
    </g>
);

const GitIcon = ({ cx, cy }) => (
    <g transform={`translate(${cx - 10}, ${cy - 12})`}>
        {/* Git branch icon */}
        <GlowPulseCircle cx="4" cy="4" r="3" fill="none" stroke="#00ffc8" strokeWidth="1.5" />
        <circle cx="4" cy="20" r="3" fill="none" stroke="#00ffc8" strokeWidth="1.5" />
        <circle cx="16" cy="8" r="3" fill="none" stroke="#00b4ff" strokeWidth="1.5" />
        <line x1="4" y1="7" x2="4" y2="17" stroke="#00ffc8" strokeWidth="1.5" />
        <LineTravelPath d="M4 7 Q4 4 16 8" fill="none" stroke="#00b4ff" strokeWidth="1.5" strokeLinecap="round"
            style={{ strokeDasharray: 20, strokeDashoffset: 20 }} />
    </g>
);

const PipelineIcon = ({ cx, cy }) => (
    <g transform={`translate(${cx - 14}, ${cy - 10})`}>
        {/* Pipeline stages */}
        {[0, 1, 2].map((i) => (
            <g key={i}>
                <GlowPulseRect x={i * 9} y="0" width="7" height="20" rx="2" fill="none" stroke={i === 0 ? '#00ffc8' : i === 1 ? '#00b4ff' : '#7c3aed'} strokeWidth="1.5" duration={1.5 + i * 0.3} delay={`${i * 0.2}s`} />
                <rect x={i * 9 + 1.5} y="3" width="4" height="2" rx="0.5" fill={i === 0 ? '#00ffc8' : i === 1 ? '#00b4ff' : '#7c3aed'} opacity="0.7" />
                <rect x={i * 9 + 1.5} y="7" width="4" height="2" rx="0.5" fill={i === 0 ? '#00ffc8' : i === 1 ? '#00b4ff' : '#7c3aed'} opacity="0.4" />
            </g>
        ))}
        {/* Arrows between */}
        <path d="M8 10 L10 10" stroke="#4a6080" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M17 10 L19 10" stroke="#4a6080" strokeWidth="1.2" strokeLinecap="round" />
    </g>
);

const SuccessSVG = () => (
    <SuccessBurstSvg width="100" height="100" viewBox="0 0 100 100">
        <defs>
            <radialGradient id="successGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00ffc822" />
                <stop offset="100%" stopColor="#00ffc800" />
            </radialGradient>
        </defs>

        {/* Background glow */}
        <circle cx="50" cy="50" r="46" fill="url(#successGrad)" />

        {/* Outer ring */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="#00ffc8" strokeWidth="1.5" opacity="0.3" />
        <DashDrawCircle cx="50" cy="50" r="42" fill="none" stroke="#00ffc8" strokeWidth="2"
            strokeDasharray="264" strokeDashoffset="264"
            style={{ strokeDashoffset: '264' }}>
            <animate attributeName="stroke-dashoffset" from="264" to="0" dur="1s" begin="0.2s" fill="freeze" />
        </DashDrawCircle>

        {/* Burst rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = deg * Math.PI / 180;
            const x1 = 50 + 30 * Math.cos(rad);
            const y1 = 50 + 30 * Math.sin(rad);
            const x2 = 50 + 40 * Math.cos(rad);
            const y2 = 50 + 40 * Math.sin(rad);
            return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#00ffc8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
                    <animate attributeName="opacity" from="0" to="0.5" dur="0.3s" begin={`${0.8 + i * 0.05}s`} fill="freeze" />
                </line>
            );
        })}

        {/* Inner filled circle */}
        <circle cx="50" cy="50" r="22" fill="#050d18" stroke="#00ffc8" strokeWidth="1.5">
            <animate attributeName="r" from="0" to="22" dur="0.4s" begin="0.3s" fill="freeze" />
        </circle>

        {/* Checkmark */}
        <CheckDrawPolyline points="38,50 46,58 62,42"
            fill="none" stroke="#00ffc8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="50" strokeDashoffset="50" delay="0.7s">
            <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.5s" begin="0.7s" fill="freeze" />
        </CheckDrawPolyline>
    </SuccessBurstSvg>
);

// ─── Step Icon ─────────────────────────────────────────────────────────────────

const StepIcon = ({ status, icon }) => {
    if (status === 'done') {
        return (
            <svg width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="13" fill="#00ffc811" stroke="#00ffc8" strokeWidth="1.5" />
                <CheckDrawPolyline points="8,14 12,18 20,10" fill="none" stroke="#00ffc8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="20" strokeDashoffset="20" duration="0.4s">
                    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.4s" fill="freeze" />
                </CheckDrawPolyline>
            </svg>
        );
    }

    if (status === 'active') {
        return (
            <svg width="28" height="28" viewBox="0 0 28 28">
                <SpinStepCircle cx="14" cy="14" r="13" fill="#00ffc808" stroke="#00ffc8" strokeWidth="1.5" strokeDasharray="5 3" />
                <PulseCircle cx="14" cy="14" r="4" fill="#00ffc8" />
            </svg>
        );
    }

    return (
        <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="13" fill="none" stroke="#1a2e48" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="4" fill="#1a2e48" />
        </svg>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const STEPS = [
    {
        label: "Initializing Agent",
        subLabel: "PROVISIONING · AGENT CONFIG",
        terminal: "agent.init() → bootstrapping runtime...",
    },
    {
        label: "Creating Git Repository",
        subLabel: "VERSION CONTROL · SCAFFOLDING",
        terminal: "git.createRepo() → setting upstream...",
    },
    {
        label: "Triggering Pipeline",
        subLabel: "CI/CD · DEPLOY SEQUENCE",
        terminal: "pipeline.trigger() → stages queued...",
    },
];

/**
 * AgentCreationStatus
 *
 * Props:
 *   status        — 'creating' | 'success'
 *   currentStep   — 0 | 1 | 2  (index of active step, used when status='creating')
 *   agentName     — string (optional)
 *   agentId       — string (optional, shown in success state)
 *   viewHref      — string (link for "View Agent" button)
 *   onViewClick   — function (optional callback)
 */
export const AgentCreationStatus = ({
    status = "creating",
    currentStep = 0,
    agentName = "my-agent",
    agentId = "AGT-7F3A2B",
    viewHref = "#",
    onViewClick,
}) => {
    const [visibleSteps, setVisibleSteps] = useState([]);

    useEffect(() => {
        if (status === "creating") {
            const timers = [];
            for (let i = 0; i <= currentStep; i++) {
                timers.push(setTimeout(() => {
                    setVisibleSteps((prev) => prev.includes(i) ? prev : [...prev, i]);
                }, i * 180));
            }
            return () => timers.forEach(clearTimeout);
        } else {
            setVisibleSteps([0, 1, 2]);
        }
    }, [currentStep, status]);

    const getStepStatus = (index) => {
        if (status === "success") return "done";
        if (index < currentStep) return "done";
        if (index === currentStep) return "active";
        return "pending";
    };

    return (
        <Wrapper>
            <GridBg />

            <Header>
                <HeaderDot color={status === "success" ? "#00ffc8" : "#00b4ff"} />
                <HeaderTitle>
                    {status === "success" ? "agent deployed" : "agent deployment"}
                </HeaderTitle>
            </Header>

            {status === "creating" ? (
                <>
                    <CentralSVGArea>
                        <ProcessingSVG step={currentStep} />
                    </CentralSVGArea>

                    <StepList>
                        {STEPS.map((step, i) => {
                            const stepStatus = getStepStatus(i);
                            const isLast = i === STEPS.length - 1;
                            return (
                                <StepRow key={i} visible={visibleSteps.includes(i)} style={{ animationDelay: `${i * 0.1}s` }}>
                                    {!isLast && <StepConnector done={stepStatus === "done"} />}
                                    <StepIconWrap>
                                        <StepIcon status={stepStatus} />
                                    </StepIconWrap>
                                    <StepContent>
                                        <StepLabel status={stepStatus}>{step.label}</StepLabel>
                                        <StepSubLabel status={stepStatus}>{step.subLabel}</StepSubLabel>
                                        {stepStatus === "active" && (
                                            <TerminalLine>
                                                {step.terminal}
                                                <span className="cursor" />
                                            </TerminalLine>
                                        )}
                                        {stepStatus === "done" && (
                                            <TerminalLine style={{ color: "#00ffc844" }}>
                                                {step.terminal.replace("...", " ✓")}
                                            </TerminalLine>
                                        )}
                                    </StepContent>
                                </StepRow>
                            );
                        })}
                    </StepList>
                </>
            ) : (
                <SuccessContainer>
                    <SuccessSVG />
                    <SuccessMessage>
                        <SuccessTitle>🎉 Agent Ready</SuccessTitle>
                        <SuccessSubtext>
                            <strong style={{ color: "#e0eeff" }}>{agentName}</strong> has been created,
                            <br />
                            your repo is live and pipeline is running.
                        </SuccessSubtext>
                    </SuccessMessage>
                    <ViewButton href={viewHref} onClick={onViewClick}>
                        View Agent Dashboard
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7h10M8 3l4 4-4 4" stroke="#00ffc8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </ViewButton>
                    <AgentId>ID: {agentId} · OPERATIONAL</AgentId>
                </SuccessContainer>
            )}
        </Wrapper>
    );
};

// ─── Demo wrapper (remove in production) ──────────────────────────────────────

export default function Demo() {
    const [phase, setPhase] = useState("creating");
    const [step, setStep] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setStep((s) => {
                if (s < 2) return s + 1;
                clearInterval(intervalRef.current);
                setTimeout(() => setPhase("success"), 1200);
                return s;
            });
        }, 2000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const reset = () => {
        setPhase("creating");
        setStep(0);
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setStep((s) => {
                if (s < 2) return s + 1;
                clearInterval(intervalRef.current);
                setTimeout(() => setPhase("success"), 1200);
                return s;
            });
        }, 2000);
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#050810",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            padding: 24,
            fontFamily: "JetBrains Mono, monospace",
        }}>
            <AgentCreationStatus
                status={phase}
                currentStep={step}
                agentName="data-pipeline-agent"
                agentId="AGT-7F3A2B"
                viewHref="#"
            />
            <button
                onClick={reset}
                style={{
                    background: "none",
                    border: "1px solid #1a2e48",
                    color: "#4a6080",
                    padding: "8px 16px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 11,
                    letterSpacing: "1px",
                }}
            >
                ↺ REPLAY
            </button>
        </div>
    );
}