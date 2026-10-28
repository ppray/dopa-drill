// 小茉莉: a big-headed rubber-hose girl drawn as layered SVG in screen space.
// The rig (springs, poses, actions) comes from Dopa Drill's mascot; the art is new.
// Unit space: feet at y=0, head centre at y=-100.
// Body parts are springs; actions are cancellable async routines.
import { Spring, tween, wait, lerp, clamp, rand, pick, quadPoint, easeOutQuad, easeInQuad, easeOutBack, easeInOutCubic, easeOutCubic, onFrame } from './core.js';

const NS = 'http://www.w3.org/2000/svg';
export const INK = '#000';
const SKIN = '#ffe6d3';
const HAIR = '#2b1c18';
const HAIR_HI = '#5e463d';
const IRIS = '#3b2419';
const CHEEK = '#ffa9b1';
const SHADES = '#ff3d3d';
// Outfit colours (id041, id044): body = denim vest, inner = tie, leg = shoes.
// 'pink' stays the default key (it is hardcoded elsewhere); it is the look from the photos.
export const PALETTES = {
  pink: { body: '#34466e', inner: '#ff4a3d', leg: '#ff4a3d', cheek: CHEEK },
  blue: { body: '#6fa0ff', inner: '#ffd452', leg: '#ff97bf', cheek: CHEEK },
  yellow: { body: '#ffd452', inner: '#ff5a4f', leg: '#2f79f7', cheek: CHEEK },
  mint: { body: '#5eddb8', inner: '#7b5cff', leg: '#7b5cff', cheek: CHEEK },
  violet: { body: '#b793ff', inner: '#ffd452', leg: '#ff97bf', cheek: CHEEK },
  // Unlockable colours for the hero (id041, id044).
  gold: { body: '#ffc53d', inner: '#ff4f6d', leg: '#ff7ab6', cheek: CHEEK },
  snow: { body: '#f4f6ff', inner: '#3b6bff', leg: '#3b6bff', cheek: CHEEK },
  rainbow: { body: 'url(#dk-rainbow)', inner: '#ff4a3d', leg: '#2f79f7', cheek: CHEEK },
};

// Costumes. head: moves with the head (drawn for the original head, fitted by
// HAT_FIT); face: on the face; back: behind the body (capes); hide: base parts
// (bun, shades, flower) a costume takes the place of.
export const COSTUMES = {
  cap: { hide: ['bun', 'shades', 'flower'], head: `<path class="dk-l" d="M-44 -133 C-44 -166 44 -166 44 -133 Z" fill="#3b6bff"/><path class="dk-l" d="M-6 -133 C10 -140 52 -142 60 -132 C52 -126 20 -126 -6 -133Z" fill="#2a4fd6"/><circle class="dk-l" cx="0" cy="-160" r="5" fill="#ffd23f"/><path d="M-30 -147 Q0 -158 30 -147" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>` },
  mortarboard: { hide: ['bun', 'shades', 'flower'], head: `<path class="dk-l" d="M-36 -134 L-32 -154 L32 -154 L36 -134 Q0 -128 -36 -134Z" fill="#3a3f9e"/><path class="dk-l" d="M-58 -156 L0 -172 L58 -156 L0 -140Z" fill="#4b52c8"/><path d="M-46 -158 L0 -167" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><path d="M0 -156 Q30 -152 50 -154 L52 -132" fill="none" stroke="#1b1d4d" stroke-width="6" stroke-linejoin="round"/><path d="M0 -156 Q30 -152 50 -154 L52 -132" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linejoin="round"/><circle class="dk-l" cx="0" cy="-156" r="5" fill="#ffd23f"/><path class="dk-l" d="M47 -134 L57 -134 L59 -116 L45 -116Z" fill="#ffd23f"/>` },
  cape: { back: `<path class="dk-l" d="M-30 -58 C-60 -30 -64 -10 -58 4 L58 4 C64 -10 60 -30 30 -58 Z" fill="#ff4f6d"/><path d="M-50 -2 L50 -2" stroke="#ffd23f" stroke-width="5"/>`, head: `<path class="dk-l" d="M-24 -66 Q0 -58 24 -66 L20 -58 Q0 -52 -20 -58Z" fill="#ff4f6d"/><circle class="dk-l" cx="0" cy="-59" r="4.5" fill="#ffd23f"/>` },
  crown: { hide: ['bun', 'shades', 'flower'], head: `<path class="dk-l" d="M-32 -140 L-36 -176 L-18 -156 L0 -184 L18 -156 L36 -176 L32 -140 Z" fill="#ffd23f"/><circle class="dk-l" cx="0" cy="-160" r="5" fill="#ff4f6d"/><circle class="dk-l" cx="-22" cy="-150" r="3.5" fill="#3b6bff"/><circle class="dk-l" cx="22" cy="-150" r="3.5" fill="#3fdcb0"/>` },
  glasses: { hide: ['shades'], face: `<g class="dk-l" fill="rgba(255,255,255,.25)"><circle cx="-21" cy="-96" r="15"/><circle cx="21" cy="-96" r="15"/></g><path class="dk-l" d="M-6 -97 Q0 -102 6 -97 M-36 -99 L-50 -103 M36 -99 L50 -103" fill="none"/>` },
  ribbon: { hide: ['bun', 'shades', 'flower'], head: `<path class="dk-l" d="M0 -150 C-14 -176 -46 -170 -36 -150 C-30 -140 -12 -142 0 -150Z M0 -150 C14 -176 46 -170 36 -150 C30 -140 12 -142 0 -150Z" fill="#ff5a9c"/><circle class="dk-l" cx="0" cy="-151" r="7" fill="#ff7ab6"/><path d="M-28 -160 Q-20 -156 -14 -152 M28 -160 Q20 -156 14 -152" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>` },
  headphones: { hide: ['shades', 'flower'], head: `<path class="dk-l" d="M-60 -110 C-60 -178 60 -178 60 -110" fill="none" stroke-width="7" stroke="#1b1d4d"/><path d="M-60 -110 C-60 -178 60 -178 60 -110" fill="none" stroke="#a77bff" stroke-width="5"/><rect class="dk-l" x="-68" y="-122" width="16" height="30" rx="7" fill="#a77bff"/><rect class="dk-l" x="52" y="-122" width="16" height="30" rx="7" fill="#a77bff"/>` },
  wizard: { hide: ['bun', 'shades', 'flower'], head: `<path class="dk-l" d="M-52 -138 Q0 -152 52 -138 Q0 -128 -52 -138Z" fill="#5b3fd6"/><path class="dk-l" d="M-34 -141 C-20 -170 -4 -208 22 -222 C14 -200 26 -170 34 -141 Z" fill="#6f52ff"/><path class="dk-l" d="M-4 -182 L-1 -175 L6 -175 L0 -170 L3 -163 L-4 -167 L-10 -163 L-8 -170 L-14 -175 L-6 -175Z" fill="#ffd23f"/><circle class="dk-l" cx="22" cy="-222" r="5" fill="#ffd23f"/>` },
};
// Hats were drawn for a smaller head: scale them up about the head and lift them.
const HAT_FIT = 'translate(0 -106) scale(1.12) translate(0 100)';
const hatSVG = (c) => (c.head ? `<g transform="${HAT_FIT}">${c.head}</g>` : '');

