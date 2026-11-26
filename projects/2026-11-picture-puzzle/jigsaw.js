// 🧩 JIGSAW SHAPES
// Every edge between two pieces gets a "tab" (bump) on one side and a
// matching "blank" (dent) on the other, so only the right pieces fit together.

// Decide which way every inside edge bumps: +1 or -1.
//   across[r][c] = edge under piece (r, c):         +1 bumps down,  -1 bumps up
//   down[r][c]   = edge to the right of piece (r, c): +1 bumps right, -1 bumps left
function makeEdges(rows, cols) {
  const flip = () => (Math.random() < 0.5 ? 1 : -1);
  const across = [];
  const down = [];
  for (let r = 0; r < rows; r++) {
    across.push([]);
    down.push([]);
    for (let c = 0; c < cols; c++) {
      across[r].push(r < rows - 1 ? flip() : 0);   // bottom row: flat
      down[r].push(c < cols - 1 ? flip() : 0);     // right column: flat
    }
  }
  return { across, down };
}

// How each side of piece (r, c) looks: 0 = flat, 1 = bump out, -1 = dent in
function pieceSides(edges, r, c) {
  return {
    top: r === 0 ? 0 : -edges.across[r - 1][c],
    right: edges.down[r][c],
    bottom: edges.across[r][c],
    left: c === 0 ? 0 : -edges.down[r][c - 1],
  };
}

// The shape of one bump, going along an edge from 0 to 1.
// "out" is how far it sticks out (1 = the full tab height).
const TAB_CURVES = [
  // [control 1], [control 2], [end point]   as [along, out]
  [[0.42, 0.00], [0.45, 0.15], [0.40, 0.35]],   // into the neck
  [[0.32, 0.65], [0.36, 1.00], [0.50, 1.00]],   // round the left of the head
  [[0.64, 1.00], [0.68, 0.65], [0.60, 0.35]],   // round the right of the head
  [[0.55, 0.15], [0.58, 0.00], [0.65, 0.00]],   // back out of the neck
];

// Draw one edge from (x1, y1) to (x2, y2) onto a Path2D.
// bump: 0 = straight, 1 = bump out, -1 = dent in. tab = how tall a bump is.
function addEdge(path, x1, y1, x2, y2, bump, tab) {
  if (bump === 0) {
    path.lineTo(x2, y2);
    return;
  }
  const length = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / length;   // direction along the edge
  const uy = (y2 - y1) / length;
  const nx = uy;                   // direction pointing "out" of the piece
  const ny = -ux;

  const point = ([along, out]) => [
    x1 + ux * along * length + nx * out * tab * bump,
    y1 + uy * along * length + ny * out * tab * bump,
  ];

  path.lineTo(...point([0.35, 0]));
  TAB_CURVES.forEach(([c1, c2, end]) => path.bezierCurveTo(...point(c1), ...point(c2), ...point(end)));
  path.lineTo(x2, y2);
}

// The full outline of a piece whose top-left corner is at (x, y)
function piecePath(sides, x, y, w, h, tab) {
  const path = new Path2D();
  path.moveTo(x, y);
  addEdge(path, x, y, x + w, y, sides.top, tab);              // top: left → right
  addEdge(path, x + w, y, x + w, y + h, sides.right, tab);    // right: top → bottom
  addEdge(path, x + w, y + h, x, y + h, sides.bottom, tab);   // bottom: right → left
  addEdge(path, x, y + h, x, y, sides.left, tab);             // left: bottom → top
  path.closePath();
  return path;
}
