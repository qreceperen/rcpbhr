// 🎨 THE PUZZLE PICTURES
// Each picture is drawn with code on an 800 × 600 canvas.
// Want a new picture? Copy one, change the name, and draw something new!

// Draws an emoji at (x, y) with the given size
function emoji(ctx, char, x, y, size) {
  ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, x, y);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function cloud(ctx, x, y) {
  circle(ctx, x, y, 40, "white");
  circle(ctx, x + 45, y - 15, 50, "white");
  circle(ctx, x + 95, y, 40, "white");
}

const PICTURES = [
  {
    name: "Farm",
    draw(ctx) {
      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, 380);
      sky.addColorStop(0, "#7ec8ff");
      sky.addColorStop(1, "#d6f0ff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 800, 600);
      circle(ctx, 690, 100, 65, "#ffd60a");          // sun
      cloud(ctx, 90, 90);
      cloud(ctx, 380, 70);
      // grass
      ctx.fillStyle = "#6fcf4a";
      ctx.fillRect(0, 360, 800, 240);
      // barn
      ctx.fillStyle = "#d62828";
      ctx.fillRect(110, 220, 220, 190);
      ctx.fillStyle = "#8b1e1e";
      ctx.beginPath();
      ctx.moveTo(90, 225); ctx.lineTo(220, 130); ctx.lineTo(350, 225);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.fillRect(185, 300, 70, 110);
      // animals
      emoji(ctx, "🌳", 620, 290, 170);
      emoji(ctx, "🐄", 470, 450, 130);
      emoji(ctx, "🐷", 680, 500, 100);
      emoji(ctx, "🐔", 130, 500, 90);
      emoji(ctx, "🌻", 300, 520, 80);
    },
  },
  {
    name: "Ocean",
    draw(ctx) {
      const sea = ctx.createLinearGradient(0, 0, 0, 600);
      sea.addColorStop(0, "#48cae4");
      sea.addColorStop(1, "#023e8a");
      ctx.fillStyle = sea;
      ctx.fillRect(0, 0, 800, 600);
      // sand
      ctx.fillStyle = "#f4d58d";
      ctx.beginPath();
      ctx.ellipse(400, 640, 520, 140, 0, 0, Math.PI * 2);
      ctx.fill();
      // bubbles
      [[90, 120], [120, 60], [560, 160], [600, 100], [300, 50]].forEach(([x, y]) =>
        circle(ctx, x, y, 14, "rgba(255,255,255,0.6)"));
      emoji(ctx, "🐳", 560, 260, 200);
      emoji(ctx, "🐠", 170, 230, 110);
      emoji(ctx, "🐙", 220, 450, 120);
      emoji(ctx, "🐢", 430, 420, 100);
      emoji(ctx, "🦀", 640, 530, 80);
      emoji(ctx, "🪸", 80, 530, 90);
    },
  },
  {
    name: "Space",
    draw(ctx) {
      ctx.fillStyle = "#14102b";
      ctx.fillRect(0, 0, 800, 600);
      // little stars (always the same places)
      for (let i = 0; i < 80; i++) {
        circle(ctx, (i * 137) % 800, (i * 89) % 600, (i % 3) + 1, "white");
      }
      circle(ctx, 140, 470, 110, "#9d4edd");          // purple planet
      circle(ctx, 110, 440, 25, "#c77dff");
      emoji(ctx, "🚀", 420, 300, 180);
      emoji(ctx, "🪐", 660, 140, 150);
      emoji(ctx, "🌙", 130, 110, 110);
      emoji(ctx, "👽", 650, 470, 110);
      emoji(ctx, "⭐", 330, 520, 70);
    },
  },
  {
    name: "Rainbow Garden",
    draw(ctx) {
      ctx.fillStyle = "#e0f7ff";
      ctx.fillRect(0, 0, 800, 600);
      // rainbow
      const colors = ["#ff3b3b", "#ff9f1c", "#ffd60a", "#38b000", "#3a86ff", "#8338ec"];
      colors.forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 34;
        ctx.beginPath();
        ctx.arc(400, 470, 330 - i * 34, Math.PI, 0);
        ctx.stroke();
      });
      cloud(ctx, 20, 440);
      cloud(ctx, 660, 440);
      // grass
      ctx.fillStyle = "#80ed99";
      ctx.fillRect(0, 470, 800, 130);
      emoji(ctx, "🌷", 100, 540, 80);
      emoji(ctx, "🌼", 260, 545, 70);
      emoji(ctx, "🌸", 540, 545, 70);
      emoji(ctx, "🌷", 700, 540, 80);
      emoji(ctx, "🦋", 400, 330, 110);
      emoji(ctx, "🐝", 620, 250, 70);
    },
  },
];
