// Skill tree for grades 1-6 (calculation only). See docs/curriculum.md.
// Each skill: id, name (shown on screen), grade, lane (tree column),
// req (all must be mastered to unlock), gen (generator + params, problems.js).

export const LANES = ['加减', '乘除', '小数分数', '其他'];

// Mastery / unlock rule (provisional): 5 first-try clears in the last 6 attempts.
export const MASTERY = { window: 6, need: 5 };

export const SKILLS = [
  // Grades follow the 北京版 textbooks revised for the 2022 课标 (2024秋 onward).
  // 四下 / 五下 / 六下 have no revised edition yet; skills placed there follow
  // the current edition and are marked "推定".
  // ---------------------------------------------------------------- grade 1 (一上 / 一下)
  { id: 'g1-compose10', name: '10的分与合', grade: 1, lane: 0, req: [], gen: ['compose', { total: 10 }] },
  { id: 'g1-add-nc', name: '10以内的加法', grade: 1, lane: 0, req: [], gen: ['hadd', { a: [1, 9], b: [1, 9], carry: 'none' }] },
  { id: 'g1-sub-nb', name: '10以内的减法', grade: 1, lane: 0, req: ['g1-add-nc'], gen: ['hsub', { a: [2, 10], b: [1, 9], borrow: 'none' }] },
  { id: 'g1-add3', name: '连加连减', grade: 1, lane: 0, req: ['g1-sub-nb'], gen: ['add3', {}] },
  { id: 'g1-add-c', name: '20以内的进位加法', grade: 1, lane: 0, req: ['g1-compose10', 'g1-add-nc'], gen: ['hadd', { a: [2, 9], b: [2, 9], carry: 'yes' }] },
  { id: 'g1-sub-b', name: '20以内的退位减法', grade: 1, lane: 0, req: ['g1-add-c', 'g1-sub-nb'], gen: ['hsub', { a: [11, 18], b: [2, 9], borrow: 'yes' }] },
  { id: 'g1-tens', name: '整十数加减', grade: 1, lane: 0, req: ['g1-add-nc', 'g1-sub-nb'], gen: ['tens', {}] },
  { id: 'g1-add-2d1', name: '两位数加一位数、整十数', grade: 1, lane: 0, req: ['g1-add-c', 'g1-tens'], gen: ['hadd', { a: [11, 89], b: [1, 9], carry: 'none', tensToo: true }] },
  { id: 'g1-sub-2d1', name: '两位数减一位数、整十数', grade: 1, lane: 0, req: ['g1-sub-b', 'g1-add-2d1'], gen: ['hsub', { a: [11, 99], b: [1, 9], borrow: 'none', tensToo: true }] },
  { id: 'g1-add-2d1c', name: '两位数加一位数（进位）', grade: 1, lane: 0, req: ['g1-add-2d1'], gen: ['hadd', { a: [11, 89], b: [2, 9], carry: 'yes' }] },
  { id: 'g1-sub-2d1b', name: '两位数减一位数（退位）', grade: 1, lane: 0, req: ['g1-sub-2d1', 'g1-add-2d1c'], gen: ['hsub', { a: [20, 99], b: [2, 9], borrow: 'yes' }] },
  { id: 'g2-vadd2-nc', name: '两位数加两位数 竖式', grade: 1, lane: 0, req: ['g1-add-2d1'], gen: ['vadd', { da: 2, db: 2, carry: 'none', maxDigits: 2 }] },
  { id: 'g2-vadd2-c', name: '进位加法 竖式', grade: 1, lane: 0, req: ['g2-vadd2-nc', 'g1-add-2d1c'], gen: ['vadd', { da: 2, db: [1, 2], carry: 'some', maxDigits: 2 }] },
  { id: 'g2-vsub2-nb', name: '两位数减两位数 竖式', grade: 1, lane: 0, req: ['g1-sub-2d1'], gen: ['vsub', { da: 2, db: 2, borrow: 'none' }] },
  { id: 'g2-vsub2-b', name: '退位减法 竖式', grade: 1, lane: 0, req: ['g2-vsub2-nb', 'g1-sub-2d1b'], gen: ['vsub', { da: 2, db: [1, 2], borrow: 'some' }] },

  // ---------------------------------------------------------------- grade 2 (二上 / 二下)
  { id: 'g2-kuku25', name: '1~3的乘法口诀', grade: 2, lane: 1, req: ['g1-add-c'], gen: ['kuku', { dans: [1, 2, 3] }] },
  { id: 'g2-kuku34', name: '4和5的乘法口诀', grade: 2, lane: 1, req: ['g2-kuku25'], gen: ['kuku', { dans: [4, 5] }] },
  { id: 'g2-kuku67', name: '6和7的乘法口诀', grade: 2, lane: 1, req: ['g2-kuku34'], gen: ['kuku', { dans: [6, 7] }] },
  { id: 'g2-kuku891', name: '8和9的乘法口诀', grade: 2, lane: 1, req: ['g2-kuku67'], gen: ['kuku', { dans: [8, 9] }] },
  { id: 'g2-kuku-mix', name: '乘法口诀 混合', grade: 2, lane: 1, req: ['g2-kuku891'], gen: ['kuku', { dans: [1, 2, 3, 4, 5, 6, 7, 8, 9] }] },
  { id: 'g3-div-basic', name: '表内除法', grade: 2, lane: 1, req: ['g2-kuku-mix'], gen: ['div', { exact: true }] },
  { id: 'g3-div-rem', name: '有余数的除法', grade: 2, lane: 1, req: ['g3-div-basic'], gen: ['divRem', {}] },
  { id: 'g4-order', name: '混合运算', grade: 2, lane: 3, req: ['g3-div-basic', 'g2-vsub2-b'], gen: ['order', {}] },
  { id: 'g2-hundreds', name: '整百、整千数加减', grade: 2, lane: 0, req: ['g1-tens', 'g2-vadd2-c'], gen: ['hundreds', {}] },
  { id: 'g2-vadd3s', name: '得数过百的加法', grade: 2, lane: 0, req: ['g2-vadd2-c'], gen: ['vadd', { da: 2, db: 2, carry: 'many', maxDigits: 3 }] },
  { id: 'g2-vsub3s', name: '被减数过百的减法', grade: 2, lane: 0, req: ['g2-vsub2-b', 'g2-vadd3s'], gen: ['vsub', { da: 3, db: 2, borrow: 'some', aMax: 199 }] },
  { id: 'g3-vadd3', name: '三位数加法', grade: 2, lane: 0, req: ['g2-vadd3s'], gen: ['vadd', { da: 3, db: 3, carry: 'some', maxDigits: 3 }] },
  { id: 'g3-vsub3', name: '三位数减法', grade: 2, lane: 0, req: ['g2-vsub3s'], gen: ['vsub', { da: 3, db: [2, 3], borrow: 'some' }] },
  { id: 'g3-vadd4', name: '万以内的加法', grade: 2, lane: 0, req: ['g3-vadd3'], gen: ['vadd', { da: 4, db: [3, 4], carry: 'many', maxDigits: 4 }] },
  { id: 'g3-vsub4', name: '万以内的减法', grade: 2, lane: 0, req: ['g3-vsub3'], gen: ['vsub', { da: 4, db: [3, 4], borrow: 'zero' }] },

  // ---------------------------------------------------------------- grade 3 (三上 / 三下)
  { id: 'g2-mul-tens', name: '整十数乘一位数', grade: 3, lane: 1, req: ['g2-kuku-mix'], gen: ['mulTens', {}] },
  { id: 'g3-div-tens', name: '整十数除以一位数', grade: 3, lane: 1, req: ['g3-div-basic'], gen: ['divTens', {}] },
  { id: 'g3-vmul-2x1', name: '两位数乘一位数 竖式', grade: 3, lane: 1, req: ['g2-mul-tens'], gen: ['vmul', { da: 2, db: 1 }] },
  { id: 'g3-vmul-3x1', name: '三位数乘一位数', grade: 3, lane: 1, req: ['g3-vmul-2x1'], gen: ['vmul', { da: 3, db: 1 }] },
  { id: 'g4-vdiv-2d1', name: '两位数除以一位数 竖式', grade: 3, lane: 1, req: ['g3-div-rem', 'g3-div-tens'], gen: ['vdiv', { dd: 2, ds: 1 }] },
  { id: 'g4-vdiv-3d1', name: '三位数除以一位数', grade: 3, lane: 1, req: ['g4-vdiv-2d1'], gen: ['vdiv', { dd: 3, ds: 1 }] },
  { id: 'g3-mul-tt', name: '整十数乘整十数', grade: 3, lane: 1, req: ['g2-mul-tens'], gen: ['mulTT', {}] },
  { id: 'g3-vmul-2x2', name: '两位数乘两位数', grade: 3, lane: 1, req: ['g3-vmul-2x1', 'g3-mul-tt'], gen: ['vmul', { da: 2, db: 2 }] },
  { id: 'g3-vmul-3x2', name: '三位数乘两位数', grade: 3, lane: 1, req: ['g3-vmul-2x2', 'g3-vmul-3x1'], gen: ['vmul', { da: 3, db: 2 }] },
  { id: 'g2-frac-of', name: '求一个数的几分之一', grade: 3, lane: 2, req: ['g2-kuku25'], gen: ['fracOf', { dens: [2, 3, 4, 5] }] },
  { id: 'g3-frac-same', name: '简单的分数加减', grade: 3, lane: 2, req: ['g2-frac-of'], gen: ['frac', { op: 'addsub', same: true, maxOne: true }] },

  // ---------------------------------------------------------------- grade 4 (四上 / 四下 推定)
  { id: 'g4-vdiv-2d2', name: '两位数除以两位数', grade: 4, lane: 1, req: ['g4-vdiv-2d1', 'g3-vmul-2x1'], gen: ['vdiv', { dd: 2, ds: 2 }] },
  { id: 'g4-vdiv-3d2', name: '三位数除以两位数', grade: 4, lane: 1, req: ['g4-vdiv-2d2', 'g4-vdiv-3d1'], gen: ['vdiv', { dd: 3, ds: 2 }] },
  { id: 'g4-laws', name: '运算定律 简便计算', grade: 4, lane: 3, req: ['g4-order', 'g3-vmul-2x1'], gen: ['laws', {}] },
  { id: 'g4-round', name: '近似数（四舍五入）', grade: 4, lane: 3, req: ['g3-vadd4'], gen: ['round', {}] },
  { id: 'g3-dec-add1', name: '一位小数加法', grade: 4, lane: 2, req: ['g2-vadd2-c'], gen: ['vdec', { op: 'add', places: 1 }] },
  { id: 'g3-dec-sub1', name: '一位小数减法', grade: 4, lane: 2, req: ['g3-dec-add1', 'g2-vsub2-b'], gen: ['vdec', { op: 'sub', places: 1 }] },
  { id: 'g4-dec-add2', name: '两位小数加减', grade: 4, lane: 2, req: ['g3-dec-sub1'], gen: ['vdec', { op: 'addsub', places: 2 }] },
  { id: 'g4-decshift', name: '小数点移动', grade: 4, lane: 2, req: ['g4-dec-add2'], gen: ['decShift', {}] },

  // ---------------------------------------------------------------- grade 5 (五上 / 五下 推定)
  { id: 'g4-dec-mul', name: '小数乘整数', grade: 5, lane: 2, req: ['g4-decshift', 'g3-vmul-2x1'], gen: ['vmul', { da: 2, db: 1, pa: 1 }] },
  { id: 'g5-dec-mul', name: '小数乘小数', grade: 5, lane: 2, req: ['g4-dec-mul'], gen: ['vmul', { da: 2, db: 2, pa: 1, pb: 1 }] },
  { id: 'g4-dec-div', name: '小数除以整数', grade: 5, lane: 2, req: ['g4-dec-mul', 'g4-vdiv-2d1'], gen: ['decDivInt', {}] },
  { id: 'g5-dec-div', name: '小数除以小数', grade: 5, lane: 2, req: ['g4-dec-div', 'g5-dec-mul'], gen: ['decDivDec', {}] },
  { id: 'g5-gcd', name: '最大公因数', grade: 5, lane: 3, req: ['g3-div-basic'], gen: ['gcdlcm', { kind: 'gcd' }] },
  { id: 'g5-lcm', name: '最小公倍数', grade: 5, lane: 3, req: ['g5-gcd'], gen: ['gcdlcm', { kind: 'lcm' }] },
  { id: 'g5-frac-reduce', name: '约分', grade: 5, lane: 2, req: ['g5-gcd', 'g3-frac-same'], gen: ['frac', { op: 'reduce' }] },
  { id: 'g5-fracdec', name: '分数与小数互化', grade: 5, lane: 2, req: ['g5-frac-reduce', 'g4-dec-add2'], gen: ['fracDec', {}] },
  { id: 'g5-frac-diff', name: '异分母分数加减', grade: 5, lane: 2, req: ['g5-frac-reduce', 'g5-lcm'], gen: ['frac', { op: 'addsub', same: false }] },
  { id: 'g4-frac-mixed', name: '带分数加减', grade: 5, lane: 2, req: ['g5-frac-reduce'], gen: ['frac', { op: 'addsub', same: true, mixed: true }] },

  // ---------------------------------------------------------------- grade 6 (六上 / 六下 推定)
  { id: 'g5-frac-int', name: '分数乘除整数', grade: 6, lane: 2, req: ['g5-frac-reduce'], gen: ['frac', { op: 'muldivInt' }] },
  { id: 'g6-frac-mul', name: '分数乘分数', grade: 6, lane: 2, req: ['g5-frac-int'], gen: ['frac', { op: 'mul' }] },
  { id: 'g6-frac-div', name: '分数除以分数', grade: 6, lane: 2, req: ['g6-frac-mul'], gen: ['frac', { op: 'div' }] },
  { id: 'g6-frac-dec', name: '小数与分数混合计算', grade: 6, lane: 2, req: ['g6-frac-div', 'g5-dec-div'], gen: ['frac', { op: 'decimal' }] },
  { id: 'g6-pct', name: '百分数与小数、分数互化', grade: 6, lane: 3, req: ['g5-fracdec'], gen: ['pct', {}] },
  { id: 'g5-percent', name: '求一个数的百分之几', grade: 6, lane: 3, req: ['g6-pct', 'g4-dec-mul'], gen: ['percent', {}] },
  { id: 'g6-ratio', name: '相等的比', grade: 6, lane: 3, req: ['g5-lcm'], gen: ['ratio', {}] },
];

export const SKILL = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

// Depth in the tree = longest prerequisite chain (roots are 0).
export const DEPTH = (() => {
  const memo = {};
  const d = (id) => memo[id] ?? (memo[id] = SKILL[id].req.length ? 1 + Math.max(...SKILL[id].req.map(d)) : 0);
  for (const s of SKILLS) d(s.id);
  return memo;
})();

export const skillsOfGrade = (g) => SKILLS.filter((s) => s.grade === g);