const el = (name, attrs = {}, parent) => {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};

// Outlines use the class "dk-l" (stroke width from --dkw); expression
// strokes use "dk-f", slightly heavier so faces stay readable when small.
const L = 'class="dk-l"';
const F = 'class="dk-f"';
// Eye rings use a thinner line so the white ring stays visible, as in the drawing.
const T = 'class="dk-t"';
const EYE = {
  open: () => `<ellipse rx="9.6" ry="11" fill="#fff" ${T}/><g class="dk-iris"><ellipse rx="7.4" ry="8.8" fill="${IRIS}"/><circle cx="-2.6" cy="-3.6" r="2.7" fill="#fff"/><circle cx="2.6" cy="3.2" r="1.2" fill="#fff"/></g><path d="M-9.8 -4.5 Q0 -16.6 9.8 -4.5" fill="none" ${L}/>`,
  wide: () => `<ellipse rx="11" ry="12.4" fill="#fff" ${T}/><g class="dk-iris"><circle r="5.2" fill="${IRIS}"/><circle cx="-1.6" cy="-1.8" r="1.6" fill="#fff"/></g>`,
  happy: () => `<path d="M-9 3 Q0 -10 9 3" fill="none" ${F}/>`,
  closed: () => `<path d="M-9 -1 Q0 7 9 -1" fill="none" ${F}/>`,
  x: () => `<path d="M-7 -7 L7 7 M7 -7 L-7 7" fill="none" ${F}/>`,
  swirl: () => `<path d="M0 0 m0 -1.3 a1.3 1.3 0 1 1 -1.3 1.3 a3.4 3.4 0 1 1 3.4 3.4 a5.7 5.7 0 1 1 -5.7 -5.7 a8.3 8.3 0 1 1 8.3 8.3" fill="none" ${L}/>`,
  star: () => `<path d="M0 -12 L3.5 -3.8 L12 -3.6 L5.3 1.9 L7.6 10.3 L0 5.5 L-7.6 10.3 L-5.3 1.9 L-12 -3.6 L-3.5 -3.8Z" fill="#ffd23f" ${L}/>`,
  heart: () => `<path d="M0 9.6 C-14.4 -1.2 -10.8 -13.2 -4.3 -11.4 C-1.9 -10.8 0 -8.4 0 -6.5 C0 -8.4 1.9 -10.8 4.3 -11.4 C10.8 -13.2 14.4 -1.2 0 9.6Z" fill="#ff2d7a" ${L}/>`,
  tight: () => `<path d="M-8 -5 L6 0 L-8 5" fill="none" ${F}/>`,
};
// Two lashes on the outer corner of an open eye (s: -1 left eye, 1 right eye).
const LASH = (s) => `<path d="M${s * 8.2} -8.4 L${s * 12.2} -11 M${s * 9.6} -5.6 L${s * 13.2} -7" fill="none" ${L}/>`;
// Brow pose per eye expression: lift (up) and tilt (degrees, inner ends up when > 0).
const BROW = { happy: [1, 0], star: [1.2, 0], heart: [1, 0], wide: [1.6, 0], x: [0.4, 18], swirl: [0.2, 14], tight: [0, -16], closed: [0, 8] };
const MOUTH = {
  smile: `<path d="M-8.1 -1.3 C-4.9 3 4.9 3 8.1 -1.3" fill="none" ${L}/>`,
  // A small pout (嘟嘴), used for the lighter celebrations.
  cat: `<path d="M0 -1.8 C-1.6 -4.6 -6.2 -4 -5.6 -0.6 C-5.2 2.6 -1.8 3.8 0 2.4 C1.8 3.8 5.2 2.6 5.6 -0.6 C6.2 -4 1.6 -4.6 0 -1.8Z" fill="#ff7088" ${L}/><path d="M-3.2 -1.6 Q-1.8 -2.6 -0.7 -1.2" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>`,
  grin: `<path d="M-10 -3 Q0 -1 10 -3 Q9 12 0 12 Q-9 12 -10 -3Z" fill="#7a1840" ${L}/><path d="M-5 8 Q0 4 5 8 Q3 11.5 0 11.6 Q-3 11.5 -5 8Z" fill="#ff7aa8"/>`,
  o: `<ellipse rx="4.6" ry="5.8" fill="#7a1840" ${L}/>`,
  big: `<ellipse rx="9" ry="11" fill="#7a1840" ${L}/><ellipse cy="5" rx="5.5" ry="4" fill="#ff7aa8"/>`,
  wobble: `<path d="M-10 1 L-6 -3 L-2 2 L2 -3 L6 2 L10 -2" fill="none" ${L}/>`,
  flat: `<path d="M-6 0 L6 0" fill="none" ${L}/>`,
  puff: `<path d="M-3 0 L3 0" fill="none" ${L}/>`,
};

// Shape constants (unit space, feet at y=0).
export const G = {
  foot: 'M-19.3 -18.5 C-24.8 -18.5 -28.1 -16 -32.8 -11.3 C-36.7 -7.4 -38.9 -4.9 -35.8 -2.3 C-31.5 1.4 -24.1 1.1 -18.2 -2 C-12.1 -4.9 -8.5 -9.2 -12.1 -14.8 C-13.9 -17.6 -16.2 -18.5 -19.3 -18.5Z',
  footPivot: { x: 18.5, y: -15.8 },
  // Body fill reaches up under the head; the neck has no drawn seam.
  bodyFill: 'M-37.4 -65.7 C-29.7 -61 -25.2 -54.2 -25.2 -46.8 C-25.2 -40.5 -28.8 -35.3 -28.8 -28.4 C-28.8 -18.4 -20.7 -13.5 -10.8 -13.5 L10.8 -13.5 C20.7 -13.5 28.8 -18.4 28.8 -28.4 C28.8 -35.3 25.2 -40.5 25.2 -46.8 C25.2 -54.2 29.7 -61 37.4 -65.7 L37.4 -75.2 L-37.4 -75.2Z',
  bodyLine: 'M-37.4 -65.7 C-29.7 -61 -25.2 -54.2 -25.2 -46.8 C-25.2 -40.5 -28.8 -35.3 -28.8 -28.4 C-28.8 -18.4 -20.7 -13.5 -10.8 -13.5 L10.8 -13.5 C20.7 -13.5 28.8 -18.4 28.8 -28.4 C28.8 -35.3 25.2 -40.5 25.2 -46.8 C25.2 -54.2 29.7 -61 37.4 -65.7',
  // Hair mass behind the face, the face, and the choppy baby bangs.
  hairBack: 'M-50 -76 C-60 -92 -61 -118 -50 -136 C-40 -152 -22 -160 0 -160 C22 -160 40 -152 50 -136 C61 -118 60 -92 50 -76 C40 -72 -40 -72 -50 -76Z',
  face: 'M0 -127 C27 -127 50 -117 51.5 -96 C53 -76 37 -60 0 -60 C-37 -60 -53 -76 -51.5 -96 C-50 -117 -27 -127 0 -127Z',
  bangs: 'M-52 -110 C-56 -134 -36 -158 0 -158 C36 -158 56 -134 52 -110 C48 -114 44 -117 40 -113 C36 -119 30 -121 25 -115 C20 -122 13 -123 8 -117 C4 -124 -4 -124 -8 -117 C-13 -123 -20 -122 -25 -115 C-30 -121 -36 -119 -40 -113 C-44 -117 -48 -114 -52 -110Z',
  // Left side lock (mirrored for the right); it swings from the temple like the old ears.
  lock: 'M-44 -120 C-60 -116 -58 -100 -64 -90 C-71 -78 -62 -70 -67 -58 C-70 -50 -62 -45 -57 -50 C-59 -53 -60 -57 -56 -60 C-50 -68 -58 -78 -51 -88 C-46 -96 -50 -108 -40 -116Z',
  head: { cy: -100, r: 58 },
  neckY: -65.7,
  ear: { pivot: 44, cy: -114 },
  eye: { x: 21, y: -96 },
  brow: { x: 21, y: -109.5, rx: 5.2, ry: 1.7 },
  mouthY: -74.5,
  cheek: { x: 32, y: -80, rx: 8.4, ry: 4.8 },
  shoulder: { x: 25.7, y: -48 },
  rest: { x: 37.8, y: -34.7 },
  arm: 4.6,
  hand: 9.7,
};

