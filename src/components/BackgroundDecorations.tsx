import './BackgroundDecorations.css';

export default function BackgroundDecorations() {
  return (
    <div className="bg-decorations" aria-hidden="true">
      <svg
        className="bg-decorations-svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f4c5c" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#006666" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="shapeGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00CED1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#66CC00" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="outlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00CED1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#008080" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="outlineLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00CED1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
          </linearGradient>
          <filter id="shapeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="6" stdDeviation="10" floodColor="#0f4c5c" floodOpacity="0.1" />
          </filter>
          <filter id="shapeShadowSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="#00CED1" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Large rounded rectangle - mid left */}
        <rect
          x="-80"
          y="120"
          width="320"
          height="280"
          rx="48"
          fill="url(#shapeGrad)"
          filter="url(#shapeShadow)"
        />

        {/* Small rounded shape - sidebar area */}
        <rect
          x="-40"
          y="300"
          width="180"
          height="160"
          rx="32"
          fill="url(#shapeGradLight)"
          filter="url(#shapeShadowSoft)"
        />

        {/* Circle accent - sidebar top */}
        <circle
          cx="100"
          cy="80"
          r="120"
          fill="url(#shapeGradLight)"
          filter="url(#shapeShadowSoft)"
        />

        {/* Circle/arc - top right */}
        <circle
          cx="1400"
          cy="-100"
          r="280"
          fill="url(#shapeGrad)"
          filter="url(#shapeShadow)"
        />

        {/* Soft circle - navbar area top left */}
        <circle
          cx="400"
          cy="-50"
          r="180"
          fill="url(#shapeGradLight)"
          filter="url(#shapeShadowSoft)"
        />

        {/* Outlined rounded square - overlaying mid left */}
        <rect
          x="40"
          y="180"
          width="180"
          height="160"
          rx="24"
          fill="none"
          stroke="url(#outlineGrad)"
          strokeWidth="1.5"
        />

        {/* Outlined rounded square - sidebar area */}
        <rect
          x="20"
          y="420"
          width="120"
          height="110"
          rx="20"
          fill="none"
          stroke="url(#outlineLight)"
          strokeWidth="1.2"
        />

        {/* Diagonal lines/dashes - refined */}
        {[
          [100, 80, 170, 150],
          [180, 400, 250, 470],
          [320, 200, 380, 260],
          [500, 350, 570, 420],
          [700, 150, 760, 210],
          [850, 500, 920, 570],
          [1100, 200, 1160, 260],
          [200, 650, 270, 720],
          [400, 720, 460, 780],
          [50, 150, 110, 210],
          [280, 50, 340, 110],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={`line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#00CED1"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
        ))}

        {/* Dot pattern - top right */}
        <g fill="#006666" fillOpacity="0.1">
          {Array.from({ length: 24 }, (_, i) => (
            <circle
              key={`dot-${i}`}
              cx={1280 + (i % 6) * 24}
              cy={40 + Math.floor(i / 6) * 24}
              r="2"
            />
          ))}
        </g>

        {/* Dots filling square shapes - refined with varied opacity */}
        {[
          { x: 600, y: 100, cols: 8, rows: 8, spacing: 14, r: 1.5, opacity: 0.12 },
          { x: 200, y: 450, cols: 6, rows: 6, spacing: 16, r: 1.5, opacity: 0.1 },
          { x: 900, y: 250, cols: 7, rows: 7, spacing: 12, r: 1.5, opacity: 0.11 },
          { x: 100, y: 250, cols: 5, rows: 5, spacing: 18, r: 1.5, opacity: 0.14 },
          { x: 750, y: 550, cols: 6, rows: 6, spacing: 15, r: 1.5, opacity: 0.1 },
          { x: 1100, y: 100, cols: 5, rows: 5, spacing: 14, r: 1.5, opacity: 0.11 },
          { x: 30, y: 120, cols: 4, rows: 4, spacing: 12, r: 1.2, opacity: 0.2 },
          { x: 350, y: 30, cols: 5, rows: 5, spacing: 10, r: 1.2, opacity: 0.15 },
        ].map(({ x, y, cols, rows, spacing, r, opacity }, sqIdx) => (
          <g key={`dots-square-${sqIdx}`} fill="#006666" fillOpacity={opacity}>
            {Array.from({ length: cols * rows }, (_, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              return (
                <circle
                  key={i}
                  cx={x + col * spacing}
                  cy={y + row * spacing}
                  r={r}
                />
              );
            })}
          </g>
        ))}

        {/* Light dots for sidebar area - visible on dark background */}
        <g fill="rgba(255,255,255,0.15)">
          {Array.from({ length: 20 }, (_, i) => (
            <circle
              key={`side-dot-${i}`}
              cx={60 + (i % 5) * 22}
              cy={180 + Math.floor(i / 5) * 120}
              r="1.5"
            />
          ))}
        </g>

        {/* X marks - refined */}
        {[
          [120, 50],
          [200, 90],
          [280, 130],
          [350, 750],
          [420, 790],
          [950, 680],
          [1020, 720],
          [1300, 350],
          [80, 550],
          [250, 30],
        ].map(([x, y], i) => (
          <g key={`x-${i}`} transform={`translate(${x}, ${y})`}>
            <path
              d="M-4 -4 L4 4 M4 -4 L-4 4"
              stroke="#006666"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
          </g>
        ))}

      </svg>
    </div>
  );
}
