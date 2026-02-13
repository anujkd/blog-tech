import React, { useState, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    overflow-x: hidden;
  }
`;

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const dataFlow = keyframes`
  0% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
`;

const typingAnimation = keyframes`
  0%, 100% {
    width: 0;
  }
  50% {
    width: 100%;
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fffe 0%, #e8f5f3 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(0, 103, 71, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -300px;
    left: -300px;
    width: 900px;
    height: 900px;
    background: radial-gradient(circle, rgba(0, 168, 126, 0.06) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 32px 80px;
  background: transparent;
  position: relative;
  z-index: 10;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    padding: 24px 24px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LloydsSVG = styled.svg`
  width: 52px;
  height: 52px;
`;

const EnvoyText = styled.h2`
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #006747 0%, #00a87e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  padding: 40px 80px 60px 80px;
  max-width: 1500px;
  margin: 0 auto;
  align-items: center;
  min-height: calc(100vh - 116px);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 60px 40px;
    gap: 60px;
  }

  @media (max-width: 768px) {
    padding: 40px 24px;
  }
`;

const LeftSection = styled.div`
  animation: ${slideInLeft} 1s ease-out;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 103, 71, 0.08);
  border-radius: 50px;
  margin-bottom: 24px;
  animation: ${fadeInUp} 1s ease-out 0.2s both;
`;

const BadgeText = styled.span`
  color: #006747;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const SparkleIcon = styled.span`
  font-size: 16px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Title = styled.h1`
  font-size: 56px;
  font-weight: 800;
  color: #101828;
  line-height: 1.1;
  margin-bottom: 24px;
  animation: ${fadeInUp} 1s ease-out 0.4s both;

  @media (max-width: 768px) {
    font-size: 42px;
  }
`;

const Highlight = styled.span`
  background: linear-gradient(135deg, #006747 0%, #00a87e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #006747 0%, #00a87e 100%);
    border-radius: 2px;
    opacity: 0.3;
  }
`;

const Description = styled.p`
  font-size: 20px;
  color: #475467;
  line-height: 1.6;
  margin-bottom: 40px;
  animation: ${fadeInUp} 1s ease-out 0.6s both;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  animation: ${fadeInUp} 1s ease-out 0.8s both;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const PrimaryButton = styled.button`
  padding: 16px 32px;
  background: linear-gradient(135deg, #006747 0%, #00a87e 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 103, 71, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 103, 71, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  padding: 16px 32px;
  background: white;
  color: #006747;
  border: 2px solid #006747;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #006747;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 103, 71, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  animation: ${fadeInUp} 1s ease-out 1s both;

  @media (max-width: 480px) {
    gap: 24px;
  }
`;

const StatItem = styled.div`
  text-align: left;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #006747;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #667085;
  font-weight: 500;
`;

const RightSection = styled.div`
  position: relative;
  animation: ${slideInRight} 1s ease-out;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AnimationContainer = styled.div`
  width: 100%;
  max-width: 650px;
  animation: ${float} 6s ease-in-out infinite;
`;

const SVGContainer = styled.svg`
  width: 100%;
  height: auto;
  filter: drop-shadow(0 20px 40px rgba(0, 103, 71, 0.15));
`;

// Main Component
const EnvoyLandingPage = () => {
  const [activeAgent, setActiveAgent] = useState(0);
  const [deployProgress, setDeployProgress] = useState(0);

  useEffect(() => {
    const agentInterval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % 3);
    }, 3000);

    const progressInterval = setInterval(() => {
      setDeployProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 60);

    return () => {
      clearInterval(agentInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <Logo>
            <LloydsSVG viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="25" fill="#006747" stroke="#006747" strokeWidth="2"/>
              <path
                d="M26 9C21.5 9 17 11.5 17 16C17 18.5 18.5 20.5 19.5 21.5C18 22.5 17 25 17 27.5C17 32 19.5 34.5 22 36.5C19.5 38 17 40.5 17 44C17 46.5 19.5 49 26 49C32.5 49 35 46.5 35 44C35 40.5 32.5 38 30 36.5C32.5 34.5 35 32 35 27.5C35 25 34 22.5 32.5 21.5C33.5 20.5 35 18.5 35 16C35 11.5 30.5 9 26 9Z"
                fill="white"
              />
              <ellipse cx="26" cy="18" rx="5" ry="6" fill="white"/>
              <ellipse cx="26" cy="32" rx="6" ry="7" fill="white"/>
            </LloydsSVG>
            <EnvoyText>Envoy</EnvoyText>
          </Logo>
        </Header>

        <MainContent>
          <LeftSection>
            <Badge>
              <SparkleIcon>✨</SparkleIcon>
              <BadgeText>AI-POWERED AUTOMATION</BadgeText>
            </Badge>
            <Title>
              Build Intelligent <Highlight>AI Agents</Highlight> in Minutes
            </Title>
            <Description>
              Envoy empowers you to create, deploy, and manage AI agents that transform your business operations. 
              From customer service to data analysis, automate workflows with enterprise-grade security.
            </Description>
            <ButtonGroup>
              <PrimaryButton>Let's Explore →</PrimaryButton>
              <SecondaryButton>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.3 2.84A1 1 0 004 3.5v13a1 1 0 001.6.8l10-6.5a1 1 0 000-1.6l-10-6.5a1 1 0 00-.3-.36z"/>
                </svg>
                Watch Demo
              </SecondaryButton>
            </ButtonGroup>
            <Stats>
              <StatItem>
                <StatNumber>99.9%</StatNumber>
                <StatLabel>Uptime SLA</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>50+</StatNumber>
                <StatLabel>AI Models</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>24/7</StatNumber>
                <StatLabel>Support</StatLabel>
              </StatItem>
            </Stats>
          </LeftSection>

          <RightSection>
            <AnimationContainer>
              <SVGContainer viewBox="0 0 600 650" fill="none">
                <defs>
                  <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#006747" />
                    <stop offset="100%" stopColor="#00a87e" />
                  </linearGradient>
                  <linearGradient id="lightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e8f5f3" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                  <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00a87e" />
                    <stop offset="100%" stopColor="#00d9a3" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.1"/>
                  </filter>
                </defs>

                {/* Animated Background Orbs */}
                <circle cx="500" cy="100" r="80" fill="url(#primaryGradient)" opacity="0.05">
                  <animate attributeName="r" values="80;100;80" dur="5s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="550" r="100" fill="url(#successGradient)" opacity="0.04">
                  <animate attributeName="r" values="100;120;100" dur="6s" repeatCount="indefinite" />
                </circle>

                {/* Code Editor Panel - Top Left */}
                <g filter="url(#shadow)">
                  <rect x="30" y="40" width="240" height="180" rx="12" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
                  
                  {/* Editor Header */}
                  <rect x="30" y="40" width="240" height="36" rx="12" fill="url(#lightGradient)"/>
                  <circle cx="50" cy="58" r="4" fill="#ff5f57"/>
                  <circle cx="65" cy="58" r="4" fill="#ffbd2e"/>
                  <circle cx="80" cy="58" r="4" fill="#28ca42"/>
                  <text x="100" y="63" fill="#667085" fontSize="11" fontWeight="600">agent-config.json</text>
                  
                  {/* Code Lines */}
                  <rect x="45" y="90" width="80" height="6" rx="3" fill="#006747" opacity="0.3">
                    <animate attributeName="width" values="80;120;80" dur="3s" repeatCount="indefinite" />
                  </rect>
                  <rect x="45" y="105" width="140" height="6" rx="3" fill="#00a87e" opacity="0.25"/>
                  <rect x="55" y="120" width="100" height="6" rx="3" fill="#006747" opacity="0.2"/>
                  <rect x="55" y="135" width="120" height="6" rx="3" fill="#00a87e" opacity="0.2"/>
                  <rect x="45" y="150" width="90" height="6" rx="3" fill="#006747" opacity="0.25"/>
                  
                  {/* Typing Cursor */}
                  <rect x="138" y="150" width="2" height="8" fill="#006747">
                    <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
                  </rect>
                  
                  {/* Status Badge */}
                  <rect x="45" y="180" width="70" height="20" rx="10" fill="#e8f5f3"/>
                  <circle cx="58" cy="190" r="3" fill="#00a87e">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text x="68" y="195" fill="#006747" fontSize="10" fontWeight="600">Building</text>
                </g>

                {/* Data Flow Lines from Code to Agents */}
                <g stroke="url(#primaryGradient)" strokeWidth="2" strokeDasharray="5,5" opacity="0.5">
                  <path d="M 270 130 Q 300 200, 180 280">
                    <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite" />
                  </path>
                  <path d="M 270 130 Q 320 220, 300 320">
                    <animate attributeName="stroke-dashoffset" values="0;-10" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <path d="M 270 130 Q 340 240, 420 360">
                    <animate attributeName="stroke-dashoffset" values="0;-10" dur="1.4s" repeatCount="indefinite" />
                  </path>
                </g>

                {/* Agent Card 1 - Customer Service */}
                <g filter="url(#shadow)" opacity={activeAgent === 0 ? "1" : "0.5"} style={{ transition: 'opacity 0.5s' }}>
                  <rect x="40" y="270" width="180" height="140" rx="16" fill="white" stroke={activeAgent === 0 ? "url(#primaryGradient)" : "#e5e7eb"} strokeWidth="3"/>
                  
                  {/* Icon */}
                  <circle cx="80" cy="310" r="20" fill="url(#primaryGradient)" opacity="0.15"/>
                  <path d="M75 305 L75 315 M70 310 L80 310 M77 307 C79 307 81 309 81 311 M83 313 C83 315 81 317 79 317" 
                    stroke="url(#primaryGradient)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  
                  {/* Title */}
                  <text x="110" y="310" fill="#101828" fontSize="14" fontWeight="700">Customer</text>
                  <text x="110" y="325" fill="#101828" fontSize="14" fontWeight="700">Service Bot</text>
                  
                  {/* Status */}
                  <rect x="50" y="345" width="160" height="50" rx="8" fill="#f9fafb"/>
                  
                  {/* Metrics */}
                  <text x="60" y="363" fill="#667085" fontSize="10">Responses</text>
                  <text x="140" y="363" fill="#006747" fontSize="12" fontWeight="700">1.2K</text>
                  
                  <text x="60" y="383" fill="#667085" fontSize="10">Accuracy</text>
                  <text x="140" y="383" fill="#006747" fontSize="12" fontWeight="700">98.5%</text>
                  
                  {activeAgent === 0 && (
                    <circle cx="205" cy="285" r="6" fill="#00a87e">
                      <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>

                {/* Agent Card 2 - Data Analysis */}
                <g filter="url(#shadow)" opacity={activeAgent === 1 ? "1" : "0.5"} style={{ transition: 'opacity 0.5s' }}>
                  <rect x="240" y="310" width="180" height="140" rx="16" fill="white" stroke={activeAgent === 1 ? "url(#primaryGradient)" : "#e5e7eb"} strokeWidth="3"/>
                  
                  {/* Icon */}
                  <circle cx="280" cy="350" r="20" fill="url(#successGradient)" opacity="0.15"/>
                  <path d="M270 360 L275 355 L280 358 L285 350 L290 353" 
                    stroke="url(#successGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="275" cy="355" r="1.5" fill="url(#successGradient)"/>
                  <circle cx="280" cy="358" r="1.5" fill="url(#successGradient)"/>
                  <circle cx="285" cy="350" r="1.5" fill="url(#successGradient)"/>
                  
                  {/* Title */}
                  <text x="310" y="350" fill="#101828" fontSize="14" fontWeight="700">Data Analysis</text>
                  <text x="310" y="365" fill="#101828" fontSize="14" fontWeight="700">Agent</text>
                  
                  {/* Status */}
                  <rect x="250" y="385" width="160" height="50" rx="8" fill="#f9fafb"/>
                  
                  {/* Metrics */}
                  <text x="260" y="403" fill="#667085" fontSize="10">Reports</text>
                  <text x="340" y="403" fill="#006747" fontSize="12" fontWeight="700">847</text>
                  
                  <text x="260" y="423" fill="#667085" fontSize="10">Insights</text>
                  <text x="340" y="423" fill="#006747" fontSize="12" fontWeight="700">2.1K</text>
                  
                  {activeAgent === 1 && (
                    <circle cx="405" cy="325" r="6" fill="#00a87e">
                      <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>

                {/* Agent Card 3 - Workflow Automation */}
                <g filter="url(#shadow)" opacity={activeAgent === 2 ? "1" : "0.5"} style={{ transition: 'opacity 0.5s' }}>
                  <rect x="440" y="350" width="140" height="140" rx="16" fill="white" stroke={activeAgent === 2 ? "url(#primaryGradient)" : "#e5e7eb"} strokeWidth="3"/>
                  
                  {/* Icon */}
                  <circle cx="475" cy="385" r="18" fill="url(#primaryGradient)" opacity="0.15"/>
                  <path d="M468 385 L475 392 L482 378" 
                    stroke="url(#primaryGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  
                  {/* Title */}
                  <text x="500" y="385" fill="#101828" fontSize="12" fontWeight="700">Workflow</text>
                  <text x="500" y="398" fill="#101828" fontSize="12" fontWeight="700">Automation</text>
                  
                  {/* Status */}
                  <rect x="450" y="415" width="120" height="60" rx="8" fill="#f9fafb"/>
                  
                  {/* Metrics */}
                  <text x="460" y="433" fill="#667085" fontSize="9">Tasks</text>
                  <text x="530" y="433" fill="#006747" fontSize="11" fontWeight="700">5.3K</text>
                  
                  <text x="460" y="453" fill="#667085" fontSize="9">Efficiency</text>
                  <text x="530" y="453" fill="#006747" fontSize="11" fontWeight="700">95%</text>
                  
                  <text x="460" y="468" fill="#667085" fontSize="9">Uptime</text>
                  <text x="530" y="468" fill="#006747" fontSize="11" fontWeight="700">99.9%</text>
                  
                  {activeAgent === 2 && (
                    <circle cx="565" cy="365" r="6" fill="#00a87e">
                      <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>

                {/* Deployment Panel - Bottom */}
                <g filter="url(#shadow)">
                  <rect x="80" y="500" width="440" height="110" rx="16" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
                  
                  {/* Header */}
                  <text x="100" y="530" fill="#101828" fontSize="16" fontWeight="700">Deployment Pipeline</text>
                  
                  {/* Status Badge */}
                  <rect x="340" y="516" width="160" height="24" rx="12" fill="#e8f5f3"/>
                  <circle cx="355" cy="528" r="4" fill="#00a87e">
                    <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
                  </circle>
                  <text x="368" y="533" fill="#006747" fontSize="12" fontWeight="600">Deploying to Production</text>
                  
                  {/* Progress Bar */}
                  <rect x="100" y="550" width="380" height="8" rx="4" fill="#e8f5f3"/>
                  <rect x="100" y="550" width={`${(deployProgress / 100) * 380}`} height="8" rx="4" fill="url(#primaryGradient)"/>
                  
                  {/* Progress Text */}
                  <text x="100" y="578" fill="#667085" fontSize="11">{Math.round(deployProgress)}% Complete</text>
                  
                  {/* Time Estimate */}
                  <text x="420" y="578" fill="#667085" fontSize="11">~{Math.round((100 - deployProgress) * 0.3)}s remaining</text>
                  
                  {/* Environment Tags */}
                  <g>
                    <rect x="100" y="588" width="60" height="16" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1"/>
                    <text x="115" y="599" fill="#166534" fontSize="9" fontWeight="600">✓ Dev</text>
                    
                    <rect x="168" y="588" width="70" height="16" rx="8" fill="#f0fdf4" stroke="#86efac" strokeWidth="1"/>
                    <text x="180" y="599" fill="#166534" fontSize="9" fontWeight="600">✓ Staging</text>
                    
                    <rect x="246" y="588" width="60" height="16" rx="8" fill={deployProgress > 50 ? "#f0fdf4" : "#f9fafb"} stroke={deployProgress > 50 ? "#86efac" : "#e5e7eb"} strokeWidth="1"/>
                    <text x="258" y="599" fill={deployProgress > 50 ? "#166534" : "#667085"} fontSize="9" fontWeight="600">{deployProgress > 50 ? "✓" : "○"} Prod</text>
                  </g>
                </g>

                {/* Floating Data Particles */}
                {[...Array(8)].map((_, i) => (
                  <circle
                    key={i}
                    cx={100 + i * 70}
                    cy={150 + (i % 2) * 300}
                    r="2.5"
                    fill={i % 2 === 0 ? "#006747" : "#00a87e"}
                    opacity="0.4"
                  >
                    <animate
                      attributeName="cy"
                      values={`${150 + (i % 2) * 300};${140 + (i % 2) * 300};${150 + (i % 2) * 300}`}
                      dur={`${2.5 + i * 0.3}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.4;0.8;0.4"
                      dur={`${2.5 + i * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}

                {/* Connection Lines between Agents */}
                <g stroke="#006747" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.2">
                  <path d="M 220 340 L 240 380">
                    <animate attributeName="stroke-dashoffset" values="0;-8" dur="1s" repeatCount="indefinite" />
                  </path>
                  <path d="M 420 380 L 440 420">
                    <animate attributeName="stroke-dashoffset" values="0;-8" dur="1.2s" repeatCount="indefinite" />
                  </path>
                </g>

              </SVGContainer>
            </AnimationContainer>
          </RightSection>
        </MainContent>
      </Container>
    </>
  );
};

export default EnvoyLandingPage;