// Outline width in unit space: thin like the drawing, with a pixel floor.
const lineFor = (S) => clamp(1.7 / S, 1.4, 3.2);

// Static parts shared by the live actor and the sprite image.
const lockSVG = (s) => `<g${s > 0 ? ' transform="scale(-1 1)"' : ''}><path ${L} d="${G.lock}" fill="${HAIR}"/><path d="M-59 -95 C-64 -84 -59 -76 -63 -66" fill="none" stroke="${HAIR_HI}" stroke-width="2.2" stroke-linecap="round"/></g>`;
const footSVG = (p, s) => `<path ${L} d="${G.foot}" fill="${p.leg}"${s > 0 ? ' transform="scale(-1 1)"' : ''}/>`;
// Denim vest with a V neck and a red polka-dot tie (the photo-shoot outfit).
const bodySVG = (p) => `<path d="${G.bodyFill}" fill="${p.body}"/><path ${L} d="${G.bodyLine}" fill="none"/>`
  + `<path d="M-13 -66 L0 -50 L13 -66Z" fill="${SKIN}"/><path ${L} d="M-13 -66 L0 -50 L13 -66" fill="none"/>`
  + `<path ${L} d="M-4.6 -58 L4.6 -58 L3.6 -50 L-3.6 -50Z" fill="${p.inner}"/><path ${L} d="M-3.6 -50 L3.6 -50 L7.5 -27 L0 -19 L-7.5 -27Z" fill="${p.inner}"/>`
  + '<g fill="#fff"><circle cx="-1.8" cy="-44" r="1.3"/><circle cx="2.6" cy="-37.5" r="1.3"/><circle cx="-2.6" cy="-31" r="1.3"/><circle cx="2.2" cy="-25" r="1.2"/></g>';
const bunSVG = () => `<circle ${L} cx="0" cy="-165" r="16" fill="${HAIR}"/><path d="M-8 -172 Q0 -178 8 -171 M-10 -161 Q-2 -156 8 -160" fill="none" stroke="${HAIR_HI}" stroke-width="2.4" stroke-linecap="round"/>`;
const EAR = (s) => `<ellipse ${L} cx="${s * 51}" cy="-90" rx="7" ry="9" fill="${SKIN}"/><path d="M${s * 52.5} -94 Q${s * 50} -90 ${s * 52.5} -86" fill="none" stroke="#e3a78f" stroke-width="1.6" stroke-linecap="round"/>`
  + `<path class="dk-t" d="M0 3.6 C-5.4 -0.5 -4 -5 -1.6 -4.3 C-0.7 -4 0 -3.2 0 -2.4 C0 -3.2 0.7 -4 1.6 -4.3 C4 -5 5.4 -0.5 0 3.6Z" fill="#3b6bff" transform="translate(${s * 53} -78)"/>`;
const headSVG = () => `<path ${L} d="${G.hairBack}" fill="${HAIR}"/>${EAR(-1)}${EAR(1)}<path ${L} d="${G.face}" fill="${SKIN}"/>`
  + '<path d="M-1.8 -85.5 Q0 -83.8 1.8 -85.5" fill="none" stroke="#c98b76" stroke-width="1.8" stroke-linecap="round"/>'
  + `<path ${L} d="${G.bangs}" fill="${HAIR}"/><path d="M-32 -140 Q-14 -149 6 -146 M16 -146 Q24 -145 30 -141" fill="none" stroke="${HAIR_HI}" stroke-width="3.2" stroke-linecap="round"/>`;
// Red sunglasses pushed up on the head (her signature), and a jasmine flower.
const shadesSVG = () => `<rect ${L} x="-40" y="-147" width="30" height="18" rx="7" fill="${SHADES}"/><rect ${L} x="10" y="-147" width="30" height="18" rx="7" fill="${SHADES}"/>`
  + '<rect x="-36.5" y="-143.5" width="23" height="11" rx="4.5" fill="#2e2233"/><rect x="13.5" y="-143.5" width="23" height="11" rx="4.5" fill="#2e2233"/>'
  + `<path d="M-10.5 -139 Q0 -144 10.5 -139" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M-10.5 -139 Q0 -144 10.5 -139" fill="none" stroke="${SHADES}" stroke-width="3" stroke-linecap="round"/>`
  + '<path d="M-32 -140.5 L-26 -140.5 M17 -140.5 L23 -140.5" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"/>';
const flowerSVG = () => `<g transform="translate(-27 -150) rotate(-12)"><ellipse ${L} cx="-9" cy="3" rx="5" ry="2.8" fill="#5fcf8f" transform="rotate(-25 -9 3)"/>`
  + [0, 72, 144, 216, 288].map((a) => `<ellipse ${L} cy="-5.2" rx="3.6" ry="5.6" fill="#fff" transform="rotate(${a})"/>`).join('')
  + `<circle ${L} r="2.6" fill="#ffd23f"/></g>`;
const PARTS = { bun: bunSVG, shades: shadesSVG, flower: flowerSVG };
const STYLE = `.dk-l,.dk-f,.dk-t{stroke:${INK};stroke-linecap:round;stroke-linejoin:round}.dk-l{stroke-width:var(--dkw)}.dk-f{stroke-width:calc(var(--dkw) * 1.5)}.dk-t{stroke-width:calc(var(--dkw) * 0.55)}`;

