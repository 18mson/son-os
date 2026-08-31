"use client";

import React, { useMemo } from "react";
import { FractalType } from "@/config/wallpaperConfig";

interface FractalOverlayProps {
  fractalType: FractalType;
  isLight?: boolean;
}

export const FractalOverlay: React.FC<FractalOverlayProps> = ({
  fractalType,
  isLight = false,
}) => {
  // 1. COSMIC: Phyllotaxis / Golden spiral points (Static)
  const cosmicPoints = useMemo(() => {
    const nodes: { id: number; x: number; y: number; size: number; opacity: number }[] = [];
    const goldenAngle = 137.5 * (Math.PI / 180);
    const count = 110;
    for (let i = 1; i <= count; i++) {
      const r = Math.sqrt(i) * 36;
      const theta = i * goldenAngle;
      const x = 600 + r * Math.cos(theta);
      const y = 450 + r * Math.sin(theta);
      const size = i % 7 === 0 ? 3.5 : i % 3 === 0 ? 2.5 : 1.5;
      const opacity = Math.min(0.85, 0.25 + (i / count) * 0.65);
      nodes.push({ id: i, x, y, size, opacity });
    }
    return nodes;
  }, []);

  // 2. COSMIC: Static Logarithmic Spirals
  const cosmicSpiralPrimary = useMemo(() => {
    let path = "M 600 450 ";
    const b = 0.17;
    const a = 4;
    const steps = 220;
    for (let i = 0; i <= steps; i++) {
      const theta = (i * Math.PI) / 18;
      const r = a * Math.exp(b * theta);
      if (r > 750) break;
      const x = 600 + r * Math.cos(theta);
      const y = 450 + r * Math.sin(theta);
      path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
    }
    return path;
  }, []);

  const cosmicSpiralSecondary = useMemo(() => {
    let path = "M 600 450 ";
    const b = 0.17;
    const a = 4;
    const steps = 220;
    for (let i = 0; i <= steps; i++) {
      const theta = (i * Math.PI) / 18 + Math.PI;
      const r = a * Math.exp(b * theta);
      if (r > 750) break;
      const x = 600 + r * Math.cos(theta);
      const y = 450 + r * Math.sin(theta);
      path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
    }
    return path;
  }, []);

  // 3. CYBER: Static Hexagonal Matrix Nodes & Circuits
  const cyberHexagons = useMemo(() => {
    const hexes: { id: string; points: string; opacity: number }[] = [];
    const hexRadius = 80;
    const h = hexRadius * Math.sin(Math.PI / 3);
    const origins: [number, number][] = [
      [600, 450],
      [600 + hexRadius * 1.5, 450 + h],
      [600 + hexRadius * 1.5, 450 - h],
      [600 - hexRadius * 1.5, 450 + h],
      [600 - hexRadius * 1.5, 450 - h],
      [600, 450 + 2 * h],
      [600, 450 - 2 * h],
      [600 + hexRadius * 3, 450],
      [600 - hexRadius * 3, 450],
      [600 + hexRadius * 3, 450 + 2 * h],
      [600 - hexRadius * 3, 450 - 2 * h],
      [600 + hexRadius * 3, 450 - 2 * h],
      [600 - hexRadius * 3, 450 + 2 * h],
    ];

    origins.forEach(([cx, cy], oIdx) => {
      const pts = [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return `${(cx + hexRadius * Math.cos(rad)).toFixed(1)},${(cy + hexRadius * Math.sin(rad)).toFixed(1)}`;
      }).join(" ");
      hexes.push({ id: `hex-${oIdx}`, points: pts, opacity: oIdx === 0 ? 0.9 : 0.45 });
    });
    return hexes;
  }, []);

  // 4. SIERPINSKI: Static Recursive Triangle Subdivision
  const sierpinskiTriangles = useMemo(() => {
    interface Triangle {
      p1: [number, number];
      p2: [number, number];
      p3: [number, number];
      depth: number;
    }

    const result: Triangle[] = [];
    const size = 620;
    const h = size * (Math.sqrt(3) / 2);
    const top: [number, number] = [600, 450 - (2 / 3) * h + 20];
    const left: [number, number] = [600 - size / 2, 450 + (1 / 3) * h + 20];
    const right: [number, number] = [600 + size / 2, 450 + (1 / 3) * h + 20];

    const subdivide = (
      p1: [number, number],
      p2: [number, number],
      p3: [number, number],
      depth: number
    ) => {
      result.push({ p1, p2, p3, depth });
      if (depth >= 4) return;

      const mid1: [number, number] = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
      const mid2: [number, number] = [(p2[0] + p3[0]) / 2, (p2[1] + p3[1]) / 2];
      const mid3: [number, number] = [(p3[0] + p1[0]) / 2, (p3[1] + p1[1]) / 2];

      subdivide(p1, mid1, mid3, depth + 1);
      subdivide(mid1, p2, mid2, depth + 1);
      subdivide(mid3, mid2, p3, depth + 1);
    };

    subdivide(top, left, right, 1);
    return result;
  }, []);

  // 5. KOCH: Static 6-Fold Snowflake Curve
  const kochSnowflakePath = useMemo(() => {
    type Point = [number, number];

    const kochSegment = (p1: Point, p2: Point, depth: number): Point[] => {
      if (depth === 0) return [p1];

      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];

      const a: Point = p1;
      const b: Point = [p1[0] + dx / 3, p1[1] + dy / 3];
      const d: Point = [p1[0] + (2 * dx) / 3, p1[1] + (2 * dy) / 3];

      // Apex point rotated by -60 deg
      const cos60 = 0.5;
      const sin60 = Math.sqrt(3) / 2;
      const vX = d[0] - b[0];
      const vY = d[1] - b[1];
      const c: Point = [
        b[0] + vX * cos60 + vY * sin60,
        b[1] - vX * sin60 + vY * cos60,
      ];

      return [
        ...kochSegment(a, b, depth - 1),
        ...kochSegment(b, c, depth - 1),
        ...kochSegment(c, d, depth - 1),
        ...kochSegment(d, p2, depth - 1),
      ];
    };

    const cx = 600;
    const cy = 450;
    const radius = 280;
    const vertices: Point[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i * 120 - 90) * (Math.PI / 180);
      vertices.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
    }

    const pts1 = kochSegment(vertices[0], vertices[1], 3);
    const pts2 = kochSegment(vertices[1], vertices[2], 3);
    const pts3 = kochSegment(vertices[2], vertices[0], 3);

    const allPts = [...pts1, ...pts2, ...pts3];
    return `M ${allPts[0][0].toFixed(2)} ${allPts[0][1].toFixed(2)} ` +
      allPts.slice(1).map((p) => `L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ") + " Z";
  }, []);

  // Subtle Mesh for Classic Wallpapers
  if (fractalType === "none") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="subtle-mesh-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={isLight ? "#000000" : "#ffffff"}
                strokeWidth="0.5"
                strokeOpacity={isLight ? "0.06" : "0.05"}
              />
              <circle
                cx="40"
                cy="40"
                r="1"
                fill={isLight ? "#000000" : "#ffffff"}
                fillOpacity={isLight ? "0.12" : "0.1"}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#subtle-mesh-pattern)" />
        </svg>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Background Static Geometric Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={`fractal-grid-${fractalType}`}
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke={isLight ? "#000000" : "#ffffff"}
              strokeWidth="0.5"
              strokeOpacity={isLight ? "0.08" : "0.07"}
            />
            <circle
              cx="0"
              cy="0"
              r="1"
              fill={isLight ? "#0f172a" : "#ffffff"}
              fillOpacity={isLight ? "0.2" : "0.15"}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#fractal-grid-${fractalType})`} />
      </svg>

      {/* Main High-Precision Vector Canvas */}
      <svg
        className={`w-full h-full transition-opacity duration-500 ${
          isLight ? "opacity-60" : "opacity-75"
        }`}
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cosmic Gradients */}
          <linearGradient id="cosmicGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLight ? "#9333ea" : "#c084fc"} stopOpacity="0.8" />
            <stop offset="50%" stopColor={isLight ? "#4f46e5" : "#818cf8"} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isLight ? "#0284c7" : "#38bdf8"} stopOpacity="0.1" />
          </linearGradient>

          {/* Cyber Gradients */}
          <linearGradient id="cyberGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isLight ? "#0891b2" : "#22d3ee"} stopOpacity="0.9" />
            <stop offset="50%" stopColor={isLight ? "#2563eb" : "#38bdf8"} stopOpacity="0.5" />
            <stop offset="100%" stopColor={isLight ? "#c026d3" : "#f472b6"} stopOpacity="0.8" />
          </linearGradient>

          {/* Geometry Gradients */}
          <linearGradient id="geomGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLight ? "#d97706" : "#fbbf24"} stopOpacity="0.9" />
            <stop offset="50%" stopColor={isLight ? "#ea580c" : "#f59e0b"} stopOpacity="0.5" />
            <stop offset="100%" stopColor={isLight ? "#ca8a04" : "#fef08a"} stopOpacity="0.2" />
          </linearGradient>

          {/* Sierpinski Gradients */}
          <linearGradient id="sierpinskiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isLight ? "#059669" : "#34d399"} stopOpacity="0.85" />
            <stop offset="50%" stopColor={isLight ? "#0d9488" : "#2dd4bf"} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isLight ? "#0284c7" : "#38bdf8"} stopOpacity="0.2" />
          </linearGradient>

          {/* Koch Gradients */}
          <linearGradient id="kochGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLight ? "#0284c7" : "#38bdf8"} stopOpacity="0.9" />
            <stop offset="50%" stopColor={isLight ? "#2563eb" : "#60a5fa"} stopOpacity="0.5" />
            <stop offset="100%" stopColor={isLight ? "#4f46e5" : "#818cf8"} stopOpacity="0.8" />
          </linearGradient>

          {/* Quantum Gradients */}
          <linearGradient id="quantumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLight ? "#2563eb" : "#60a5fa"} stopOpacity="0.85" />
            <stop offset="50%" stopColor={isLight ? "#7c3aed" : "#a78bfa"} stopOpacity="0.55" />
            <stop offset="100%" stopColor={isLight ? "#06b6d4" : "#22d3ee"} stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* 1. COSMIC MANDELBROT / SPIRAL (Completely Static) */}
        {fractalType === "cosmic" && (
          <g>
            {/* Concentric Harmonic Celestial Orbits */}
            {[70, 140, 220, 310, 420, 540, 680].map((radius, idx) => (
              <circle
                key={`cosmic-ring-${idx}`}
                cx="600"
                cy="450"
                r={radius}
                fill="none"
                stroke="url(#cosmicGrad1)"
                strokeWidth={idx % 2 === 0 ? "1.2" : "0.75"}
                strokeDasharray={idx % 3 === 0 ? "6 8" : idx % 2 === 0 ? "3 5" : "none"}
                strokeOpacity={0.4 + (idx / 7) * 0.3}
              />
            ))}

            {/* Static Logarithmic Golden Spiral Arms */}
            <path
              d={cosmicSpiralPrimary}
              fill="none"
              stroke="url(#cosmicGrad1)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d={cosmicSpiralSecondary}
              fill="none"
              stroke="url(#cosmicGrad1)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="4 6"
              strokeOpacity="0.75"
            />

            {/* Cross-Axial Star Rays */}
            <line x1="600" y1="50" x2="600" y2="850" stroke="url(#cosmicGrad1)" strokeWidth="0.8" strokeDasharray="4 12" strokeOpacity="0.4" />
            <line x1="100" y1="450" x2="1100" y2="450" stroke="url(#cosmicGrad1)" strokeWidth="0.8" strokeDasharray="4 12" strokeOpacity="0.4" />
            <line x1="200" y1="100" x2="1000" y2="800" stroke="url(#cosmicGrad1)" strokeWidth="0.6" strokeDasharray="6 14" strokeOpacity="0.3" />
            <line x1="200" y1="800" x2="1000" y2="100" stroke="url(#cosmicGrad1)" strokeWidth="0.6" strokeDasharray="6 14" strokeOpacity="0.3" />

            {/* Phyllotaxis Galaxy Nodes */}
            {cosmicPoints.map((pt) => (
              <circle
                key={`cosmic-node-${pt.id}`}
                cx={pt.x}
                cy={pt.y}
                r={pt.size}
                fill={isLight ? "#7e22ce" : "#e9d5ff"}
                fillOpacity={pt.opacity}
              />
            ))}

            {/* Center Golden Core */}
            <circle cx="600" cy="450" r="14" fill="none" stroke={isLight ? "#9333ea" : "#c084fc"} strokeWidth="2" />
            <circle cx="600" cy="450" r="4" fill={isLight ? "#9333ea" : "#ffffff"} />
          </g>
        )}

        {/* 2. CYBER MATRIX / HEXAGONAL BUS (Completely Static) */}
        {fractalType === "cyber" && (
          <g>
            {/* Hexagonal Lattice */}
            {cyberHexagons.map((h) => (
              <polygon
                key={h.id}
                points={h.points}
                fill="none"
                stroke="url(#cyberGrad1)"
                strokeWidth="1.2"
                strokeOpacity={h.opacity}
              />
            ))}

            {/* Diagonal & Orthogonal Circuit Lines */}
            <path
              d="M 150 200 L 400 200 L 520 320 L 520 580 L 400 700 L 150 700"
              fill="none"
              stroke={isLight ? "#0891b2" : "#22d3ee"}
              strokeWidth="1.5"
              strokeDasharray="8 6"
              strokeOpacity="0.6"
            />
            <path
              d="M 1050 200 L 800 200 L 680 320 L 680 580 L 800 700 L 1050 700"
              fill="none"
              stroke={isLight ? "#c026d3" : "#f472b6"}
              strokeWidth="1.5"
              strokeDasharray="8 6"
              strokeOpacity="0.6"
            />

            {/* Bus Lines */}
            <line x1="200" y1="450" x2="1000" y2="450" stroke="url(#cyberGrad1)" strokeWidth="1" strokeDasharray="12 8" strokeOpacity="0.5" />
            <line x1="600" y1="120" x2="600" y2="780" stroke="url(#cyberGrad1)" strokeWidth="1" strokeDasharray="12 8" strokeOpacity="0.5" />

            {/* Circuit Nodes */}
            {[
              [400, 200], [520, 320], [520, 580], [400, 700],
              [800, 200], [680, 320], [680, 580], [800, 700],
              [600, 450], [600, 250], [600, 650], [350, 450], [850, 450],
            ].map(([x, y], idx) => (
              <g key={`cyber-node-${idx}`}>
                <circle cx={x} cy={y} r="5" fill="none" stroke={isLight ? "#0891b2" : "#22d3ee"} strokeWidth="1.5" />
                <circle cx={x} cy={y} r="2" fill={isLight ? "#0891b2" : "#ffffff"} />
              </g>
            ))}
          </g>
        )}

        {/* 3. GOLDEN FIBONACCI / SACRED METATRON (Completely Static) */}
        {fractalType === "geometry" && (
          <g>
            {/* Metatron 13 Circles Grid */}
            {[
              [600, 450], // Center
              [600, 300], [600, 600],
              [600 - 130 * Math.sin(Math.PI / 3), 450 - 130 * Math.cos(Math.PI / 3)],
              [600 + 130 * Math.sin(Math.PI / 3), 450 - 130 * Math.cos(Math.PI / 3)],
              [600 - 130 * Math.sin(Math.PI / 3), 450 + 130 * Math.cos(Math.PI / 3)],
              [600 + 130 * Math.sin(Math.PI / 3), 450 + 130 * Math.cos(Math.PI / 3)],
              [600, 150], [600, 750],
              [600 - 260 * Math.sin(Math.PI / 3), 450 - 260 * Math.cos(Math.PI / 3)],
              [600 + 260 * Math.sin(Math.PI / 3), 450 - 260 * Math.cos(Math.PI / 3)],
              [600 - 260 * Math.sin(Math.PI / 3), 450 + 260 * Math.cos(Math.PI / 3)],
              [600 + 260 * Math.sin(Math.PI / 3), 450 + 260 * Math.cos(Math.PI / 3)],
            ].map(([cx, cy], idx) => (
              <circle
                key={`metatron-c-${idx}`}
                cx={cx}
                cy={cy}
                r="75"
                fill="none"
                stroke="url(#geomGrad1)"
                strokeWidth="1"
                strokeOpacity="0.45"
              />
            ))}

            {/* Metatron Interconnecting Lines (Cube & Octahedron wireframe) */}
            <polygon
              points="600,150 825,275 825,625 600,750 375,625 375,275"
              fill="none"
              stroke="url(#geomGrad1)"
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />
            <polygon
              points="600,225 750,312 750,587 600,675 450,587 450,312"
              fill="none"
              stroke="url(#geomGrad1)"
              strokeWidth="1.2"
              strokeOpacity="0.7"
            />

            {/* Inner Star Tetrahedron Lines */}
            <polygon points="600,150 825,625 375,625" fill="none" stroke="url(#geomGrad1)" strokeWidth="1" strokeOpacity="0.6" />
            <polygon points="600,750 825,275 375,275" fill="none" stroke="url(#geomGrad1)" strokeWidth="1" strokeOpacity="0.6" />

            {/* Concentric Golden Rings */}
            {[50, 110, 180, 260, 360].map((r, idx) => (
              <circle
                key={`geom-ring-${idx}`}
                cx="600"
                cy="450"
                r={r}
                fill="none"
                stroke="url(#geomGrad1)"
                strokeWidth="0.8"
                strokeDasharray={idx % 2 === 0 ? "4 6" : "none"}
                strokeOpacity="0.5"
              />
            ))}

            {/* Center Focal Point */}
            <circle cx="600" cy="450" r="6" fill={isLight ? "#d97706" : "#fbbf24"} />
          </g>
        )}

        {/* 4. SIERPINSKI GASKET / TRIFORCE HIERARCHY (Completely Static) */}
        {fractalType === "sierpinski" && (
          <g>
            {/* Outer Bounding Sacred Circles */}
            {[200, 340, 440].map((r, idx) => (
              <circle
                key={`sier-circle-${idx}`}
                cx="600"
                cy="450"
                r={r}
                fill="none"
                stroke="url(#sierpinskiGrad)"
                strokeWidth="0.8"
                strokeDasharray={idx % 2 === 0 ? "6 6" : "none"}
                strokeOpacity="0.35"
              />
            ))}

            {/* Recursive Sierpinski Triangle Subdivisions */}
            {sierpinskiTriangles.map((tri, idx) => {
              const opacity = Math.max(0.25, 1 - tri.depth * 0.18);
              const width = tri.depth === 1 ? "2" : tri.depth === 2 ? "1.5" : tri.depth === 3 ? "1" : "0.75";
              return (
                <polygon
                  key={`sier-tri-${idx}`}
                  points={`${tri.p1[0].toFixed(1)},${tri.p1[1].toFixed(1)} ${tri.p2[0].toFixed(1)},${tri.p2[1].toFixed(1)} ${tri.p3[0].toFixed(1)},${tri.p3[1].toFixed(1)}`}
                  fill="none"
                  stroke="url(#sierpinskiGrad)"
                  strokeWidth={width}
                  strokeOpacity={opacity}
                />
              );
            })}

            {/* Alignment Center Rulers */}
            <line x1="600" y1="80" x2="600" y2="820" stroke="url(#sierpinskiGrad)" strokeWidth="0.6" strokeDasharray="4 8" strokeOpacity="0.3" />
            <line x1="150" y1="450" x2="1050" y2="450" stroke="url(#sierpinskiGrad)" strokeWidth="0.6" strokeDasharray="4 8" strokeOpacity="0.3" />
          </g>
        )}

        {/* 5. KOCH SNOWFLAKE / STAR ISLAND (Completely Static) */}
        {fractalType === "koch" && (
          <g>
            {/* Concentric 6-fold Star Orbits */}
            {[90, 180, 270, 360].map((r, idx) => (
              <circle
                key={`koch-ring-${idx}`}
                cx="600"
                cy="450"
                r={r}
                fill="none"
                stroke="url(#kochGrad)"
                strokeWidth="0.8"
                strokeDasharray={idx % 2 === 0 ? "5 7" : "none"}
                strokeOpacity="0.35"
              />
            ))}

            {/* Main Recursive Koch Snowflake Vector */}
            <path
              d={kochSnowflakePath}
              fill="none"
              stroke="url(#kochGrad)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Inverted Sub-Snowflake for Dual Depth Star Geometry */}
            <g transform="rotate(60 600 450)">
              <path
                d={kochSnowflakePath}
                fill="none"
                stroke="url(#kochGrad)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                strokeOpacity="0.5"
                transform="scale(0.65) translate(323 242)"
              />
            </g>

            {/* Hexagonal Radial Axis Rays */}
            {[0, 30, 60, 90, 120, 150].map((deg, idx) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = 600 - 450 * Math.cos(rad);
              const y1 = 450 - 450 * Math.sin(rad);
              const x2 = 600 + 450 * Math.cos(rad);
              const y2 = 450 + 450 * Math.sin(rad);
              return (
                <line
                  key={`koch-ray-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#kochGrad)"
                  strokeWidth="0.75"
                  strokeDasharray="4 10"
                  strokeOpacity="0.35"
                />
              );
            })}

            {/* Center Crystal Node */}
            <circle cx="600" cy="450" r="8" fill="none" stroke={isLight ? "#0284c7" : "#38bdf8"} strokeWidth="2" />
            <circle cx="600" cy="450" r="3" fill={isLight ? "#0284c7" : "#ffffff"} />
          </g>
        )}

        {/* 6. QUANTUM TESSERACT / HYPERCUBE (Completely Static) */}
        {fractalType === "quantum" && (
          <g>
            {/* Outer Isometric Hypercube */}
            <polygon
              points="600,160 840,280 840,620 600,740 360,620 360,280"
              fill="none"
              stroke="url(#quantumGrad)"
              strokeWidth="2"
              strokeOpacity="0.85"
            />

            {/* Inner Hypercube */}
            <polygon
              points="600,310 720,370 720,530 600,590 480,530 480,370"
              fill="none"
              stroke="url(#quantumGrad)"
              strokeWidth="1.5"
              strokeOpacity="0.9"
            />

            {/* 4D Orthogonal Vertex Connectors */}
            <line x1="600" y1="160" x2="600" y2="310" stroke="url(#quantumGrad)" strokeWidth="1.8" strokeOpacity="0.85" />
            <line x1="840" y1="280" x2="720" y2="370" stroke="url(#quantumGrad)" strokeWidth="1.8" strokeOpacity="0.85" />
            <line x1="840" y1="620" x2="720" y2="530" stroke="url(#quantumGrad)" strokeWidth="1.8" strokeOpacity="0.85" />
            <line x1="600" y1="740" x2="600" y2="590" stroke="url(#quantumGrad)" strokeWidth="1.8" strokeOpacity="0.85" />
            <line x1="360" y1="620" x2="480" y2="530" stroke="url(#quantumGrad)" strokeWidth="1.8" strokeOpacity="0.85" />
            <line x1="360" y1="280" x2="480" y2="370" stroke="url(#quantumGrad)" strokeWidth="1.8" strokeOpacity="0.85" />

            {/* Diagonal Perspective Transversals */}
            <line x1="600" y1="160" x2="600" y2="740" stroke="url(#quantumGrad)" strokeWidth="0.8" strokeDasharray="4 8" strokeOpacity="0.4" />
            <line x1="360" y1="280" x2="840" y2="620" stroke="url(#quantumGrad)" strokeWidth="0.8" strokeDasharray="4 8" strokeOpacity="0.4" />
            <line x1="360" y1="620" x2="840" y2="280" stroke="url(#quantumGrad)" strokeWidth="0.8" strokeDasharray="4 8" strokeOpacity="0.4" />

            {/* Quantum Orbital Ellipses */}
            {[
              "rotate(0 600 450)",
              "rotate(45 600 450)",
              "rotate(90 600 450)",
              "rotate(135 600 450)",
            ].map((transform, idx) => (
              <ellipse
                key={`quantum-orbit-${idx}`}
                cx="600"
                cy="450"
                rx="320"
                ry="120"
                fill="none"
                stroke="url(#quantumGrad)"
                strokeWidth="1"
                strokeDasharray={idx % 2 === 0 ? "8 6" : "none"}
                strokeOpacity="0.45"
                transform={transform}
              />
            ))}

            {/* Vertices Energy Nodes */}
            {[
              [600, 160], [840, 280], [840, 620], [600, 740], [360, 620], [360, 280],
              [600, 310], [720, 370], [720, 530], [600, 590], [480, 530], [480, 370],
              [600, 450],
            ].map(([x, y], idx) => (
              <g key={`q-vertex-${idx}`}>
                <circle cx={x} cy={y} r="5" fill="none" stroke={isLight ? "#2563eb" : "#60a5fa"} strokeWidth="1.5" />
                <circle cx={x} cy={y} r="2" fill={isLight ? "#2563eb" : "#ffffff"} />
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};
