"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";

/**
 * BoardBuilder — interactive SVG editor for Catan board states.
 *
 * BOARD LAYOUT JSON SCHEMA
 * ─────────────────────────────────────────────────────────────────────────────
 * The board is stored as a `board_layout` JSONB column in the `puzzles` table.
 * It is never decomposed into relational rows — the whole state is one blob.
 * Cast to/from `BoardLayout` on the way in/out of Supabase:
 *   write: `board_layout: layout as unknown as Json`
 *   read:  `puzzle.board_layout as unknown as BoardLayout`
 *
 * COORDINATE SYSTEM
 * ─────────────────────────────────────────────────────────────────────────────
 * Axial hex coordinates (q, r). (0, 0) is the center tile.
 * Ring 1 is 1 step away; ring 2 is 2 steps away (outer edge).
 * Pointy-top orientation. Pixel center: x = √3·size·(q + r/2), y = 1.5·size·r
 *
 * VERTEX / EDGE INDEXING
 * ─────────────────────────────────────────────────────────────────────────────
 * Each hex has 6 corners (vertices 0–5) and 6 edges (0–5), both starting at
 * the top-right corner/edge and going clockwise. Because adjacent tiles share
 * corners and edges, the same physical point has multiple valid (q,r,vertex)
 * addresses — we always store whichever tile was clicked, so consumers must
 * not assume a canonical tile for a shared vertex.
 *
 * EXAMPLE BLOB
 * ─────────────────────────────────────────────────────────────────────────────
 * {
 *   "tiles": [
 *     { "q": 0,  "r": 0,  "terrain": "fields",  "number": 9  },
 *     { "q": -2, "r": 0,  "terrain": "desert",  "number": 0  },
 *     ...17 more tiles
 *   ],
 *   "settlements": [
 *     { "q": 0, "r": 0, "vertex": 0, "player": "red",  "type": "settlement" },
 *     { "q": 1, "r": 0, "vertex": 3, "player": "red",  "type": "city"       },
 *     { "q": -1,"r": 1, "vertex": 5, "player": "blue", "type": "settlement" }
 *   ],
 *   "roads": [
 *     { "q": 0, "r": 0, "edge": 0, "player": "red"  },
 *     { "q": 1, "r": 0, "edge": 0, "player": "red"  }
 *   ],
 *   "robber": { "q": -2, "r": 0 },
 *   "ports": []
 * }
 *
 * Notes:
 *  • number: 0 on a tile means no token (desert, or blank board).
 *  • robber: null on a fresh/blank board.
 *  • ports: reserved for future port support; always [] for now.
 *  • The blob is ~1–2 KB — well within JSONB limits.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type Terrain =
  | "fields" | "pasture" | "forest"
  | "hills" | "mountains" | "desert";

export type PlayerColor = "red" | "blue" | "white" | "orange";

export interface TileData {
  q: number;
  r: number;
  terrain: Terrain;
  /** 0 = no token (desert or blank) */
  number: number;
}

export interface Settlement {
  /** Tile the vertex belongs to (not necessarily canonical for shared corners) */
  q: number; r: number;
  /** Corner index 0–5, clockwise from top-right */
  vertex: number;
  player: PlayerColor;
  type: "settlement" | "city";
}

export interface Road {
  /** Tile the edge belongs to */
  q: number; r: number;
  /** Edge index 0–5, clockwise from top-right */
  edge: number;
  player: PlayerColor;
}

