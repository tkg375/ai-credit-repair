"use client";

export function ScoreChart({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 320"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient for the chart line */}
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          {/* Gradient for the area under the line */}
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="chartGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong glow for score */}
          <filter id="scoreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animated gradient for score */}
          <linearGradient id="scoreAnimatedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6">
              <animate
                attributeName="stop-color"
                values="#3b82f6;#8b5cf6;#ec4899;#3b82f6"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#ec4899">
              <animate
                attributeName="stop-color"
                values="#ec4899;#3b82f6;#8b5cf6;#ec4899"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          {/* Card shadow */}
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="20" floodColor="#000" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Background card */}
        <rect
          x="20"
          y="20"
          width="360"
          height="280"
          rx="24"
          fill="white"
          filter="url(#cardShadow)"
        />
        <rect
          x="20"
          y="20"
          width="360"
          height="280"
          rx="24"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />

        {/* Header */}
        <text
          x="50"
          y="60"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14"
          fill="#64748b"
          fontWeight="500"
        >
          Credit Score
        </text>

        {/* Big score number */}
        <text
          x="50"
          y="105"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="48"
          fill="url(#scoreAnimatedGradient)"
          fontWeight="800"
          filter="url(#scoreGlow)"
        >
          800
        </text>

        {/* Improvement badge */}
        <rect
          x="175"
          y="70"
          width="80"
          height="32"
          rx="16"
          fill="#ecfdf5"
        />
        <text
          x="195"
          y="92"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14"
          fill="#059669"
          fontWeight="600"
        >
          +127
        </text>
        {/* Up arrow in badge */}
        <path
          d="M240 86 L246 80 L252 86"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Grid lines */}
        <g stroke="#f1f5f9" strokeWidth="1">
          <line x1="50" y1="150" x2="350" y2="150" />
          <line x1="50" y1="190" x2="350" y2="190" />
          <line x1="50" y1="230" x2="350" y2="230" />
        </g>

        {/* Y-axis labels */}
        <text x="50" y="145" fontFamily="system-ui" fontSize="10" fill="#94a3b8">800</text>
        <text x="50" y="185" fontFamily="system-ui" fontSize="10" fill="#94a3b8">700</text>
        <text x="50" y="225" fontFamily="system-ui" fontSize="10" fill="#94a3b8">600</text>

        {/* Area under the chart */}
        <path
          d="M80 240 L120 235 L160 225 L200 210 L240 195 L280 170 L320 150 L320 250 L80 250 Z"
          fill="url(#areaGradient)"
        />

        {/* The zigzag chart line going UP */}
        <path
          d="M80 240 L120 235 L160 225 L200 210 L240 195 L280 170 L320 150"
          stroke="url(#chartGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#chartGlow)"
        />

        {/* Data points */}
        <g fill="white" stroke="url(#chartGradient)" strokeWidth="3">
          <circle cx="80" cy="240" r="6" />
          <circle cx="120" cy="235" r="6" />
          <circle cx="160" cy="225" r="6" />
          <circle cx="200" cy="210" r="6" />
          <circle cx="240" cy="195" r="6" />
          <circle cx="280" cy="170" r="6" />
          <circle cx="320" cy="150" r="8">
            {/* Pulse animation on the last point */}
            <animate
              attributeName="r"
              values="8;10;8"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Animated current point glow */}
        <circle cx="320" cy="150" r="16" fill="url(#chartGradient)" opacity="0.2">
          <animate
            attributeName="r"
            values="12;20;12"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.1;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* X-axis labels */}
        <text x="75" y="270" fontFamily="system-ui" fontSize="10" fill="#94a3b8" textAnchor="middle">Jan</text>
        <text x="135" y="270" fontFamily="system-ui" fontSize="10" fill="#94a3b8" textAnchor="middle">Feb</text>
        <text x="195" y="270" fontFamily="system-ui" fontSize="10" fill="#94a3b8" textAnchor="middle">Mar</text>
        <text x="255" y="270" fontFamily="system-ui" fontSize="10" fill="#94a3b8" textAnchor="middle">Apr</text>
        <text x="315" y="270" fontFamily="system-ui" fontSize="10" fill="#94a3b8" textAnchor="middle">Now</text>

        {/* Rising arrow indicator */}
        <g transform="translate(340, 120)">
          <path
            d="M0 30 L15 0 L30 30"
            stroke="url(#chartGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#chartGlow)"
          >
            <animate
              attributeName="transform"
              values="translate(0,0);translate(0,-5);translate(0,0)"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
    </div>
  );
}