let uid = 0;

export class Dopakichi {
  constructor(layer, { scale = 0.7, palette = 'pink', front } = {}) {
    this.layer = layer;
    this.S = scale;
    this.lw = lineFor(scale);
    this.pal = PALETTES[palette];
    this.id = uid++;
    this.x = 0; this.y = 0;
    this.home = { x: 0, y: 0 };
    this.ground = null;
    this.rot = 0;
    this.lift = 0;
    this.sq = new Spring(1, 260, 11);
    this.lean = new Spring(0, 120, 12);
    this.tilt = new Spring(0, 160, 10);
    this.earL = new Spring(0, 180, 7);
    this.earR = new Spring(0, 180, 7);
    this.stretchX = 1; this.stretchY = 1;
    this.look = { x: 0, y: 0 }; this.lookTarget = { x: 0, y: 0 };
    this.eyes = null; this.mouth = null;
    this.baseEyes = 'open'; this.baseMouth = 'smile';
    this.blinkAt = performance.now() + 1800; this.blinkK = 0;
    this.browLift = new Spring(0, 220, 14);
    this.browTilt = new Spring(0, 220, 14);
    this.cheekPuff = 0;
    this.visible = true;
    this.opacity = 1;
    this.bob = 0;
    this.shake = 0;
    this.hands = [this.makeHand(-1), this.makeHand(1)];
    this.token = 0;
    this.busy = false;
    this.build(front);
  }

  makeHand(side) { return { side, mode: 'rest', x: 0, y: 0, job: 0, carry: null, raise: 0 }; }