export interface BoardLayout {
  tiles: TileData[];
  settlements: Settlement[];
  roads: Road[];
  /** null on a blank board; set to the desert tile on a standard random setup */
  robber: { q: number; r: number } | null;
  /** Reserved — always [] until port support is added */
  ports: never[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const HEX_SIZE = 50;

/** All 19 tile positions in axial coords: center, ring-1 (6), ring-2 (12). */
export const TILE_COORDS: { q: number; r: number }[] = [
  { q: 0, r: 0 },
  { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
  { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 },
  { q: 2, r: 0 }, { q: 1, r: 1 }, { q: 0, r: 2 },
  { q: -1, r: 2 }, { q: -2, r: 2 }, { q: -2, r: 1 },
  { q: -2, r: 0 }, { q: -1, r: -1 }, { q: 0, r: -2 },
  { q: 1, r: -2 }, { q: 2, r: -2 }, { q: 2, r: -1 },
];

const TERRAIN_FILL: Record<Terrain, string> = {
  fields:    "#F5C518",
  pasture:   "#7EC850",
  forest:    "#2D7A3A",
  hills:     "#C14A2A",
  mountains: "#8C9BAA",
  desert:    "#E8D5A0",
};

const TERRAIN_ICON: Record<Terrain, string> = {
  fields:    "🌾",
  pasture:   "🐑",
  forest:    "🌲",
  hills:     "🧱",
  mountains: "⛰️",
  desert:    "🏜️",
};

const TERRAIN_NAME: Record<Terrain, string> = {
  fields: "Fields", pasture: "Pasture", forest: "Forest",
  hills: "Hills", mountains: "Mountains", desert: "Desert",
};

const PLAYER_FILL: Record<PlayerColor, string> = {
  red: "#E74C3C", blue: "#2980B9", white: "#ECF0F1", orange: "#E67E22",
};

const TOKENS = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
const RED_TOKENS = new Set([6, 8]);
const ALL_TERRAINS: Terrain[] = ["fields", "pasture", "forest", "hills", "mountains", "desert"];
const ALL_PLAYERS: PlayerColor[] = ["red", "blue", "white", "orange"];

const STD_TERRAINS: Terrain[] = [
  ...Array(4).fill("fields"),
  ...Array(4).fill("pasture"),
  ...Array(4).fill("forest"),
  ...Array(3).fill("hills"),
  ...Array(3).fill("mountains"),
  "desert",
];
const STD_TOKENS = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];

// ── Hex math ──────────────────────────────────────────────────────────────────

function hexCenter(q: number, r: number) {
  return {
    x: HEX_SIZE * Math.sqrt(3) * (q + r / 2),
    y: HEX_SIZE * 1.5 * r,
  };
}

function hexCorners(cx: number, cy: number): { x: number; y: number }[] {
  return Array.from({ length: 6 }, (_, i) => ({
    x: cx + HEX_SIZE * Math.cos(Math.PI / 6 + (Math.PI / 3) * i),
    y: cy + HEX_SIZE * Math.sin(Math.PI / 6 + (Math.PI / 3) * i),
  }));
}

function toPoints(corners: { x: number; y: number }[]) {
  return corners.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
}

// ── Default / random layout ───────────────────────────────────────────────────

export function defaultBoardLayout(): BoardLayout {
  return {
    tiles: TILE_COORDS.map(({ q, r }) => ({ q, r, terrain: "desert", number: 0 })),
    settlements: [],
    roads: [],
    robber: null,
    ports: [],
  };
}

function randomBoardLayout(): BoardLayout {
  const terrains = [...STD_TERRAINS].sort(() => Math.random() - 0.5);
  let ti = 0;
  const tiles: TileData[] = TILE_COORDS.map(({ q, r }, i) => {
    const terrain = terrains[i];
    return { q, r, terrain, number: terrain === "desert" ? 0 : STD_TOKENS[ti++] };
  });
  const desert = tiles.find((t) => t.terrain === "desert");
  return { tiles, settlements: [], roads: [], robber: desert ?? null, ports: [] };
}

// ── Tool type ────────────────────────────────────────────────────────────────

type Tool =
  | { mode: "terrain"; terrain: Terrain }
  | { mode: "token"; value: number }
  | { mode: "robber" }
  | { mode: "settlement" | "city" | "road"; player: PlayerColor };

// ── Piece renderers ──────────────────────────────────────────────────────────

function SettlementPiece({ cx, cy, fill, onClick }: {
  cx: number; cy: number; fill: string;
  onClick: (e: React.MouseEvent<SVGGElement>) => void;
}) {
  return (
    <g className="cursor-pointer" onClick={onClick}>
      <rect x={cx - 5} y={cy - 1} width={10} height={7} rx={0.5}
        fill={fill} stroke="#18181b" strokeWidth={1.5} />
      <polygon points={`${cx - 7},${cy - 1} ${cx + 7},${cy - 1} ${cx},${cy - 9}`}
        fill={fill} stroke="#18181b" strokeWidth={1.5} strokeLinejoin="round" />
      <rect x={cx - 2} y={cy + 2} width={4} height={4} rx={0.5}
        fill="rgba(0,0,0,0.45)" />
      <rect x={cx - 4} y={cy + 0} width={3} height={3} rx={0.5}
        fill="rgba(255,255,255,0.25)" />
    </g>
  );
}

function CityPiece({ cx, cy, fill, onClick }: {
  cx: number; cy: number; fill: string;
  onClick: (e: React.MouseEvent<SVGGElement>) => void;
}) {
  return (
    <g className="cursor-pointer" onClick={onClick}>
      {/* Center body */}
      <rect x={cx - 8} y={cy - 3} width={16} height={10} rx={0.5}
        fill={fill} stroke="#18181b" strokeWidth={2} />
      {/* Left tower */}
      <rect x={cx - 12} y={cy - 9} width={7} height={16} rx={0.5}
        fill={fill} stroke="#18181b" strokeWidth={1.5} />
      {/* Right tower */}
      <rect x={cx + 5} y={cy - 9} width={7} height={16} rx={0.5}
        fill={fill} stroke="#18181b" strokeWidth={1.5} />
      {/* Left battlements */}
      <rect x={cx - 12} y={cy - 13} width={2.5} height={4.5} fill={fill} stroke="#18181b" strokeWidth={1.2} />
      <rect x={cx - 8} y={cy - 13} width={2.5} height={4.5} fill={fill} stroke="#18181b" strokeWidth={1.2} />
      {/* Right battlements */}
      <rect x={cx + 5} y={cy - 13} width={2.5} height={4.5} fill={fill} stroke="#18181b" strokeWidth={1.2} />
      <rect x={cx + 9} y={cy - 13} width={2.5} height={4.5} fill={fill} stroke="#18181b" strokeWidth={1.2} />
      {/* Gate arch */}
      <path d={`M${cx-3},${cy+7} L${cx-3},${cy+2} Q${cx},${cy-2} ${cx+3},${cy+2} L${cx+3},${cy+7}`}
        fill="rgba(0,0,0,0.4)" />
      {/* Tower windows */}
      <rect x={cx - 10} y={cy - 6} width={3} height={3} rx={0.5} fill="rgba(0,0,0,0.35)" />
      <rect x={cx + 7} y={cy - 6} width={3} height={3} rx={0.5} fill="rgba(0,0,0,0.35)" />
    </g>
  );
}

// ── Palette sub-components ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-500 mb-2">
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-zinc-800" />;
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  value: BoardLayout;
  onChange: (layout: BoardLayout) => void;
}

export default function BoardBuilder({ value, onChange }: Props) {
  const [tool, setTool] = useState<Tool>({ mode: "terrain", terrain: "fields" });
  const [activePlayer, setActivePlayer] = useState<PlayerColor>("red");

  const tiles = useMemo(
    () =>
      value.tiles.map((t) => {
        const center = hexCenter(t.q, t.r);
        const corners = hexCorners(center.x, center.y);
        return { ...t, center, corners };
      }),
    [value.tiles]
  );

  // Unique vertex targets (settlement / city mode only)
  const vertexTargets = useMemo(() => {
    if (tool.mode !== "settlement" && tool.mode !== "city") return [];
    const seen = new Map<string, { x: number; y: number; q: number; r: number; vertex: number }>();
    for (const tile of tiles) {
      for (let i = 0; i < 6; i++) {
        const c = tile.corners[i];
        const key = `${Math.round(c.x * 2)},${Math.round(c.y * 2)}`;
        if (!seen.has(key)) seen.set(key, { x: c.x, y: c.y, q: tile.q, r: tile.r, vertex: i });
      }
    }
    return Array.from(seen.values());
  }, [tiles, tool.mode]);

  // Unique edge targets (road mode only)
  const edgeTargets = useMemo(() => {
    if (tool.mode !== "road") return [];
    const seen = new Map<string, { x: number; y: number; q: number; r: number; edge: number }>();
    for (const tile of tiles) {
      for (let i = 0; i < 6; i++) {
        const c1 = tile.corners[i];
        const c2 = tile.corners[(i + 1) % 6];
        const mx = (c1.x + c2.x) / 2;
        const my = (c1.y + c2.y) / 2;
        const key = `${Math.round(mx * 2)},${Math.round(my * 2)}`;
        if (!seen.has(key)) seen.set(key, { x: mx, y: my, q: tile.q, r: tile.r, edge: i });
      }
    }
    return Array.from(seen.values());
  }, [tiles, tool.mode]);

  const onTileClick = useCallback(
    (q: number, r: number) => {
      if (tool.mode === "terrain") {
        onChange({
          ...value,
          tiles: value.tiles.map((t) =>
            t.q === q && t.r === r
              ? { ...t, terrain: tool.terrain, number: tool.terrain === "desert" ? 0 : t.number }
              : t
          ),
        });
      } else if (tool.mode === "token") {
        onChange({
          ...value,
          tiles: value.tiles.map((t) =>
            t.q === q && t.r === r && t.terrain !== "desert"
              ? { ...t, number: tool.value }
              : t
          ),
        });
      } else if (tool.mode === "robber") {
        onChange({ ...value, robber: { q, r } });
      }
    },
    [tool, value, onChange]
  );

  const onVertexClick = useCallback(
    (q: number, r: number, vertex: number) => {
      if (tool.mode !== "settlement" && tool.mode !== "city") return;
      const idx = value.settlements.findIndex(
        (s) => s.q === q && s.r === r && s.vertex === vertex
      );
      if (idx >= 0) {
        const s = value.settlements[idx];
        if (tool.mode === "city" && s.type === "settlement") {
          onChange({
            ...value,
            settlements: value.settlements.map((ss, i) =>
              i === idx ? { ...ss, type: "city" } : ss
            ),
          });
        } else {
          onChange({ ...value, settlements: value.settlements.filter((_, i) => i !== idx) });
        }
      } else {
        onChange({
          ...value,
          settlements: [...value.settlements, { q, r, vertex, player: tool.player, type: tool.mode }],
        });
      }
    },
    [tool, value, onChange]
  );

  const onEdgeClick = useCallback(
    (q: number, r: number, edge: number) => {
      if (tool.mode !== "road") return;
      const idx = value.roads.findIndex((rd) => rd.q === q && rd.r === r && rd.edge === edge);
      if (idx >= 0) {
        onChange({ ...value, roads: value.roads.filter((_, i) => i !== idx) });
      } else {
        onChange({ ...value, roads: [...value.roads, { q, r, edge, player: tool.player }] });
      }
    },
    [tool, value, onChange]
  );

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* ── SVG Board ── */}
      <div className="flex-1 flex justify-center items-start">
        <svg
          viewBox="-225 -215 450 430"
          className="w-full max-w-[520px] rounded-2xl shadow-2xl"
          style={{ background: "hsl(210 65% 28%)" }}
        >
          {/* Tiles */}
          {tiles.map((tile) => {
            const hasRobber = value.robber?.q === tile.q && value.robber?.r === tile.r;
            return (
              <g
                key={`${tile.q},${tile.r}`}
                onClick={() => onTileClick(tile.q, tile.r)}
                className="cursor-pointer"
              >
                <polygon
                  points={toPoints(tile.corners)}
                  fill={TERRAIN_FILL[tile.terrain]}
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth="1.5"
                />
                <text
                  x={tile.center.x}
                  y={tile.center.y - (tile.number > 0 ? 10 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="22"
                >
                  {TERRAIN_ICON[tile.terrain]}
                </text>
                {tile.number > 0 && (
                  <g>
                    <circle
                      cx={tile.center.x}
                      cy={tile.center.y + 18}
                      r={15}
                      fill="#EDE5C0"
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth="1"
                    />
                    <text
                      x={tile.center.x}
                      y={tile.center.y + 18}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="13"
                      fontWeight="bold"
                      fill={RED_TOKENS.has(tile.number) ? "#B91C1C" : "#1C120A"}
                    >
                      {tile.number}
                    </text>
                  </g>
                )}
                {hasRobber && (
                  <g>
                    <circle cx={tile.center.x + 24} cy={tile.center.y - 24} r={12} fill="#18181b" />
                    <text
                      x={tile.center.x + 24}
                      y={tile.center.y - 24}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fill="#e4e4e7"
                      fontWeight="bold"
                    >
                      R
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Roads */}
          {value.roads.map((road, i) => {
            const tile = tiles.find((t) => t.q === road.q && t.r === road.r);
            if (!tile) return null;
            const c1 = tile.corners[road.edge];
            const c2 = tile.corners[(road.edge + 1) % 6];
            return (
              <line
                key={i}
                x1={c1.x} y1={c1.y} x2={c2.x} y2={c2.y}
                stroke={PLAYER_FILL[road.player]}
                strokeWidth="7"
                strokeLinecap="round"
                className="cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onEdgeClick(road.q, road.r, road.edge); }}
              />
            );
          })}

          {/* Settlements / Cities */}
          {value.settlements.map((s, i) => {
            const tile = tiles.find((t) => t.q === s.q && t.r === s.r);
            if (!tile) return null;
            const corner = tile.corners[s.vertex];
            const handleClick = (e: React.MouseEvent<SVGGElement>) => {
              e.stopPropagation();
              onVertexClick(s.q, s.r, s.vertex);
            };
            return s.type === "city"
              ? <CityPiece key={i} cx={corner.x} cy={corner.y} fill={PLAYER_FILL[s.player]} onClick={handleClick} />
              : <SettlementPiece key={i} cx={corner.x} cy={corner.y} fill={PLAYER_FILL[s.player]} onClick={handleClick} />;
          })}

          {/* Vertex hit targets */}
          {vertexTargets.map((v, i) => (
            <circle
              key={i}
              cx={v.x} cy={v.y} r={9}
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              className="cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onVertexClick(v.q, v.r, v.vertex); }}
            />
          ))}

          {/* Edge hit targets */}
          {edgeTargets.map((e, i) => (
            <circle
              key={i}
              cx={e.x} cy={e.y} r={7}
              fill="rgba(255,255,255,0.15)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              className="cursor-pointer"
              onClick={(ev) => { ev.stopPropagation(); onEdgeClick(e.q, e.r, e.edge); }}
            />
          ))}
        </svg>
      </div>

      {/* ── Tool Palette ── */}
      <div className="w-full xl:w-64 flex flex-col gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shrink-0">

        {/* Terrain */}
        <div>
          <SectionLabel>Terrain</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {ALL_TERRAINS.map((terrain) => {
              const active = tool.mode === "terrain" && tool.terrain === terrain;
              return (
                <button
                  key={terrain}
                  title={TERRAIN_NAME[terrain]}
                  onClick={() => setTool({ mode: "terrain", terrain })}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all duration-150 hover:scale-105 active:scale-95 ${
                    active
                      ? "border-white/70 scale-105 shadow-[0_0_14px_rgba(255,255,255,0.18)]"
                      : "border-transparent hover:border-white/20"
                  }`}
                  style={{ backgroundColor: TERRAIN_FILL[terrain] }}
                >
                  <span className="text-xl leading-none drop-shadow-sm">{TERRAIN_ICON[terrain]}</span>
                  <span className="text-[9px] font-bold text-stone-900/75 leading-none">{TERRAIN_NAME[terrain]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Tokens */}
        <div>
          <SectionLabel>Number Token</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {TOKENS.map((n) => {
              const active = tool.mode === "token" && tool.value === n;
              return (
                <button
                  key={n}
                  onClick={() => setTool({ mode: "token", value: n })}
                  className={`w-9 h-9 rounded-full text-xs font-black transition-all duration-150 border-2 active:scale-90 ${
                    active
                      ? "scale-110 border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      : "border-transparent opacity-65 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: "#EDE5C0",
                    color: RED_TOKENS.has(n) ? "#B91C1C" : "#1C120A",
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Special */}
        <div>
          <SectionLabel>Special</SectionLabel>
          <button
            onClick={() => setTool({ mode: "robber" })}
            className={`w-full py-2 rounded-xl border font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 ${
              tool.mode === "robber"
                ? "border-zinc-400 bg-zinc-800 text-white"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-600 flex items-center justify-center text-[9px] font-black text-zinc-300">
              R
            </span>
            Robber
          </button>
        </div>

        <Divider />

        {/* Pieces */}
        <div>
          <SectionLabel>Pieces</SectionLabel>
          <div className="flex gap-2.5 mb-3">
            {ALL_PLAYERS.map((p) => (
              <button
                key={p}
                title={p}
                onClick={() => {
                  setActivePlayer(p);
                  if (tool.mode === "settlement" || tool.mode === "city" || tool.mode === "road") {
                    setTool({ ...tool, player: p });
                  }
                }}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
                  activePlayer === p
                    ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.25)]"
                    : "border-transparent opacity-40 hover:opacity-80 hover:scale-105"
                }`}
                style={{ backgroundColor: PLAYER_FILL[p] }}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(["settlement", "city", "road"] as const).map((piece) => {
              const active = tool.mode === piece;
              const color = active ? PLAYER_FILL[activePlayer] : "#71717a";
              const label = piece === "road" ? "Road" : piece === "city" ? "City" : "Town";
              return (
                <button
                  key={piece}
                  onClick={() => setTool({ mode: piece, player: activePlayer })}
                  className={`py-2 rounded-xl border font-semibold text-[10px] flex flex-col items-center gap-1.5 transition-all duration-150 ${
                    active
                      ? "border-zinc-400 bg-zinc-800 text-white"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  {piece === "settlement" && (
                    <svg width="22" height="20" viewBox="-11 -10 22 18">
                      <polygon points="-7,-1 7,-1 0,-9" fill={color} stroke="#18181b" strokeWidth="1.5" strokeLinejoin="round" />
                      <rect x="-5" y="-1" width="10" height="7" rx="0.5" fill={color} stroke="#18181b" strokeWidth="1.5" />
                      <rect x="-2" y="2" width="4" height="4" rx="0.5" fill="rgba(0,0,0,0.45)" />
                    </svg>
                  )}
                  {piece === "city" && (
                    <svg width="28" height="22" viewBox="-14 -14 28 20">
                      <rect x="-8" y="-3" width="16" height="9" rx="0.5" fill={color} stroke="#18181b" strokeWidth="1.5" />
                      <rect x="-12" y="-9" width="7" height="15" rx="0.5" fill={color} stroke="#18181b" strokeWidth="1.5" />
                      <rect x="5" y="-9" width="7" height="15" rx="0.5" fill={color} stroke="#18181b" strokeWidth="1.5" />
                      <rect x="-12" y="-13" width="2.5" height="4" fill={color} stroke="#18181b" strokeWidth="1" />
                      <rect x="-8" y="-13" width="2.5" height="4" fill={color} stroke="#18181b" strokeWidth="1" />
                      <rect x="5" y="-13" width="2.5" height="4" fill={color} stroke="#18181b" strokeWidth="1" />
                      <rect x="9" y="-13" width="2.5" height="4" fill={color} stroke="#18181b" strokeWidth="1" />
                    </svg>
                  )}
                  {piece === "road" && (
                    <svg width="28" height="12" viewBox="-14 -6 28 12">
                      <line x1="-12" y1="0" x2="12" y2="0" stroke={color} strokeWidth="5" strokeLinecap="round" />
                    </svg>
                  )}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-150 active:scale-95"
            onClick={() => onChange(randomBoardLayout())}
          >
            🎲 Random
          </button>
          <button
            className="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 hover:border-zinc-500 transition-all duration-150 active:scale-95"
            onClick={() => onChange(defaultBoardLayout())}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
