/**
 * Generates a themed SVG placeholder image as a data URL.
 * Used server-side when OPENAI_API_KEY is absent.
 */

interface ThemeConfig {
  from: string;
  to: string;
  accent: string;
  emoji: string;
  stars: boolean;
}

const THEMES: Record<string, ThemeConfig> = {
  space:       { from: "#0f0c29", to: "#302b63", accent: "#818cf8", emoji: "🚀", stars: true },
  animals:     { from: "#134e4a", to: "#065f46", accent: "#6ee7b7", emoji: "🦁", stars: false },
  ocean:       { from: "#0c4a6e", to: "#0369a1", accent: "#7dd3fc", emoji: "🐠", stars: false },
  jungle:      { from: "#14532d", to: "#166534", accent: "#86efac", emoji: "🌿", stars: false },
  school:      { from: "#78350f", to: "#92400e", accent: "#fcd34d", emoji: "📚", stars: false },
  magic:       { from: "#4c1d95", to: "#6d28d9", accent: "#c4b5fd", emoji: "✨", stars: true },
  dinosaurs:   { from: "#14532d", to: "#365314", accent: "#bef264", emoji: "🦕", stars: false },
  superheroes: { from: "#7f1d1d", to: "#991b1b", accent: "#fca5a5", emoji: "🦸", stars: false },
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function starDots(count: number): string {
  let s = "";
  // deterministic "random" positions
  for (let i = 0; i < count; i++) {
    const x = ((i * 137 + 73) % 900) + 50;
    const y = ((i * 89 + 41) % 500) + 50;
    const r = (i % 3) + 1;
    const op = 0.3 + (i % 5) * 0.12;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${op.toFixed(2)}"/>`;
  }
  return s;
}

export function generatePlaceholderSvg(theme: string, sceneTitle: string, sceneOrder: number): string {
  const cfg = THEMES[theme] ?? THEMES.magic;
  const label = escapeXml(sceneTitle);
  const id = `g${sceneOrder}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${cfg.from}"/>
      <stop offset="100%" style="stop-color:${cfg.to}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#${id})"/>
  ${cfg.stars ? starDots(40) : ""}
  <!-- decorative rings -->
  <circle cx="512" cy="512" r="320" fill="none" stroke="${cfg.accent}" stroke-width="1" opacity="0.15"/>
  <circle cx="512" cy="512" r="260" fill="none" stroke="${cfg.accent}" stroke-width="1" opacity="0.10"/>
  <!-- central glow -->
  <circle cx="512" cy="420" r="180" fill="${cfg.accent}" opacity="0.08"/>
  <!-- emoji rendered as text -->
  <text x="512" y="480" font-size="200" text-anchor="middle" dominant-baseline="middle">${cfg.emoji}</text>
  <!-- scene number badge -->
  <rect x="440" y="560" width="144" height="44" rx="22" fill="${cfg.accent}" opacity="0.18"/>
  <text x="512" y="589" font-size="22" font-family="system-ui,sans-serif" font-weight="600"
        fill="${cfg.accent}" text-anchor="middle" dominant-baseline="middle">Scene ${sceneOrder}</text>
  <!-- scene title -->
  <text x="512" y="660" font-size="38" font-family="system-ui,sans-serif" font-weight="700"
        fill="white" text-anchor="middle" opacity="0.90">${label}</text>
  <!-- brand watermark -->
  <text x="512" y="950" font-size="22" font-family="system-ui,sans-serif"
        fill="white" text-anchor="middle" opacity="0.25">🌙 DreamTales · Demo Mode</text>
</svg>`;

  const b64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}
