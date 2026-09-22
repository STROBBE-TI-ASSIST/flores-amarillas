const canvas = document.getElementById("flowerCanvas");
const ctx = canvas.getContext("2d");

let width;
let height;
let dpr = window.devicePixelRatio || 1;

let animationStarted = false;
let animationTime = 0;
let lastTimestamp = 0;

/* =========================================================
   COLORES
========================================================= */

const COLORS = {
    yellow: "#FFD21F",
    yellowSoft: "#F2C230",
    yellowBright: "#FFE56B",

    centerDark: "#2B130B",
    centerBrown: "#4A1F12",
    centerAccent: "#7A2418",

    green: "#4FA35E",
    greenDark: "#2F7142",
    greenSoft: "#7AAE74",

    whitePetal: "rgba(255,255,255,0.95)",
    daisyCenter: "#F2C230",

    wrapperStroke: "rgba(255,255,255,0.72)",
    wrapperStrokeSoft: "rgba(255,255,255,0.40)",
    wrapperFill1: "rgba(255,248,240,0.09)",
    wrapperFill2: "rgba(255,245,235,0.12)",
    wrapperFill3: "rgba(255,252,248,0.08)",

    ribbon: "rgba(235,220,170,0.95)"
};

/* =========================================================
   CANVAS RESPONSIVE
========================================================= */

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* =========================================================
   UTILIDADES
========================================================= */

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/* =========================================================
   PARTÍCULAS
========================================================= */

