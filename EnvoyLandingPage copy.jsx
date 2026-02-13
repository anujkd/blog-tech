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
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
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

const drawLine = keyframes`
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
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
    top: 0;
    right: 0;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(0, 103, 71, 0.05) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 80px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LloydsSVG = styled.svg`
  width: 48px;
  height: 48px;
`;

const BrandText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
`;

const LloydsText = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #006747;
  letter-spacing: -0.5px;
`;

const Divider = styled.span`
  width: 2px;
  height: 24px;
  background: #d0d5dd;
`;

const EnvoyText = styled.h2`
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #006747 0%, #00a87e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 32px;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: #475467;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s ease;
  cursor: pointer;

  &:hover {
    color: #006747;
  }
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  padding: 80px 80px 60px 80px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: center;
  min-height: calc(100vh - 96px);

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
  max-width: 600px;
  animation: ${float} 6s ease-in-out infinite;
`;

const SVGContainer = styled.svg`
  width: 100%;
  height: auto;
  filter: drop-shadow(0 20px 40px rgba(0, 103, 71, 0.1));
`;

// Main Component
const EnvoyLandingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Create', 'Configure', 'Deploy', 'Monitor'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <Logo>
            <LloydsSVG viewBox="0 0 48 48" fill="none">
              {/* Lloyds Bank Horse Logo */}
              <circle cx="24" cy="24" r="23" fill="#006747" stroke="#006747" strokeWidth="2"/>
              <path
                d="M24 8C20 8 16 10 16 14C16 16 17 18 18 19C17 20 16 22 16 24C16 28 18 30 20 32C18 33 16 35 16 38C16 40 18 42 24 42C30 42 32 40 32 38C32 35 30 33 28 32C30 30 32 28 32 24C32 22 31 20 30 19C31 18 32 16 32 14C32 10 28 8 24 8Z"
                fill="white"
              />
              <ellipse cx="24" cy="16" rx="4" ry="5" fill="white"/>
              <ellipse cx="24" cy="28" rx="5" ry="6" fill="white"/>
            </LloydsSVG>
            <BrandText>
              <LloydsText>Lloyds Bank</LloydsText>
              <Divider />
              <EnvoyText>Envoy</EnvoyText>
            </BrandText>
          </Logo>
          <NavLinks>
            <NavLink>Features</NavLink>
            <NavLink>Solutions</NavLink>
            <NavLink>Resources</NavLink>
            <NavLink>Contact</NavLink>
          </NavLinks>
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
              <SVGContainer viewBox="0 0 500 500" fill="none">
                {/* Background Glow */}
                <defs>
                  <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#006747" />
                    <stop offset="100%" stopColor="#00a87e" />
                  </linearGradient>
                  <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00a87e" />
                    <stop offset="100%" stopColor="#00d9a3" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Animated Background Circles */}
                <circle cx="250" cy="250" r="180" fill="url(#primaryGradient)" opacity="0.05">
                  <animate attributeName="r" values="180;200;180" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="250" cy="250" r="140" fill="url(#secondaryGradient)" opacity="0.08">
                  <animate attributeName="r" values="140;160;140" dur="3s" repeatCount="indefinite" />
                </circle>

                {/* Central Hub */}
                <g>
                  <circle cx="250" cy="250" r="50" fill="white" stroke="url(#primaryGradient)" strokeWidth="3" filter="url(#glow)">
                    <animate attributeName="stroke-width" values="3;5;3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x="250" y="245" textAnchor="middle" fill="url(#primaryGradient)" fontSize="16" fontWeight="bold">AI</text>
                  <text x="250" y="262" textAnchor="middle" fill="url(#primaryGradient)" fontSize="14" fontWeight="600">Agent</text>
                </g>

                {/* Step 1: Create - Top */}
                <g opacity={currentStep === 0 ? "1" : "0.4"} style={{ transition: 'opacity 0.5s' }}>
                  <circle cx="250" cy="100" r="35" fill={currentStep === 0 ? "url(#primaryGradient)" : "#e8f5f3"} stroke="#006747" strokeWidth="2">
                    {currentStep === 0 && (
                      <animate attributeName="r" values="35;40;35" dur="1s" repeatCount="indefinite" />
                    )}
                  </circle>
                  <path d="M240 100 L260 100 M250 90 L250 110" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <text x="250" y="75" textAnchor="middle" fill="#006747" fontSize="14" fontWeight="600">Create</text>
                  <line x1="250" y1="135" x2="250" y2="200" stroke="url(#primaryGradient)" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite" />
                  </line>
                </g>

                {/* Step 2: Configure - Right */}
                <g opacity={currentStep === 1 ? "1" : "0.4"} style={{ transition: 'opacity 0.5s' }}>
                  <circle cx="380" cy="250" r="35" fill={currentStep === 1 ? "url(#primaryGradient)" : "#e8f5f3"} stroke="#006747" strokeWidth="2">
                    {currentStep === 1 && (
                      <animate attributeName="r" values="35;40;35" dur="1s" repeatCount="indefinite" />
                    )}
                  </circle>
                  <path d="M370 245 L375 250 L385 240 M370 255 L375 260 L385 250" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <text x="380" y="230" textAnchor="middle" fill="#006747" fontSize="14" fontWeight="600">Configure</text>
                  <line x1="300" y1="250" x2="345" y2="250" stroke="url(#primaryGradient)" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite" />
                  </line>
                </g>

                {/* Step 3: Deploy - Bottom */}
                <g opacity={currentStep === 2 ? "1" : "0.4"} style={{ transition: 'opacity 0.5s' }}>
                  <circle cx="250" cy="400" r="35" fill={currentStep === 2 ? "url(#primaryGradient)" : "#e8f5f3"} stroke="#006747" strokeWidth="2">
                    {currentStep === 2 && (
                      <animate attributeName="r" values="35;40;35" dur="1s" repeatCount="indefinite" />
                    )}
                  </circle>
                  <path d="M240 395 L250 405 L260 395 M245 390 L250 395 M255 390 L250 395" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <text x="250" y="430" textAnchor="middle" fill="#006747" fontSize="14" fontWeight="600">Deploy</text>
                  <line x1="250" y1="300" x2="250" y2="365" stroke="url(#primaryGradient)" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite" />
                  </line>
                </g>

                {/* Step 4: Monitor - Left */}
                <g opacity={currentStep === 3 ? "1" : "0.4"} style={{ transition: 'opacity 0.5s' }}>
                  <circle cx="120" cy="250" r="35" fill={currentStep === 3 ? "url(#primaryGradient)" : "#e8f5f3"} stroke="#006747" strokeWidth="2">
                    {currentStep === 3 && (
                      <animate attributeName="r" values="35;40;35" dur="1s" repeatCount="indefinite" />
                    )}
                  </circle>
                  <rect x="110" y="243" width="20" height="14" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                  <line x1="115" y1="248" x2="125" y2="248" stroke="white" strokeWidth="1.5"/>
                  <line x1="115" y1="252" x2="125" y2="252" stroke="white" strokeWidth="1.5"/>
                  <text x="120" y="230" textAnchor="middle" fill="#006747" fontSize="14" fontWeight="600">Monitor</text>
                  <line x1="155" y1="250" x2="200" y2="250" stroke="url(#primaryGradient)" strokeWidth="2" strokeDasharray="5,5">
                    <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite" />
                  </line>
                </g>

                {/* Floating Particles */}
                <circle cx="150" cy="150" r="3" fill="#00a87e" opacity="0.6">
                  <animate attributeName="cy" values="150;140;150" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="350" cy="150" r="3" fill="#006747" opacity="0.6">
                  <animate attributeName="cy" values="150;160;150" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="150" cy="350" r="3" fill="#00d9a3" opacity="0.6">
                  <animate attributeName="cy" values="350;340;350" dur="3.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="3.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="350" cy="350" r="3" fill="#006747" opacity="0.6">
                  <animate attributeName="cy" values="350;360;350" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2.8s" repeatCount="indefinite" />
                </circle>

                {/* Status Indicator */}
                <g>
                  <rect x="200" y="470" width="100" height="20" rx="10" fill="white" stroke="#006747" strokeWidth="2"/>
                  <circle cx="215" cy="480" r="4" fill="#00a87e">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                  </circle>
                  <text x="230" y="485" fill="#006747" fontSize="11" fontWeight="600">{steps[currentStep]}</text>
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