  build(front) {
    const p = this.pal;
    this.front = front;
    this.root = el('g', { class: 'dk' }, this.layer);
    this.root.style.setProperty('--dkw', this.lw);
    this.shadow = el('ellipse', { rx: 40, ry: 7, fill: INK, opacity: 0.14 }, this.root);
    this.bodyG = el('g', {}, this.root);
    this.backG = el('g', {}, this.bodyG);
    this.feet = [-1, 1].map((s) => { const g = el('g', {}, this.bodyG); g.innerHTML = footSVG(p, s); return g; });
    el('g', {}, this.bodyG).innerHTML = bodySVG(p);
    this.headG = el('g', {}, this.bodyG);
    // Side locks keep the old ear springs (earL / earR), so every ear flap is a hair flip.
    this.earGs = [-1, 1].map((s) => { const g = el('g', {}, this.headG); g.innerHTML = lockSVG(s); return { g, s }; });
    this.parts = {};
    this.parts.bun = el('g', {}, this.headG); this.parts.bun.innerHTML = bunSVG();
    el('g', {}, this.headG).innerHTML = headSVG();
    for (const k of ['shades', 'flower']) { this.parts[k] = el('g', {}, this.headG); this.parts[k].innerHTML = PARTS[k](); }
    this.face = el('g', {}, this.headG);
    this.cheeks = [-1, 1].map((s) => el('ellipse', { cx: s * G.cheek.x, cy: G.cheek.y, rx: G.cheek.rx, ry: G.cheek.ry, fill: p.cheek }, this.face));
    this.brows = [-1, 1].map(() => el('ellipse', { rx: G.brow.rx, ry: G.brow.ry, fill: HAIR }, this.face));
    this.eyeGs = [-1, 1].map(() => el('g', {}, this.face));
    this.irises = [];
    this.mouthG = el('g', { transform: `translate(0 ${G.mouthY})` }, this.face);
    this.sweat = el('path', { d: 'M0 -12 Q6 -2 0 2 Q-6 -2 0 -12Z', fill: '#8fd3ff', class: 'dk-l', opacity: 0 }, this.face);
    this.faceWear = el('g', {}, this.headG);
    this.headWear = el('g', {}, this.headG);
    this.armsFront = el('g', { class: 'dk-arms' }, front || this.root);
    // Sleeveless vest: bare arms and hands.
    const armCol = SKIN;
    this.arms = this.hands.map(() => ({
      out: el('path', { fill: 'none', stroke: INK, 'stroke-linecap': 'round' }, this.armsFront),
      inn: el('path', { fill: 'none', stroke: armCol, 'stroke-linecap': 'round' }, this.armsFront),
      hand: el('circle', { fill: armCol, stroke: INK }, this.armsFront),
      digit: el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'dk-digit' }, this.armsFront),
    }));
    const svg = this.layer.ownerSVGElement || this.layer;
    if (!document.getElementById('dk-style')) el('style', { id: 'dk-style' }, svg).textContent = STYLE;
    if (!document.getElementById('dk-rainbow')) {
      const defs = el('defs', {}, svg);
      defs.innerHTML = '<linearGradient id="dk-rainbow" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ff97bf"/><stop offset=".33" stop-color="#ffd452"/><stop offset=".66" stop-color="#5eddb8"/><stop offset="1" stop-color="#8fb4ff"/></linearGradient>';
    }
    this.eyes = null; this.mouth = null;
    this.setFace(this.baseEyes || 'open', this.baseMouth || 'smile', true);
    this.setCostume(this.costume || null);
  }

  // Unlockable look (id041, id044): recolour by rebuilding; costumes are layered.
  setPalette(name) {
    const pal = PALETTES[name] || PALETTES.pink;
    if (pal === this.pal) return;
    this.pal = pal;
    const vis = this.visible;
    this.root.remove(); this.armsFront.remove();
    this.build(this.front);
    this.visible = vis;
  }
  setCostume(id) {
    this.costume = id && COSTUMES[id] ? id : null;
    const c = this.costume ? COSTUMES[this.costume] : {};
    for (const [k, g] of Object.entries(this.parts)) g.style.display = (c.hide || []).includes(k) ? 'none' : '';
    this.headWear.innerHTML = hatSVG(c);
    this.faceWear.innerHTML = c.face || '';
    this.backG.innerHTML = c.back || '';
  }

  setFace(eyes, mouth, base = false) {
    if (eyes && eyes !== this.eyes) {
      this.eyes = eyes;
      this.eyeGs.forEach((g, i) => {
        const kind = eyes === 'wink' ? (i ? 'happy' : 'open') : eyes;
        // The right eye mirrors so pointed shapes face each other.
        g.innerHTML = `<g transform="scale(${i && kind === 'tight' ? -1 : 1} 1)">${EYE[kind](this.pal)}</g>${kind === 'open' ? LASH(i ? 1 : -1) : ''}`;
      });
      this.irises = this.eyeGs.map((g) => g.querySelector('.dk-iris'));
      const [lift, tilt] = BROW[eyes === 'wink' ? 'happy' : eyes] || [0, 0];
      this.browLift.target = lift; this.browTilt.target = tilt;
    }
    if (mouth && mouth !== this.mouth) { this.mouth = mouth; this.mouthG.innerHTML = MOUTH[mouth]; }
    if (base) { this.baseEyes = eyes || this.baseEyes; this.baseMouth = mouth || this.baseMouth; }
  }
  resetFace() { this.setFace(this.baseEyes, this.baseMouth); this.cheekPuff = 0; this.sweat.setAttribute('opacity', 0); }

  // Local (unit) coordinates -> screen.
  toScreen(lx, ly) {
    const S = this.S;
    const sy = this.sq.value * this.stretchY;
    const sx = this.stretchX / Math.sqrt(Math.max(0.2, this.sq.value));
    const pc = 60 * S;
    const px = lx * S * sx; const py = ly * S * sy + pc;
    const a = ((this.rot + this.lean.value) * Math.PI) / 180;
    const c = Math.cos(a); const s = Math.sin(a);
    return { x: this.x + px * c - py * s, y: this.y - this.lift + px * s + py * c - pc };
  }
  shoulder(side) { return this.toScreen(side * G.shoulder.x, G.shoulder.y); }
  // Raised hands go up past the ears, clear of the face.
  restHand(side, h) { return this.toScreen(side * (G.rest.x + h.raise * 34), G.rest.y - h.raise * 120); }
  get headCenter() { return this.toScreen(0, G.head.cy); }

  place(x, y) { this.x = x; this.y = y; this.home = { x, y }; this.ground = y; }

  update(dt, t, ctx = {}) {
    this.sq.step(dt); this.lean.step(dt); this.tilt.step(dt); this.earL.step(dt); this.earR.step(dt);
    this.browLift.step(dt); this.browTilt.step(dt);
    this.look.x = lerp(this.look.x, this.lookTarget.x, Math.min(1, dt * 10));
    this.look.y = lerp(this.look.y, this.lookTarget.y, Math.min(1, dt * 10));
    // blink
    if (t > this.blinkAt) { this.blinkK = 1; this.blinkAt = t + rand(1800, 4200); }
    this.blinkK = Math.max(0, this.blinkK - dt * 7);
    const blink = this.eyes === 'open' ? 1 - Math.sin(this.blinkK * Math.PI) * 0.92 : 1;

    const breath = Math.sin(t / 520 + this.id) * 0.018;
    const beat = ctx.beat || 0;
    const sy = (this.sq.value + breath + this.bob * beat * 0.06) * this.stretchY;
    const sx = this.stretchX / Math.sqrt(Math.max(0.2, this.sq.value + breath));
    const S = this.S;
    const pc = 60 * S;
    const shakeX = this.shake ? Math.sin(t / 22) * this.shake : 0;
    const bx = this.x + shakeX; const by = this.y - this.lift;
    const rot = this.rot + this.lean.value;
    this.root.setAttribute('opacity', this.opacity);
    // Arms live in a separate front layer, so hide them together with the body.
    this.root.style.display = this.visible ? '' : 'none';
    this.armsFront.style.display = this.visible ? '' : 'none';
    this.armsFront.setAttribute('opacity', this.opacity);
    this.bodyG.setAttribute('transform', `translate(${bx} ${by - pc}) rotate(${rot}) translate(0 ${pc}) scale(${S * sx} ${S * sy})`);
    const gy = this.ground ?? this.y;
    const hk = clamp(1 - (gy - by) / 400, 0.2, 1);
    this.shadow.setAttribute('transform', `translate(${bx} ${gy + 2}) scale(${S * hk * sx} ${S * hk})`);
    this.headG.setAttribute('transform', `rotate(${this.tilt.value} 0 ${G.neckY})`);
    this.earGs.forEach(({ g, s }) => {
      // Hair swings less than the ears did, so it never flips over the head.
      const a = 0.55 * (s < 0 ? -this.earL.value : this.earR.value);
      g.setAttribute('transform', `rotate(${a} ${s * G.ear.pivot} ${G.ear.cy})`);
    });
    const lx = this.look.x * 1.6; const ly = this.look.y * 1.4;
    this.eyeGs.forEach((g, i) => {
      const s = i ? 1 : -1;
      g.setAttribute('transform', `translate(${s * G.eye.x + lx} ${G.eye.y + ly}) scale(1 ${blink})`);
    });
    // Irises roll inside the white ring toward the look target.
    this.irises.forEach((ir) => { if (ir) ir.setAttribute('transform', `translate(${this.look.x * 2.2} ${this.look.y * 2})`); });
    this.brows.forEach((b, i) => {
      const s = i ? 1 : -1;
      b.setAttribute('transform', `translate(${s * G.brow.x + lx} ${G.brow.y + ly - this.browLift.value * 4}) rotate(${-s * this.browTilt.value})`);
    });
    this.mouthG.setAttribute('transform', `translate(${lx * 0.6} ${G.mouthY + ly * 0.5})`);
    this.cheeks.forEach((c, i) => {
      const k = 1 + this.cheekPuff * 0.7;
      c.setAttribute('rx', G.cheek.rx * k); c.setAttribute('ry', G.cheek.ry * k);
      c.setAttribute('cx', (i ? 1 : -1) * (G.cheek.x + this.cheekPuff * 3) + lx * 0.4);
    });
    this.feet.forEach((f, i) => {
      const s = i ? 1 : -1;
      const kick = this.lift > 4 ? Math.sin(t / 60 + i * 2) * 4 : 0;
      f.setAttribute('transform', `translate(0 ${kick}) rotate(${this.lift > 4 ? s * 14 : 0} ${s * G.footPivot.x} ${G.footPivot.y})`);
    });

    // arms
    const lpx = this.lw * S;
    this.hands.forEach((h, i) => {
      const sh = this.shoulder(h.side);
      if (h.mode === 'rest') {
        const r = this.restHand(h.side, h);
        const sway = Math.sin(t / 400 + i * 1.3) * 1.5 * S;
        h.x = r.x + sway; h.y = r.y;
      }
      const a = this.arms[i];
      const dx = h.x - sh.x; const dy = h.y - sh.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len; const ny = dx / len;
      const bend = h.mode === 'rest' ? 0 : h.side * Math.min(60, len * 0.22);
      // Resting arms hang down in a short curve, like the drawing.
      const droop = h.mode === 'rest' ? len * 0.35 : Math.min(40, len * 0.08);
      const c = { x: (sh.x + h.x) / 2 + nx * bend, y: (sh.y + h.y) / 2 + ny * bend + droop };
      const d = `M${sh.x} ${sh.y} Q${c.x} ${c.y} ${h.x} ${h.y}`;
      const w = Math.max(3, G.arm * S * Math.min(1, Math.sqrt(40 * S / len)));
      a.out.setAttribute('d', d); a.out.setAttribute('stroke-width', w + 2 * lpx);
      a.inn.setAttribute('d', d); a.inn.setAttribute('stroke-width', w);
      a.hand.setAttribute('cx', h.x); a.hand.setAttribute('cy', h.y);
      a.hand.setAttribute('r', G.hand * S); a.hand.setAttribute('stroke-width', lpx);
      if (h.carry != null) {
        a.digit.textContent = h.carry;
        a.digit.setAttribute('x', h.x); a.digit.setAttribute('y', h.y - 20 * S - 10);
        a.digit.setAttribute('font-size', Math.max(26, 40 * S));
        a.digit.style.display = '';
      } else a.digit.style.display = 'none';
    });
  }

  lookAt(pt) {
    if (!pt) { this.lookTarget = { x: 0, y: 0 }; return; }
    const hc = this.headCenter;
    const dx = pt.x - hc.x; const dy = pt.y - hc.y;
    const d = Math.hypot(dx, dy) || 1;
    this.lookTarget = { x: dx / d, y: dy / d };
  }

  // ---------------------------------------------------------------- hands
  freeHand(pt) {
    const h = this.hands.slice().sort((a, b) => (a.job ? 1 : 0) - (b.job ? 1 : 0) || Math.abs((pt.x - this.x) - a.side * 60) - Math.abs((pt.x - this.x) - b.side * 60))[0];
    return h;
  }

  // Grab a digit from a key and put it into a cell.
  async carry(from, to, digit, { E = 0, onGrab, onPlace } = {}) {
    const h = this.freeHand(from);
    if (h.job && h.cancel) h.cancel();
    const job = ++uid;
    let placed = false;
    const finish = () => { if (!placed) { placed = true; h.carry = null; onPlace && onPlace(); } };
    h.job = job; h.cancel = finish;
    const alive = () => h.job === job;
    h.mode = 'free';
    const s0 = { x: h.x, y: h.y };
    this.lookAt(from);
    this.lean.target = clamp((from.x - this.x) / 20, -12, 12);
    const reach = 80 + 40 * (1 - E);
    await tween(reach, (k) => { h.x = lerp(s0.x, from.x, k); h.y = lerp(s0.y, from.y, k); }, easeOutQuad);
    if (!alive()) return;
    h.carry = digit; onGrab && onGrab();
    this.lookAt(to);
    const c = { x: (from.x + to.x) / 2 + (this.x - (from.x + to.x) / 2) * 0.2, y: Math.min(from.y, to.y) - 60 - 40 * E };
    await tween(150 + 40 * (1 - E), (k) => { const q = quadPoint(from, c, to, k); if (alive()) { h.x = q.x; h.y = q.y; } }, easeInOutCubic);
    if (!alive()) return;
    finish();
    const r = this.restHand(h.side, h);
    const p0 = { x: h.x, y: h.y };
    await tween(150, (k) => { if (alive()) { const rr = this.restHand(h.side, h); h.x = lerp(p0.x, rr.x, k); h.y = lerp(p0.y, rr.y, k); } }, easeOutCubic);
    if (alive()) { h.mode = 'rest'; h.job = 0; h.cancel = null; this.lean.target = 0; }
    void r;
  }

  // Swipe a wrong digit away (Backspace).
  async swipe(pt) {
    const h = this.freeHand(pt);
    if (h.job && h.cancel) h.cancel();
    const job = ++uid; h.job = job; h.mode = 'free';
    const alive = () => h.job === job;
    const s0 = { x: h.x, y: h.y };
    await tween(90, (k) => { h.x = lerp(s0.x, pt.x - 30, k); h.y = lerp(s0.y, pt.y, k); });
    await tween(120, (k) => { if (alive()) { h.x = pt.x - 30 + 60 * k; h.y = pt.y - Math.sin(k * Math.PI) * 10; } });
    const p0 = { x: h.x, y: h.y };
    await tween(140, (k) => { if (alive()) { const r = this.restHand(h.side, h); h.x = lerp(p0.x, r.x, k); h.y = lerp(p0.y, r.y, k); } });
    if (alive()) { h.mode = 'rest'; h.job = 0; }
  }

  // ---------------------------------------------------------------- body actions
  begin() { this.token += 1; const tk = this.token; return () => tk === this.token; }

  async hop(height = 30, dur = 360, { spin = 0, flip = 0, to = null, audio } = {}) {
    const ok = this.begin();
    this.sq.value = 0.82; this.sq.velocity = 0;
    await wait(55);
    if (!ok()) return false;
    audio && audio.jump(height / 120);
    this.sq.value = 1.18;
    const x0 = this.x; const y0 = this.y; const tx = to ? to.x : x0; const ty = to ? to.y : y0;
    const r0 = this.rot;
    await tween(dur, (k) => {
      if (!ok()) return;
      this.x = lerp(x0, tx, k); this.y = lerp(y0, ty, k);
      this.lift = Math.sin(k * Math.PI) * height;
      this.rot = r0 + spin * easeInOutCubic(k) + flip * k;
    }, (k) => k);
    if (!ok()) return false;
    this.lift = 0; this.rot = 0;
    this.sq.value = 0.72; this.sq.velocity = 2;
    this.earL.kick(-420); this.earR.kick(-420);
    audio && audio.land();
    return true;
  }

  async clap(times = 3, audio) {
    const ok = this.begin();
    const tk = this.token;
    const hs = this.hands;
    hs.forEach((h) => { h.mode = 'free'; h.clapToken = tk; });
    try {
      for (let i = 0; i < times && ok(); i++) {
        const c = this.toScreen(0, -178);
        const o = [this.toScreen(-80, -164), this.toScreen(80, -164)];
        await tween(70, (k) => hs.forEach((h, j) => { if (ok() && !h.job) { h.x = lerp(o[j].x, c.x + (j ? 8 : -8), k); h.y = lerp(o[j].y, c.y, k); } }), easeInQuad);
        if (!ok()) return;
        audio && audio.clapHands();
        if (this.S < 1.5) this.sq.kick(-1.2);
        await tween(90, (k) => hs.forEach((h, j) => { if (ok() && !h.job) { h.x = lerp(c.x + (j ? 8 : -8), o[j].x, k); h.y = lerp(c.y, o[j].y, k); } }), easeOutQuad);
      }
    } finally {
      // Release the hands even when another action interrupted the clap;
      // otherwise they stay 'free' and the arms keep pointing at stale spots.
      // Hands claimed by a later clap or busy with a job are left alone.
      hs.forEach((h) => { if (h.clapToken === tk) { h.clapToken = 0; if (!h.job) h.mode = 'rest'; } });
    }
  }

  async celebrate(E, { big = false, audio, variant } = {}) {
    const moves = big
      ? ['backflip', 'spinjump', 'starjump', 'clapjump', 'twirl']
      : ['hop', 'hop', 'earflap', 'clapjump', 'twirl'];
    const move = variant || pick(moves.slice(0, Math.max(2, Math.ceil(moves.length * (0.35 + E)))));
    this.setFace(pick(['happy', 'happy', 'star', 'wink']), pick(['grin', 'big', 'cat']));
    this.earL.kick(600); this.earR.kick(600);
    const hMul = 0.6 + E * 1.6;
    if (move === 'hop') await this.hop(22 * hMul, 300, { audio });
    else if (move === 'earflap') { for (let i = 0; i < 3; i++) { this.earL.kick(900); this.earR.kick(-900); this.tilt.kick(i % 2 ? 200 : -200); await wait(110); } }
    else if (move === 'clapjump') { this.hands.forEach((h) => { h.raise = 1; }); this.hop(30 * hMul, 380, { audio }); await this.clap(2 + Math.round(E * 2), audio); this.hands.forEach((h) => { h.raise = 0; }); }
    else if (move === 'twirl') await this.hop(26 * hMul, 460, { spin: 360, audio });
    else if (move === 'backflip') await this.hop(70 * hMul, 620, { flip: -360, audio });
    else if (move === 'spinjump') await this.hop(60 * hMul, 560, { spin: 720, audio });
    else if (move === 'starjump') {
      this.hands.forEach((h) => { h.raise = 1; });
      this.stretchX = 1.2;
      await this.hop(50 * hMul, 520, { audio });
      this.stretchX = 1;
      this.hands.forEach((h) => { h.raise = 0; });
    }
    await wait(250);
    this.resetFace();
  }

  // Comic, non-punishing reactions to a wrong digit. Gentle ones are used
  // early; bigger slapstick unlocks as the show intensifies. The same
  // reaction is not repeated twice in a row.
  async hurt(E, from, { audio, variant } = {}) {
    const ok = this.begin();
    const pool = ['squash', 'boing', 'deflate', 'earspin'];
    if (E >= 0.3) pool.push('pancake', 'dizzy', 'flop', 'roll');
    if (E >= 0.6) pool.push('knockoff', 'headbutt');
    const choices = pool.filter((v) => v !== this.lastHurt);
    const move = variant || pick(choices);
    this.lastHurt = move;
    this.setFace(pick(['x', 'swirl']), pick(['wobble', 'o']));
    this.earL.kick(-1200); this.earR.kick(-1100);
    const dir = from && from.x > this.x ? -1 : 1;
    const x0 = this.x; const y0 = this.y;
    const restore = () => { this.stretchX = 1; this.stretchY = 1; this.rot = 0; this.lift = 0; this.shake = 0; };
    if (move === 'squash') {
      this.sq.value = 0.6; this.sq.velocity = 0;
      this.tilt.kick(dir * 500);
      await wait(420);
    } else if (move === 'boing') {
      // Springy accordion: squashes and bounces up and down.
      for (let i = 0; i < 3 && ok(); i++) {
        await tween(90, (k) => { if (ok()) this.stretchY = lerp(1, 0.55, k); }, easeOutQuad);
        audio && audio.jump(0.3 + i * 0.1);
        await tween(140, (k) => { if (ok()) { this.stretchY = lerp(0.55, 1.35 - i * 0.1, k); this.lift = Math.sin(k * Math.PI) * (30 - i * 8); } }, easeOutQuad);
      }
      this.lift = 0;
      await tween(160, (k) => { if (ok()) this.stretchY = lerp(1.15, 1, k); }, easeOutBack);
    } else if (move === 'deflate') {
      // Shrinks like a balloon losing air, then pops back.
      await tween(360, (k) => { if (ok()) { this.stretchX = lerp(1, 0.55, k); this.stretchY = lerp(1, 0.5, k); this.shake = 2 * (1 - k); } }, easeOutQuad);
      this.shake = 0;
      await wait(160);
      audio && audio.jump(0.8);
      await tween(280, (k) => { if (ok()) { this.stretchX = lerp(0.55, 1, k); this.stretchY = lerp(0.5, 1, k); } }, easeOutBack);
    } else if (move === 'earspin') {
      // Ears whirl like propellers and lift the body a little.
      for (let i = 0; i < 8 && ok(); i++) { this.earL.kick(1400); this.earR.kick(-1400); this.tilt.kick(i % 2 ? 260 : -260); this.lift = Math.sin((i / 8) * Math.PI) * 26; await wait(60); }
      this.lift = 0;
      this.sq.value = 0.75;
    } else if (move === 'pancake') {
      await tween(90, (k) => { if (ok()) { this.stretchY = lerp(1, 0.32, k); this.stretchX = lerp(1, 1.7, k); } });
      this.shake = 3;
      await wait(380);
      this.shake = 0;
      await tween(260, (k) => { if (ok()) { this.stretchY = lerp(0.32, 1, k); this.stretchX = lerp(1.7, 1, k); } }, easeOutBack);
    } else if (move === 'dizzy') {
      // Plops down, head wobbles in circles, then hops back up.
      this.setFace('swirl', 'wobble');
      await tween(140, (k) => { if (ok()) { this.stretchY = lerp(1, 0.7, k); this.stretchX = lerp(1, 1.18, k); } }, easeOutQuad);
      await tween(640, (k) => { if (ok()) { this.tilt.target = Math.sin(k * Math.PI * 4) * 14; this.lean.target = Math.cos(k * Math.PI * 4) * 6; } });
      this.tilt.target = 0; this.lean.target = 0;
      await tween(200, (k) => { if (ok()) { this.stretchY = lerp(0.7, 1, k); this.stretchX = lerp(1.18, 1, k); } }, easeOutBack);
    } else if (move === 'flop') {
      // Falls over backwards, legs kick in the air, springs upright.
      await tween(180, (k) => { if (ok()) { this.rot = dir * -90 * k; this.lift = Math.sin(k * Math.PI) * 18; } }, easeOutQuad);
      audio && audio.land();
      await tween(420, (k) => { if (ok()) this.rot = dir * (-90 + Math.sin(k * Math.PI * 5) * 6); });
      audio && audio.jump(0.6);
      await tween(240, (k) => { if (ok()) { this.rot = dir * -90 * (1 - k); this.lift = Math.sin(k * Math.PI) * 30; } }, easeOutBack);
    } else if (move === 'roll') {
      // Rolls away like a ball and rolls back.
      await tween(360, (k) => { if (ok()) { this.x = x0 + dir * 90 * k; this.rot = dir * 360 * k; this.stretchY = 0.85; } }, easeOutQuad);
      await tween(360, (k) => { if (ok()) { this.x = x0 + dir * 90 * (1 - k); this.rot = dir * 360 * (1 - k); } }, easeInOutCubic);
      this.x = x0;
    } else if (move === 'headbutt') {
      // Bops the wrong digit away with the head.
      await tween(110, (k) => { if (ok()) { this.lean.target = -dir * 18 * k; this.lift = k * 20; } });
      audio && audio.jump(1);
      this.sq.value = 1.25;
      await tween(180, (k) => { if (ok()) { this.lean.target = -dir * 18 * (1 - k); this.lift = 20 + Math.sin(k * Math.PI) * 40; } }, easeOutQuad);
      await tween(160, (k) => { if (ok()) this.lift = 20 * (1 - k); }, easeInQuad);
      this.lean.target = 0;
      this.sq.value = 0.7;
      audio && audio.land();
    } else {
      // Knocked off-stage, spins, and bounces back.
      audio && audio.jump(1.5);
      await tween(420, (k) => { if (ok()) { this.x = x0 + dir * 170 * k; this.lift = Math.sin(k * Math.PI) * 140; this.rot = dir * 540 * k; } }, (k) => k);
      this.rot = 0;
      await tween(360, (k) => { if (ok()) { this.x = lerp(x0 + dir * 170, x0, k); this.lift = Math.sin(k * Math.PI) * 60; } }, easeOutQuad);
      this.x = x0; this.y = y0;
      this.sq.value = 0.55;
      audio && audio.land();
    }
    restore();
    if (!ok()) return;
    // Shake it off.
    this.setFace('closed', 'flat');
    for (let i = 0; i < 4; i++) { this.tilt.kick(i % 2 ? 700 : -700); this.earL.kick(500); this.earR.kick(-500); await wait(70); }
    this.resetFace();
    this.setFace('open', 'smile');
  }

  // Point at a place on screen with one stretched arm (hint gesture).
  async point(pt, hold = 900, { staticPose = false } = {}) {
    const h = this.freeHand(pt);
    if (h.job && h.cancel) h.cancel();
    const job = ++uid; h.job = job; h.mode = 'free';
    const alive = () => h.job === job;
    this.lookAt(pt);
    this.setFace('open', 'o');
    const s0 = { x: h.x, y: h.y };
    const target = { x: lerp(this.x, pt.x, 0.82), y: lerp(this.y - 60 * this.S, pt.y, 0.82) };
    if (staticPose) {
      h.x = target.x; h.y = target.y;
      this.look = { ...this.lookTarget };
      return;
    }
    await tween(220, (k) => { if (alive()) { h.x = lerp(s0.x, target.x, k); h.y = lerp(s0.y, target.y, k); } }, easeOutBack);
    for (let i = 0; i < 3 && alive(); i++) {
      await tween(hold / 6, (k) => { if (alive()) { h.x = target.x + Math.sin(k * Math.PI) * 8; } });
      await tween(hold / 6, () => {});
    }
    const p0 = { x: h.x, y: h.y };
    await tween(200, (k) => { if (alive()) { const r = this.restHand(h.side, h); h.x = lerp(p0.x, r.x, k); h.y = lerp(p0.y, r.y, k); } });
    if (alive()) { h.mode = 'rest'; h.job = 0; this.resetFace(); }
  }

  async reachPose(on) {
    if (on) {
      this.begin();
      this.setFace('wide', 'puff');
      this.cheekPuff = 1;
      this.sweat.setAttribute('opacity', 1);
      this.sweat.setAttribute('transform', 'translate(46 -130)');
      this.shake = 1.4;
      this.hands.forEach((h) => { h.raise = 0.55; });
    } else {
      this.shake = 0;
      this.cheekPuff = 0;
      this.sweat.setAttribute('opacity', 0);
      this.hands.forEach((h) => { h.raise = 0; });
      this.resetFace();
    }
  }

  async leapTo(pt, height = 80, { audio, spin = 0 } = {}) {
    const landed = await this.hop(height, 480, { to: pt, audio, spin });
    if (landed) this.ground = pt.y;
    return landed;
  }

  destroy() { this.root.remove(); this.armsFront.remove(); }
}

