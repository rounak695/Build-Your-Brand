"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RobotAgentProps {
  agentId: string;
  typing?: boolean;
  size?: number | string;
  className?: string;
  headOnly?: boolean;
}

export default function RobotAgent({
  agentId,
  typing = true,
  size = 120,
  className,
  headOnly = false,
}: RobotAgentProps) {
  // Map agent ID to robot style characteristics
  const getAgentConfig = (id: string) => {
    switch (id.toLowerCase()) {
      case "ceo":
        return {
          headColor: "#D36B66", // Coral red
          bodyColor: "#A8534F",
          shadowColor: "#4A1E1C",
          name: "Nova",
        };
      case "product":
        return {
          headColor: "#9D8EE0", // Purple
          bodyColor: "#7C6CB7",
          shadowColor: "#4C3D82",
          name: "Mira",
        };
      case "growth":
        return {
          headColor: "#8AC2D1", // Teal blue
          bodyColor: "#6A9EAD",
          shadowColor: "#477380",
          name: "Ari",
        };
      case "operations":
      default:
        return {
          headColor: "#F3B562", // Golden yellow
          bodyColor: "#C98E3B",
          shadowColor: "#573B11",
          name: "Noah",
        };
    }
  };

  const config = getAgentConfig(agentId);

  // Embedded unique animations per agent to prevent collisions
  const animationStyles = `
    @keyframes type-left-${agentId} {
      0% { transform: translate(0px, 0px); }
      100% { transform: translate(1px, -5px); }
    }
    @keyframes type-right-${agentId} {
      0% { transform: translate(0px, -5px); }
      100% { transform: translate(-1px, 0px); }
    }
    @keyframes bob-head-${agentId} {
      0% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-2px) rotate(0.5deg); }
      100% { transform: translateY(0px) rotate(0deg); }
    }
    @keyframes key-press-a {
      0% { opacity: 0.7; fill: #C084FC; }
      50% { opacity: 1; fill: #A78BFA; }
      100% { opacity: 0.7; fill: #C084FC; }
    }
    @keyframes key-press-b {
      0% { opacity: 1; fill: #60A5FA; }
      50% { opacity: 0.6; fill: #93C5FD; }
      100% { opacity: 1; fill: #60A5FA; }
    }
    @keyframes key-press-c {
      0% { opacity: 0.8; fill: #34D399; }
      50% { opacity: 1; fill: #6EE7B7; }
      100% { opacity: 0.8; fill: #34D399; }
    }
    @keyframes key-press-d {
      0% { opacity: 1; fill: #F472B6; }
      50% { opacity: 0.7; fill: #FBCFE8; }
      100% { opacity: 1; fill: #F472B6; }
    }

    .hand-l-${agentId} {
      animation: ${typing ? `type-left-${agentId} 0.16s ease-in-out infinite alternate` : "none"};
      transform-origin: 55px 145px;
    }
    .hand-r-${agentId} {
      animation: ${typing ? `type-right-${agentId} 0.16s ease-in-out infinite alternate 0.08s` : "none"};
      transform-origin: 145px 145px;
    }
    .head-${agentId} {
      animation: bob-head-${agentId} 2.5s ease-in-out infinite;
      transform-origin: 100px 125px;
    }
    .key-a { animation: ${typing ? "key-press-a 0.4s infinite" : "none"}; }
    .key-b { animation: ${typing ? "key-press-b 0.5s infinite 0.1s" : "none"}; }
    .key-c { animation: ${typing ? "key-press-c 0.3s infinite 0.2s" : "none"}; }
    .key-d { animation: ${typing ? "key-press-d 0.6s infinite 0.05s" : "none"}; }
  `;

  // Render Head Only (for Avatars/Sidebar)
  if (headOnly) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="20 15 160 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("overflow-visible select-none", className)}
      >
        <defs>
          <style>{animationStyles}</style>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.1" />
          </filter>
        </defs>

        <g className={`head-${agentId}`}>
          {/* Main Head Shape & Features mapping */}
          {agentId === "ceo" && (
            <>
              {/* Nova - Rounded Hexagon */}
              <path
                d="M 40,20 C 70,14 130,14 160,20 C 185,25 190,55 185,85 C 180,110 160,130 135,133 C 100,136 100,136 65,133 C 40,130 20,110 15,85 C 10,55 15,25 40,20 Z"
                fill={config.headColor}
                filter="url(#shadow)"
              />
              {/* Eyes - Cute large circles */}
              <ellipse cx="65" cy="78" rx="20" ry="24" fill="#000000" />
              <ellipse cx="135" cy="78" rx="20" ry="24" fill="#000000" />
              <circle cx="58" cy="70" r="5" fill="#FFFFFF" />
              <circle cx="128" cy="70" r="5" fill="#FFFFFF" />
              <circle cx="68" cy="85" r="2.5" fill="#FFFFFF" opacity="0.4" />
              <circle cx="138" cy="85" r="2.5" fill="#FFFFFF" opacity="0.4" />
              {/* Mouth */}
              <path d="M 92,98 Q 100,103 108,98" stroke={config.shadowColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </>
          )}

          {agentId === "product" && (
            <>
              {/* Mira - Rounded Triangle */}
              <path
                d="M 100,15 C 135,15 178,72 185,98 C 190,120 165,133 100,133 C 35,133 10,120 15,98 C 22,72 65,15 100,15 Z"
                fill={config.headColor}
                filter="url(#shadow)"
              />
              {/* Eyes - Happy Horizontal Ovals */}
              <ellipse cx="65" cy="90" rx="19" ry="13" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="2" />
              <ellipse cx="135" cy="90" rx="19" ry="13" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="2" />
              <ellipse cx="63" cy="90" rx="9" ry="9" fill="#111111" />
              <ellipse cx="133" cy="90" rx="9" ry="9" fill="#111111" />
              <circle cx="60" cy="87" r="2.5" fill="#FFFFFF" />
              <circle cx="130" cy="87" r="2.5" fill="#FFFFFF" />
              {/* Mouth */}
              <path d="M 93,110 Q 100,115 107,110" stroke={config.shadowColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          )}

          {agentId === "growth" && (
            <>
              {/* Ari - Rounded Square */}
              <path
                d="M 40,25 L 160,25 C 178,25 185,32 185,50 L 185,110 C 185,128 178,133 160,133 L 40,133 C 22,133 15,128 15,110 L 15,50 C 15,32 22,25 40,25 Z"
                fill={config.headColor}
                filter="url(#shadow)"
              />
              {/* Eyes - Focused Semi-circular/Angle top */}
              <ellipse cx="65" cy="85" rx="19" ry="13" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="1.5" />
              <ellipse cx="135" cy="85" rx="19" ry="13" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="1.5" />
              {/* Slanted Eyelid Brow overlay for intense look */}
              <path d="M 43,76 L 85,82" stroke={config.shadowColor} strokeWidth="4" strokeLinecap="round" />
              <path d="M 115,82 L 157,76" stroke={config.shadowColor} strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="68" cy="86" rx="8" ry="8" fill="#111111" />
              <ellipse cx="138" cy="86" rx="8" ry="8" fill="#111111" />
              <circle cx="66" cy="84" r="2.2" fill="#FFFFFF" />
              <circle cx="136" cy="84" r="2.2" fill="#FFFFFF" />
              {/* Mouth */}
              <path d="M 94,106 L 106,103" stroke={config.shadowColor} strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          )}

          {agentId === "operations" && (
            <>
              {/* Noah - Rounded Octagon/Circle */}
              <path
                d="M 45,20 C 80,16 120,16 155,20 C 180,26 190,50 190,80 C 190,110 180,131 155,134 C 120,137 80,137 45,134 C 20,131 10,110 10,80 C 10,50 20,26 45,20 Z"
                fill={config.headColor}
                filter="url(#shadow)"
              />
              {/* Eyes - Surprised round vertical oval pupils */}
              <ellipse cx="65" cy="78" rx="17" ry="21" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="2" />
              <ellipse cx="135" cy="78" rx="17" ry="21" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="2" />
              <ellipse cx="65" cy="78" rx="6" ry="12" fill="#111111" />
              <ellipse cx="135" cy="78" rx="6" ry="12" fill="#111111" />
              <circle cx="63" cy="73" r="2.5" fill="#FFFFFF" />
              <circle cx="133" cy="73" r="2.5" fill="#FFFFFF" />
              {/* Mouth - Cute round 'O' */}
              <circle cx="100" cy="102" r="5.5" fill={config.shadowColor} />
              <circle cx="100" cy="102" r="3.5" fill="#FFA39E" opacity="0.3" />
            </>
          )}
        </g>
      </svg>
    );
  }

  // Render Full Working Bot with Keyboard & Hands (for Dashboard & Build view)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible select-none", className)}
    >
      <defs>
        <style>{animationStyles}</style>
        <filter id="shadow-full" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Shadow base of bot */}
      <ellipse cx="100" cy="208" rx="55" ry="6" fill="#000000" opacity="0.1" />

      {/* Body & Feet */}
      <g>
        {/* Legs / Feet */}
        <path d="M 80,165 C 80,195 92,204 92,165 Z" fill={config.bodyColor} />
        <path d="M 120,165 C 120,195 108,204 108,165 Z" fill={config.bodyColor} />
        <ellipse cx="84" cy="199" rx="10" ry="4" fill={config.bodyColor} />
        <ellipse cx="116" cy="199" rx="10" ry="4" fill={config.bodyColor} />

        {/* Torso */}
        <path
          d="M 68,125 C 68,125 55,145 60,170 C 65,180 135,180 140,170 C 145,145 132,125 132,125 Z"
          fill={config.bodyColor}
        />
        {/* Neck collar shadow */}
        <path d="M 80,126 C 90,132 110,132 120,126 Z" fill={config.shadowColor} opacity="0.4" />
      </g>

      {/* Bobbing Head */}
      <g className={`head-${agentId}`}>
        {agentId === "ceo" && (
          <>
            {/* Nova - Rounded Hexagon */}
            <path
              d="M 40,20 C 70,14 130,14 160,20 C 185,25 190,55 185,85 C 180,110 160,130 135,133 C 100,136 100,136 65,133 C 40,130 20,110 15,85 C 10,55 15,25 40,20 Z"
              fill={config.headColor}
              filter="url(#shadow-full)"
            />
            {/* Eyes */}
            <ellipse cx="65" cy="78" rx="20" ry="24" fill="#000000" />
            <ellipse cx="135" cy="78" rx="20" ry="24" fill="#000000" />
            <circle cx="58" cy="70" r="5" fill="#FFFFFF" />
            <circle cx="128" cy="70" r="5" fill="#FFFFFF" />
            <circle cx="68" cy="85" r="2.5" fill="#FFFFFF" opacity="0.4" />
            <circle cx="138" cy="85" r="2.5" fill="#FFFFFF" opacity="0.4" />
            {/* Mouth */}
            <path d="M 92,98 Q 100,103 108,98" stroke={config.shadowColor} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {agentId === "product" && (
          <>
            {/* Mira - Rounded Triangle */}
            <path
              d="M 100,15 C 135,15 178,72 185,98 C 190,120 165,133 100,133 C 35,133 10,120 15,98 C 22,72 65,15 100,15 Z"
              fill={config.headColor}
              filter="url(#shadow-full)"
            />
            {/* Eyes */}
            <ellipse cx="65" cy="90" rx="19" ry="13" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="2" />
            <ellipse cx="135" cy="90" rx="19" ry="13" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="2" />
            <ellipse cx="63" cy="90" rx="9" ry="9" fill="#111111" />
            <ellipse cx="133" cy="90" rx="9" ry="9" fill="#111111" />
            <circle cx="60" cy="87" r="2.5" fill="#FFFFFF" />
            <circle cx="130" cy="87" r="2.5" fill="#FFFFFF" />
            {/* Mouth */}
            <path d="M 93,110 Q 100,115 107,110" stroke={config.shadowColor} strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        )}

        {agentId === "growth" && (
          <>
            {/* Ari - Rounded Square */}
            <path
              d="M 40,25 L 160,25 C 178,25 185,32 185,50 L 185,110 C 185,128 178,133 160,133 L 40,133 C 22,133 15,128 15,110 L 15,50 C 15,32 22,25 40,25 Z"
              fill={config.headColor}
              filter="url(#shadow-full)"
            />
            {/* Eyes */}
            <ellipse cx="65" cy="85" rx="19" ry="13" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="1.5" />
            <ellipse cx="135" cy="85" rx="19" ry="13" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="1.5" />
            {/* Slanted Eyelid Brow */}
            <path d="M 43,76 L 85,82" stroke={config.shadowColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M 115,82 L 157,76" stroke={config.shadowColor} strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="68" cy="86" rx="8" ry="8" fill="#111111" />
            <ellipse cx="138" cy="86" rx="8" ry="8" fill="#111111" />
            <circle cx="66" cy="84" r="2.2" fill="#FFFFFF" />
            <circle cx="136" cy="84" r="2.2" fill="#FFFFFF" />
            {/* Mouth */}
            <path d="M 94,106 L 106,103" stroke={config.shadowColor} strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        )}

        {agentId === "operations" && (
          <>
            {/* Noah - Rounded Octagon/Circle */}
            <path
              d="M 45,20 C 80,16 120,16 155,20 C 180,26 190,50 190,80 C 190,110 180,131 155,134 C 120,137 80,137 45,134 C 20,131 10,110 10,80 C 10,50 20,26 45,20 Z"
              fill={config.headColor}
              filter="url(#shadow-full)"
            />
            {/* Eyes */}
            <ellipse cx="65" cy="78" rx="17" ry="21" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="2" />
            <ellipse cx="135" cy="78" rx="17" ry="21" fill="#FFFFFF" stroke={config.shadowColor} strokeWidth="2" />
            <ellipse cx="65" cy="78" rx="6" ry="12" fill="#111111" />
            <ellipse cx="135" cy="78" rx="6" ry="12" fill="#111111" />
            <circle cx="63" cy="73" r="2.5" fill="#FFFFFF" />
            <circle cx="133" cy="73" r="2.5" fill="#FFFFFF" />
            {/* Mouth */}
            <circle cx="100" cy="102" r="5.5" fill={config.shadowColor} />
            <circle cx="100" cy="102" r="3.5" fill="#FFA39E" opacity="0.3" />
          </>
        )}
      </g>

      {/* Keyboard component */}
      <g>
        {/* Base */}
        <rect x="25" y="166" width="150" height="18" rx="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <rect x="25" y="181" width="150" height="3" rx="1" fill="#94A3B8" />

        {/* Spacebar */}
        <rect x="75" y="171" width="50" height="8" rx="2" fill="#E2E8F0" />

        {/* Left Side Keys */}
        <rect x="33" y="171" width="16" height="8" rx="2" className="key-a" fill="#C084FC" />
        <rect x="53" y="171" width="16" height="8" rx="2" className="key-b" fill="#60A5FA" />

        {/* Right Side Keys */}
        <rect x="131" y="171" width="16" height="8" rx="2" className="key-c" fill="#34D399" />
        <rect x="151" y="171" width="16" height="8" rx="2" className="key-d" fill="#F472B6" />
      </g>

      {/* Left Hand */}
      <g className={`hand-l-${agentId}`}>
        <circle cx="58" cy="162" r="11" fill={config.bodyColor} />
        <circle cx="58" cy="162" r="9" fill={config.headColor} opacity="0.85" />
      </g>

      {/* Right Hand */}
      <g className={`hand-r-${agentId}`}>
        <circle cx="142" cy="162" r="11" fill={config.bodyColor} />
        <circle cx="142" cy="162" r="9" fill={config.headColor} opacity="0.85" />
      </g>
    </svg>
  );
}