function drawParticles(elapsed) {
    const particles = 18;

    for (let i = 0; i < particles; i++) {
        const t = (elapsed * 0.08 + i / particles) % 1;

        const x = width * (0.16 + (i * 0.157) % 0.68);
        const y = height * (1 - t);

        const alpha = Math.sin(t * Math.PI) * 0.35;

        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,70,${alpha})`;
        ctx.fill();
    }
}

/* =========================================================
   TALLO CURVO
========================================================= */

function drawStem(
    startX,
    startY,
    endX,
    endY,
    bend,
    progress,
    color = COLORS.green
) {
    const p = clamp(progress, 0, 1);

    if (p <= 0) return;

    const cx = lerp(startX, endX, 0.45) + bend;
    const cy = lerp(startY, endY, 0.48) - 35;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const steps = 60;

    for (let i = 1; i <= steps; i++) {
        const t = (i / steps) * p;

        const x =
            (1 - t) * (1 - t) * startX +
            2 * (1 - t) * t * cx +
            t * t * endX;

        const y =
            (1 - t) * (1 - t) * startY +
            2 * (1 - t) * t * cy +
            t * t * endY;

        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.stroke();
}

/* =========================================================
   HOJA CURVA
========================================================= */

function drawLeaf(x, y, angle, size, progress) {
    const p = clamp(progress, 0, 1);

    if (p <= 0) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const layers = 7;

    for (let i = 0; i < layers; i++) {
        const lp = clamp(p * layers - i, 0, 1);

        if (lp <= 0) continue;

        const s = 1 - i * 0.085;
        const len = size * s * lp;
        const w = size * 0.36 * s * lp;

        ctx.beginPath();
        ctx.moveTo(0, 0);

        ctx.bezierCurveTo(
            -w, -len * 0.22,
            -w * 0.55, -len * 0.82,
            0, -len
        );

        ctx.bezierCurveTo(
            w * 0.55, -len * 0.82,
            w, -len * 0.22,
            0, 0
        );

        ctx.closePath();

        ctx.strokeStyle = i % 2 === 0 ? COLORS.greenSoft : COLORS.greenDark;
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size * p);

    ctx.strokeStyle = "rgba(120,180,120,0.55)";
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();
}

/* =========================================================
   PÉTALO DE GIRASOL
========================================================= */

function drawSunflowerPetal(
    cx,
    cy,
    angle,
    radius,
    petalLength,
    petalWidth,
    progress,
    color,
    layers
) {
    const localProgress = clamp(progress, 0, 1);

    if (localProgress <= 0) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    for (let layer = 0; layer < layers; layer++) {
        const layerProgress = localProgress * layers - layer;

        if (layerProgress <= 0) continue;

        const lp = clamp(layerProgress, 0, 1);
        const s = 1 - layer * 0.06;

        const r = radius * s;
        const len = petalLength * s;
        const w = petalWidth * s;

        const baseY = -r;
        const tipY = lerp(baseY, -r - len, easeOutCubic(lp));

        ctx.beginPath();
        ctx.moveTo(0, baseY);

        ctx.bezierCurveTo(
            -w * 0.95, lerp(baseY, tipY, 0.28),
            -w * 0.48, lerp(baseY, tipY, 0.82),
            0, tipY
        );

        ctx.bezierCurveTo(
            w * 0.48, lerp(baseY, tipY, 0.82),
            w * 0.95, lerp(baseY, tipY, 0.28),
            0, baseY
        );

        ctx.closePath();

        ctx.strokeStyle = color;
        ctx.lineWidth = 0.85;
        ctx.globalAlpha = 0.95 - layer * 0.045;
        ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
}

/* =========================================================
   CENTRO DEL GIRASOL
========================================================= */

function drawSunflowerCenter(x, y, radius, progress) {
    const p = clamp(progress, 0, 1);

    if (p <= 0) return;

    ctx.beginPath();
    ctx.arc(x, y, radius * p, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.centerDark;
    ctx.fill();

    const points = 85;

    for (let i = 0; i < points; i++) {
        const t = i / points;

        if (t > p) break;

        const angle = i * 2.399963229728653;
        const r = Math.sqrt(i / points) * radius * 0.95;

        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);

        ctx.fillStyle =
            i % 4 === 0
                ? COLORS.centerAccent
                : COLORS.centerBrown;

        ctx.fill();
    }
}

/* =========================================================
   GIRASOL COMPLETO
========================================================= */

function drawSunflower(x, y, scale, progress, rotation = 0) {
    const petals = 14;
    const layers = 12;

    const radius = 19 * scale;
    const petalLength = 86 * scale;
    const petalWidth = 24 * scale;

    for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 / petals) * i + rotation;
        const delay = (i / petals) * 0.18;

        const p = clamp((progress - delay) / 0.80, 0, 1);

        drawSunflowerPetal(
            x,
            y,
            angle,
            radius,
            petalLength,
            petalWidth,
            p,
            i % 2 === 0 ? COLORS.yellow : COLORS.yellowSoft,
            layers
        );
    }

    drawSunflowerCenter(
        x,
        y,
        28 * scale,
        clamp((progress - 0.36) / 0.64, 0, 1)
    );
}

/* =========================================================
   MARGARITA PEQUEÑA
========================================================= */

function drawDaisyPetal(
    cx,
    cy,
    angle,
    radius,
    petalLength,
    petalWidth,
    progress
) {
    const p = clamp(progress, 0, 1);

    if (p <= 0) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const baseY = -radius;
    const tipY = lerp(
        baseY,
        -radius - petalLength,
        easeOutCubic(p)
    );

    ctx.beginPath();
    ctx.moveTo(0, baseY);

    ctx.bezierCurveTo(
        -petalWidth,
        lerp(baseY, tipY, 0.30),

        -petalWidth * 0.5,
        lerp(baseY, tipY, 0.82),

        0,
        tipY
    );

    ctx.bezierCurveTo(
        petalWidth * 0.5,
        lerp(baseY, tipY, 0.82),

        petalWidth,
        lerp(baseY, tipY, 0.30),

        0,
        baseY
    );

    ctx.closePath();

    ctx.strokeStyle = COLORS.whitePetal;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.restore();
}

function drawDaisy(x, y, scale, progress, rotation = 0) {
    const petals = 10;

    const radius = 2.5 * scale;
    const petalLength = 12 * scale;
    const petalWidth = 4.4 * scale;

    for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 / petals) * i + rotation;
        const delay = (i / petals) * 0.18;

        const p = clamp((progress - delay) / 0.82, 0, 1);

        drawDaisyPetal(
            x,
            y,
            angle,
            radius,
            petalLength,
            petalWidth,
            p
        );
    }

    const centerProgress = clamp(
        (progress - 0.35) / 0.65,
        0,
        1
    );

    if (centerProgress > 0) {
        ctx.beginPath();

        ctx.arc(
            x,
            y,
            3.6 * scale * centerProgress,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = COLORS.daisyCenter;
        ctx.fill();
    }
}

/* =========================================================
   GRUPO DE MARGARITAS
========================================================= */

function drawDaisyCluster(
    x,
    y,
    scale,
    progress,
    variant = 0
) {
    const offsetsByVariant = [
        [
            [-16, -8, 0.82],
            [0, 0, 1.0],
            [16, -6, 0.86],
            [8, 12, 0.82],
            [-12, 12, 0.76]
        ],
        [
            [-10, -10, 0.72],
            [4, -2, 0.95],
            [16, 10, 0.75],
            [-6, 14, 0.70]
        ],
        [
            [-14, -4, 0.80],
            [0, 8, 0.88],
            [14, -2, 0.82],
            [8, 16, 0.72]
        ]
    ];

    const offsets =
        offsetsByVariant[
            variant %
            offsetsByVariant.length
        ];

    offsets.forEach((item, index) => {
        const [ox, oy, s] = item;

        const local = clamp(
            (progress - index * 0.08) / 0.92,
            0,
            1
        );

        drawDaisy(
            x + ox * scale,
            y + oy * scale,
            s * scale,
            local,
            index * 0.3
        );
    });
}

/* =========================================================
   FLORECITA DE HORTENSIA
========================================================= */

function drawHydrangeaFloret(
    x,
    y,
    scale,
    progress,
    rotation,
    color
) {
    const p = clamp(progress, 0, 1);

    if (p <= 0) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const petals = 4;

    for (let i = 0; i < petals; i++) {
        const angle = i * Math.PI / 2;

        ctx.save();
        ctx.rotate(angle);

        const petalProgress = clamp(
            (p - i * 0.05) / 0.8,
            0,
            1
        );

        if (petalProgress > 0) {
            const len =
                8 *
                scale *
                easeOutCubic(petalProgress);

            const w =
                5 *
                scale *
                easeOutCubic(petalProgress);

            ctx.beginPath();
            ctx.moveTo(0, -1 * scale);

            ctx.bezierCurveTo(
                -w,
                -len * 0.3,

                -w * 0.75,
                -len * 0.85,

                0,
                -len
            );

            ctx.bezierCurveTo(
                w * 0.75,
                -len * 0.85,

                w,
                -len * 0.3,

                0,
                -1 * scale
            );

            ctx.closePath();

            ctx.strokeStyle = color;
            ctx.lineWidth = 0.7;
            ctx.stroke();
        }

        ctx.restore();
    }

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        1.4 * scale * p,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(245,240,255,0.85)";

    ctx.fill();

    ctx.restore();
}

/* =========================================================
   RACIMO DE HORTENSIA
========================================================= */

function drawHydrangeaCluster(
    x,
    y,
    scale,
    progress,
    flip = 1
) {
    const p = clamp(progress, 0, 1);

    if (p <= 0) return;

    const flowers = [
        [-22, -12, 0.85],
        [-8, -25, 0.78],
        [10, -24, 0.82],
        [24, -10, 0.75],

        [-28, 5, 0.78],
        [-12, 2, 1.0],
        [6, 0, 0.92],
        [24, 4, 0.82],

        [-18, 20, 0.80],
        [0, 18, 0.90],
        [18, 18, 0.78],

        [-4, 34, 0.72]
    ];

    const colors = [
        "rgba(175,165,255,0.78)",
        "rgba(145,190,255,0.76)",
        "rgba(205,175,255,0.74)",
        "rgba(170,210,255,0.72)"
    ];

    flowers.forEach((flower, index) => {
        const [ox, oy, s] = flower;

        const local = clamp(
            (p - index * 0.04) / 0.9,
            0,
            1
        );

        drawHydrangeaFloret(
            x + ox * scale * flip,
            y + oy * scale,
            s * scale,
            local,
            index * 0.3,
            colors[index % colors.length]
        );
    });
}

/* =========================================================
   HORTENSIAS EN LOS BORDES
========================================================= */

function drawSideHydrangeas(elapsed) {
    const p = clamp(elapsed / 2.2, 0, 1);

    const isMobile =
        width < 600;

    if (isMobile) {
        const edgeScale = Math.min(
            width / 430,
            height / 900,
            1.0
        );

        /* izquierda superior */
        drawHydrangeaCluster(
            40,
            height * 0.18,
            0.78 * edgeScale,
            p,
            1
        );

        /* izquierda media */
        drawHydrangeaCluster(
            24,
            height * 0.48,
            0.70 * edgeScale,
            p,
            1
        );

        /* derecha superior */
        drawHydrangeaCluster(
            width - 18,
            height * 0.24,
            0.64 * edgeScale,
            p,
            -1
        );

        /* derecha media */
        drawHydrangeaCluster(
            width - 18,
            height * 0.48,
            0.72 * edgeScale,
            p,
            -1
        );
    } else {
        const edgeScale = Math.min(
            width / 900,
            height / 800,
            1.0
        );

        drawHydrangeaCluster(
            58,
            height * 0.18,
            1.22 * edgeScale,
            p,
            1
        );

        drawHydrangeaCluster(
            32,
            height * 0.48,
            0.96 * edgeScale,
            p,
            1
        );

        drawHydrangeaCluster(
            width - 58,
            height * 0.22,
            1.00 * edgeScale,
            p,
            -1
        );

        drawHydrangeaCluster(
            width - 32,
            height * 0.50,
            0.94 * edgeScale,
            p,
            -1
        );
    }
}

/* =========================================================
   ENVOLTURA TRASERA
========================================================= */

function drawBackWrapper(
    centerX,
    baseY,
    scale,
    progress
) {
    const p = clamp(progress, 0, 1);

    if (p <= 0) return;

    const grow = easeOutBack(p);

    const panels = [
        {
            dx: -135,
            topY: -300,
            innerX: -42,
            innerY: -92,
            fill: COLORS.wrapperFill1
        },
        {
            dx: -42,
            topY: -330,
            innerX: -10,
            innerY: -100,
            fill: COLORS.wrapperFill2
        },
        {
            dx: 55,
            topY: -322,
            innerX: 12,
            innerY: -104,
            fill: COLORS.wrapperFill1
        },
        {
            dx: 140,
            topY: -290,
            innerX: 44,
            innerY: -94,
            fill: COLORS.wrapperFill3
        }
    ];

    ctx.save();

    panels.forEach(panel => {
        const topX =
            centerX +
            panel.dx *
            scale *
            grow;

        const topY =
            baseY +
            panel.topY *
            scale *
            grow;

        const innerX =
            centerX +
            panel.innerX *
            scale *
            grow;

        const innerY =
            baseY +
            panel.innerY *
            scale *
            grow;

        const startX =
            centerX;

        const startY =
            baseY +
            8 *
            scale;

        ctx.beginPath();

        ctx.moveTo(
            startX,
            startY
        );

        ctx.quadraticCurveTo(
            lerp(startX, topX, 0.45),

            lerp(startY, topY, 0.4) -
            22 *
            scale,

            topX,
            topY
        );

        ctx.quadraticCurveTo(
            lerp(topX, innerX, 0.45),

            lerp(topY, innerY, 0.5) -
            8 *
            scale,

            innerX,
            innerY
        );

        ctx.quadraticCurveTo(
            centerX,
            baseY -
            36 *
            scale,

            startX,
            startY
        );

        ctx.closePath();

        ctx.fillStyle =
            panel.fill;

        ctx.fill();

        ctx.strokeStyle =
            COLORS.wrapperStrokeSoft;

        ctx.lineWidth =
            1.0;

        ctx.stroke();
    });

    ctx.restore();
}

/* =========================================================
   ENVOLTURA FRONTAL
========================================================= */

function drawFrontWrapper(
    centerX,
    baseY,
    scale,
    progress
) {
    const p = clamp(progress, 0, 1);

    if (p <= 0) return;

    const grow =
        easeOutBack(p);

    const panels = [
        {
            dx: -138,
            topY: -210,
            innerX: -54,
            innerY: -26,
            fill: COLORS.wrapperFill2
        },
        {
            dx: -62,
            topY: -190,
            innerX: -18,
            innerY: -18,
            fill: COLORS.wrapperFill3
        },
        {
            dx: 18,
            topY: -185,
            innerX: 14,
            innerY: -20,
            fill: COLORS.wrapperFill1
        },
        {
            dx: 100,
            topY: -195,
            innerX: 42,
            innerY: -20,
            fill: COLORS.wrapperFill2
        }
    ];

    ctx.save();

    panels.forEach(panel => {
        const topX =
            centerX +
            panel.dx *
            scale *
            grow;

        const topY =
            baseY +
            panel.topY *
            scale *
            grow;

        const innerX =
            centerX +
            panel.innerX *
            scale *
            grow;

        const innerY =
            baseY +
            panel.innerY *
            scale *
            grow;

        const startX =
            centerX;

        const startY =
            baseY +
            12 *
            scale;

        ctx.beginPath();

        ctx.moveTo(
            startX,
            startY
        );

        ctx.quadraticCurveTo(
            lerp(startX, topX, 0.45),

            lerp(startY, topY, 0.35) +
            5 *
            scale,

            topX,
            topY
        );

        ctx.quadraticCurveTo(
            lerp(topX, innerX, 0.5),

            lerp(topY, innerY, 0.5) +
            18 *
            scale,

            innerX,
            innerY
        );

        ctx.quadraticCurveTo(
            centerX,
            baseY -
            2 *
            scale,

            startX,
            startY
        );

        ctx.closePath();

        ctx.fillStyle =
            panel.fill;

        ctx.fill();

        ctx.strokeStyle =
            COLORS.wrapperStroke;

        ctx.lineWidth =
            1.05;

        ctx.stroke();
    });

    const ribbonY =
        baseY +
        2 *
        scale;

    ctx.beginPath();

    ctx.ellipse(
        centerX,
        ribbonY,
        24 * scale,
        8 * scale,
        0,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        COLORS.ribbon;

    ctx.lineWidth =
        1.8;

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        centerX -
        2 *
        scale,

        ribbonY +
        5 *
        scale
    );

    ctx.lineTo(
        centerX -
        34 *
        scale,

        ribbonY +
        52 *
        scale
    );

    ctx.moveTo(
        centerX +
        2 *
        scale,

        ribbonY +
        5 *
        scale
    );

    ctx.lineTo(
        centerX +
        30 *
        scale,

        ribbonY +
        50 *
        scale
    );

    ctx.strokeStyle =
        COLORS.ribbon;

    ctx.lineWidth =
        1.5;

    ctx.stroke();

    ctx.restore();
}

/* =========================================================
   RAMO COMPLETO
========================================================= */

function drawBouquet(elapsed) {
    const centerX =
        width /
        2;

    const baseY =
        height *
        0.90;

    const bouquetScale =
        Math.min(
            width / 320,
            height / 620,
            1.45
        );

    /* envoltura trasera */
    drawBackWrapper(
        centerX,
        baseY,
        bouquetScale,

        clamp(
            (elapsed - 0.25) / 1.0,
            0,
            1
        )
    );

    /* girasoles */
    const sunflowers = [
        {
            x: -55,
            y: -340,
            scale: 1.18,
            delay: 1.45,
            rot: -0.12,
            bend: -20
        },
        {
            x: 40,
            y: -255,
            scale: 1.10,
            delay: 1.75,
            rot: 0.08,
            bend: 18
        }
    ];

    /* tallos principales */
    sunflowers.forEach((flower, index) => {
        const stemProgress =
            clamp(
                (
                    elapsed -
                    index * 0.10 -
                    0.55
                ) /
                1.0,
                0,
                1
            );

        drawStem(
            centerX,
            baseY + 12 * bouquetScale,

            centerX +
            flower.x *
            bouquetScale,

            baseY +
            flower.y *
            bouquetScale,

            flower.bend *
            bouquetScale,

            easeOutCubic(
                stemProgress
            ),

            COLORS.green
        );
    });

    /* tallos secundarios */
    const fillerStems = [
        {
            x: 110,
            y: -220,
            bend: 22,
            delay: 0.95
        },
        {
            x: 118,
            y: -165,
            bend: 26,
            delay: 1.05
        },
        {
            x: 78,
            y: -132,
            bend: 18,
            delay: 1.15
        },
        {
            x: -92,
            y: -130,
            bend: -20,
            delay: 1.20
        },
        {
            x: -110,
            y: -178,
            bend: -26,
            delay: 1.30
        },
        {
            x: -18,
            y: -120,
            bend: -6,
            delay: 1.25
        }
    ];

    fillerStems.forEach(stem => {
        const p =
            clamp(
                (
                    elapsed -
                    stem.delay
                ) /
                0.85,
                0,
                1
            );

        drawStem(
            centerX,
            baseY + 10 * bouquetScale,

            centerX +
            stem.x *
            bouquetScale,

            baseY +
            stem.y *
            bouquetScale,

            stem.bend *
            bouquetScale,

            easeOutCubic(p),

            "rgba(85,150,90,0.85)"
        );
    });

    /* hojas */
    const leaves = [
        {
            x: -108,
            y: -215,
            angle: -1.10,
            size: 58,
            delay: 1.00
        },
        {
            x: -76,
            y: -168,
            angle: -0.75,
            size: 50,
            delay: 1.15
        },
        {
            x: 112,
            y: -170,
            angle: 0.95,
            size: 60,
            delay: 1.28
        },
        {
            x: 64,
            y: -132,
            angle: 0.55,
            size: 48,
            delay: 1.40
        },
        {
            x: 0,
            y: -140,
            angle: -0.20,
            size: 46,
            delay: 1.34
        },
        {
            x: 24,
            y: -315,
            angle: 0.35,
            size: 42,
            delay: 1.38
        }
    ];

    leaves.forEach(leaf => {
        const lp =
            clamp(
                (
                    elapsed -
                    leaf.delay
                ) /
                0.8,
                0,
                1
            );

        drawLeaf(
            centerX +
            leaf.x *
            bouquetScale,

            baseY +
            leaf.y *
            bouquetScale,

            leaf.angle,

            leaf.size *
            bouquetScale,

            lp
        );
    });

    /* margaritas */
    const daisyClusters = [
        {
            x: 110,
            y: -220,
            scale: 1.00,
            delay: 1.35,
            variant: 0
        },
        {
            x: 118,
            y: -165,
            scale: 0.94,
            delay: 1.52,
            variant: 1
        },
        {
            x: 40,
            y: -130,
            scale: 0.90,
            delay: 1.68,
            variant: 2
        },
        {
            x: -35,
            y: -130,
            scale: 0.82,
            delay: 1.76,
            variant: 1
        }
    ];

    daisyClusters.forEach(cluster => {
        const p =
            clamp(
                (
                    elapsed -
                    cluster.delay
                ) /
                1.0,
                0,
                1
            );

        drawDaisyCluster(
            centerX +
            cluster.x *
            bouquetScale,

            baseY +
            cluster.y *
            bouquetScale,

            cluster.scale *
            bouquetScale,

            p,

            cluster.variant
        );
    });

    /* girasoles */
    sunflowers.forEach(flower => {
        const fp =
            clamp(
                (
                    elapsed -
                    flower.delay
                ) /
                1.65,
                0,
                1
            );

        drawSunflower(
            centerX +
            flower.x *
            bouquetScale,

            baseY +
            flower.y *
            bouquetScale,

            flower.scale *
            bouquetScale,

            fp,

            flower.rot
        );
    });

    /* envoltura frontal */
    drawFrontWrapper(
        centerX,
        baseY,
        bouquetScale,

        clamp(
            (
                elapsed -
                0.95
            ) /
            1.1,
            0,
            1
        )
    );
}

/* =========================================================
   LOOP PRINCIPAL
========================================================= */

function animate(timestamp) {
    requestAnimationFrame(animate);

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    if (animationStarted) {
        if (lastTimestamp === 0) {
            lastTimestamp =
                timestamp;
        }

        animationTime +=
            (
                timestamp -
                lastTimestamp
            ) /
            1000;

        lastTimestamp =
            timestamp;

        drawParticles(
            animationTime
        );

        drawSideHydrangeas(
            animationTime
        );

        drawBouquet(
            animationTime
        );
    }
}

requestAnimationFrame(
    animate
);

/* =========================================================
   BOTÓN
========================================================= */

document
    .getElementById(
        "startButton"
    )
    .addEventListener(
        "click",
        () => {
            if (animationStarted) {
                return;
            }

            animationStarted =
                true;

            animationTime =
                0;

            lastTimestamp =
                0;

            document
                .getElementById(
                    "messageBox"
                )
                .classList
                .add(
                    "minimized"
                );

            setTimeout(
                () => {
                    document
                        .getElementById(
                            "finalMessage"
                        )
                        .classList
                        .add(
                            "visible"
                        );
                },
                6200
            );
        }
    );