// Standalone sprite image of the hero for canvas particles (cheering pose).
export function dopakichiSprite(palette = 'pink', size = 128) {
  const p = PALETTES[palette] || PALETTES.pink;
  const tip = (s) => ({ x: s * 70, y: -150 });
  const arm = (s) => `M${s * G.shoulder.x} ${G.shoulder.y} Q${s * 64} ${G.shoulder.y - 20} ${tip(s).x} ${tip(s).y}`;
  const svg = `<svg xmlns="${NS}" viewBox="-110 -186 220 192" width="${size}" height="${size * 192 / 220}">
  <style>svg{--dkw:3.4}${STYLE}</style>
  ${footSVG(p, -1)}${footSVG(p, 1)}${bodySVG(p)}${lockSVG(-1)}${lockSVG(1)}${faceSVG(p, 'happy', 'grin', [])}
  ${[-1, 1].map((s) => `<path d="${arm(s)}" fill="none" stroke="${INK}" stroke-width="${G.arm + 6.8}" stroke-linecap="round"/><path d="${arm(s)}" fill="none" stroke="${SKIN}" stroke-width="${G.arm}" stroke-linecap="round"/><circle class="dk-l" cx="${tip(s).x}" cy="${tip(s).y}" r="${G.hand}" fill="${SKIN}"/>`).join('')}
  </svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return img;
}

// Head with hair, accessories and a fixed expression, as static markup.
function faceSVG(p, eyes, mouth, hide) {
  const { eye, cheek, brow } = G;
  return `${hide.includes('bun') ? '' : bunSVG()}${headSVG()}${['shades', 'flower'].filter((k) => !hide.includes(k)).map((k) => PARTS[k]()).join('')}
  ${[-1, 1].map((s) => `<ellipse cx="${s * cheek.x}" cy="${cheek.y}" rx="${cheek.rx}" ry="${cheek.ry}" fill="${p.cheek}"/><ellipse cx="${s * brow.x}" cy="${brow.y - (eyes === 'happy' ? 4 : 0)}" rx="${brow.rx}" ry="${brow.ry}" fill="${HAIR}"/><g transform="translate(${s * eye.x} ${eye.y})">${EYE[eyes](p)}${eyes === 'open' ? LASH(s) : ''}</g>`).join('')}
  <g transform="translate(0 ${G.mouthY})">${MOUTH[mouth]}</g>`;
}

// Static SVG markup of the hero with a colour and costume (collection thumbnails).
export function dopakichiSVG(palette = 'pink', costume = null) {
  const p = PALETTES[palette] || PALETTES.pink;
  const c = (costume && COSTUMES[costume]) || {};
  const rb = p.body.startsWith('url(') ? '<defs><linearGradient id="dk-rainbow" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ff97bf"/><stop offset=".33" stop-color="#ffd452"/><stop offset=".66" stop-color="#5eddb8"/><stop offset="1" stop-color="#8fb4ff"/></linearGradient></defs>' : '';
  return `<svg xmlns="${NS}" viewBox="-112 -250 224 258" aria-hidden="true">${rb}<style>svg{--dkw:3.4}${STYLE}</style>
  ${c.back || ''}${footSVG(p, -1)}${footSVG(p, 1)}${bodySVG(p)}${lockSVG(-1)}${lockSVG(1)}${faceSVG(p, 'open', 'smile', c.hide || [])}
  ${[-1, 1].map((s) => `<circle class="dk-l" cx="${s * G.rest.x}" cy="${G.rest.y}" r="${G.hand}" fill="${SKIN}"/>`).join('')}
  ${c.face || ''}${hatSVG(c)}</svg>`;
}

export function startActors(list, getCtx) {
  return onFrame((dt, t) => { const ctx = getCtx(); for (const a of list) a.update(dt, t, ctx); });
}
