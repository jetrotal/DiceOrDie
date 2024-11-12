// constants.js
const CELL_SIZE = 80;
const PIECE_SIZE_RATIO = 0.7;
const IDLE_AREA_WIDTH = 150;
const HEX_SIZE = CELL_SIZE / 2;
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;
const HEX_WIDTH = 2 * HEX_SIZE;
const HEX_VERT_DISTANCE = (HEX_HEIGHT * 3) / 4;

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

// utils.js
const hexToPixel = (q, r) => {
  const x = HEX_SIZE * ((3 / 2) * q);
  const y = HEX_SIZE * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r);
  return { x, y };
};

const pixelToHex = (x, y) => {
  const q = ((2 / 3) * x) / HEX_SIZE;
  const r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * y) / HEX_SIZE;
  return hexRound(q, r);
};

const hexRound = (q, r) => {
  let s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);
  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  } else {
    rs = -rq - rr;
  }
  return { q: rq, r: rr };
};

// piece.js
class Piece {
  constructor(x, y, color, name) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.name = name;
    this.image = null;
    this.inIdleArea = true;
  }

  draw(ctx) {
    const pieceSize = CELL_SIZE * PIECE_SIZE_RATIO;
    const radius = pieceSize / 2;

    // Save the current context state
    ctx.save();

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
    ctx.clip();

    // Draw the piece (circle or image)
    if (this.image) {
      // Calculate dimensions to maintain aspect ratio while filling the circle
      const imgAspect = this.image.width / this.image.height;
      let drawWidth = pieceSize;
      let drawHeight = pieceSize;

      if (imgAspect > 1) {
        // Image is wider than tall
        drawWidth = pieceSize * imgAspect;
        drawHeight = pieceSize;
      } else {
        // Image is taller than wide
        drawWidth = pieceSize;
        drawHeight = pieceSize / imgAspect;
      }

      // Center the image in the circle
      ctx.drawImage(
        this.image,
        this.x - drawWidth / 2,
        this.y - drawHeight / 2,
        drawWidth,
        drawHeight
      );
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Restore the context state to remove clipping
    ctx.restore();

    // Draw border circle
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw name with background
    ctx.font = "12px Arial";
    const textMetrics = ctx.measureText(this.name);
    const textWidth = textMetrics.width;
    const padding = 4;
    const backgroundHeight = 16;
    const backgroundWidth = textWidth + padding * 2;
    const backgroundY = this.y + pieceSize / 2 + 5;

    // Draw rounded rectangle background
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.roundRect(
      this.x - backgroundWidth / 2,
      backgroundY,
      backgroundWidth,
      backgroundHeight,
      8
    );
    ctx.fill();

    // Draw text
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.name, this.x, backgroundY + backgroundHeight / 2);
  }

  async setImage(imageUrl) {
    if (!imageUrl) {
      this.image = null;
      return;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        resolve();
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }
}

// grid.js
class Grid {
  constructor(width, height, type = "square") {
    this.width = width;
    this.height = height;
    this.type = type;
  }

  draw(ctx) {
    if (this.type === "square") {
      this.drawSquareGrid(ctx);
    } else if (this.type === "hexagonal") {
      this.drawHexagonalGrid(ctx);
    }
  }

  drawSquareGrid(ctx) {
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;

    for (let i = 0; i <= this.width; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, this.height * CELL_SIZE);
      ctx.stroke();
    }

    for (let i = 0; i <= this.height; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(this.width * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
  }

  /*applied this workaround, because the hex grids couldn't fit the entire board. they where stuck at a diagonal area. I wish we had a better solution.*/
  drawHexagonalGrid(ctx) {
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;

    for (let q = 0; q < this.width * 2; q++) {
      for (let r = -this.height; r < this.height * 2; r++) {
        this.drawHexagon(ctx, q, r);
      }
    }
  }

  /* before the workaround it was:
  drawHexagonalGrid(ctx) {
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;

    for (let q = 0; q < this.width; q++) {
      for (let r = 0; r < this.height; r++) {
        this.drawHexagon(ctx, q, r);
      }
    }
  }
*/

  drawHexagon(ctx, q, r) {
    const { x, y } = hexToPixel(q, r);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = ((2 * Math.PI) / 6) * i;
      const hx = x + HEX_SIZE * Math.cos(angle);
      const hy = y + HEX_SIZE * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(hx, hy);
      } else {
        ctx.lineTo(hx, hy);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  getClosestCell(x, y) {
    if (this.type === "square") {
      return {
        x: Math.floor(x / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2,
        y: Math.floor(y / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2
      };
    } else if (this.type === "hexagonal") {
      const { q, r } = pixelToHex(x, y);
      return hexToPixel(q, r);
    }
  }
}

// game.js
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.pieces = [];
    this.grid = null;
    this.backgroundImage = null;
    this.isDragging = false;
    this.selectedPiece = null;
    this.dragOffset = { x: 0, y: 0 };
    this.highlightedCell = null;
    this.pieceCounter = 0;

    this.initGame();
  }

  initGame() {
    this.setupEventListeners();
    this.generateGrid();
  }

  setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener(
      "contextmenu",
      this.handleContextMenu.bind(this)
    );
    document.addEventListener(
      "click",
      this.hideCustomizationIfOutside.bind(this)
    );

    document
      .getElementById("updatePieceButton")
      .addEventListener("click", this.updatePiece.bind(this));
    document
      .getElementById("generateGridButton")
      .addEventListener("click", this.generateGrid.bind(this));
    document
      .getElementById("addPieceButton")
      .addEventListener("click", this.addPiece.bind(this));
    document
      .getElementById("removePieceButton")
      .addEventListener("click", this.removePiece.bind(this));
  }

  generateGrid() {
    const config = this.getGridConfig();
    this.updateCanvasSize(config);
    this.grid = new Grid(
      config.boardWidth / CELL_SIZE,
      config.boardHeight / CELL_SIZE,
      config.gridType
    );
    this.loadBackgroundImage(config.bgImageUrl);
    this.draw();
  }

  getGridConfig() {
    return {
      gridType: document.getElementById("gridType").value,
      bgImageUrl: document.getElementById("backgroundImage").value,
      boardWidth: parseInt(document.getElementById("boardWidth").value) || 0,
      boardHeight: parseInt(document.getElementById("boardHeight").value) || 0
    };
  }

  updateCanvasSize(config) {
    this.canvas.width = config.boardWidth + IDLE_AREA_WIDTH;
    this.canvas.height = config.boardHeight;
  }

  loadBackgroundImage(url) {
    if (url) {
      this.backgroundImage = new Image();
      this.backgroundImage.src = url;
      this.backgroundImage.onload = () => this.draw();
    } else {
      this.backgroundImage = null;
      this.draw();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground();
    this.grid.draw(this.ctx);
    this.drawIdleArea();
    this.drawHighlight();
    this.pieces.forEach((piece) => piece.draw(this.ctx));
  }

  drawBackground() {
    if (this.backgroundImage) {
      this.ctx.drawImage(
        this.backgroundImage,
        0,
        0,
        this.canvas.width - IDLE_AREA_WIDTH,
        this.canvas.height
      );
    }
  }

  drawIdleArea() {
    this.ctx.fillStyle = "#f0f0f0";
    this.ctx.fillRect(
      this.canvas.width - IDLE_AREA_WIDTH,
      0,
      IDLE_AREA_WIDTH,
      this.canvas.height
    );
    this.ctx.strokeStyle = "#000";
    this.ctx.strokeRect(
      this.canvas.width - IDLE_AREA_WIDTH,
      0,
      IDLE_AREA_WIDTH,
      this.canvas.height
    );
  }

  drawHighlight() {
    if (this.highlightedCell) {
      this.ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
      if (this.grid.type === "square") {
        this.ctx.fillRect(
          this.highlightedCell.x - CELL_SIZE / 2,
          this.highlightedCell.y - CELL_SIZE / 2,
          CELL_SIZE,
          CELL_SIZE
        );
      } else if (this.grid.type === "hexagonal") {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = ((2 * Math.PI) / 6) * i;
          const hx = this.highlightedCell.x + HEX_SIZE * Math.cos(angle);
          const hy = this.highlightedCell.y + HEX_SIZE * Math.sin(angle);
          if (i === 0) {
            this.ctx.moveTo(hx, hy);
          } else {
            this.ctx.lineTo(hx, hy);
          }
        }
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
  }

  handleMouseDown(e) {
    if (e.button === 0) {
      const { x, y } = this.getMousePosition(e);
      const clickedPiece = this.findClickedPiece(x, y);
      if (clickedPiece) {
        this.startDragging(clickedPiece, x, y);
      }
    }
  }

  handleMouseMove(e) {
    const { x, y } = this.getMousePosition(e);
    if (this.isDragging && this.selectedPiece) {
      this.movePiece(x, y);
      this.updateHighlightedCell(x, y);
      this.draw();
    }
  }

  handleMouseUp(e) {
    if (e.button === 0 && this.isDragging && this.selectedPiece) {
      this.dropPiece();
      this.isDragging = false;
      this.selectedPiece = null;
      this.highlightedCell = null;
      this.draw();
    }
  }

  handleContextMenu(e) {
    e.preventDefault();
    const { x, y } = this.getMousePosition(e);
    const clickedPiece = this.findClickedPiece(x, y);
    if (clickedPiece) {
      this.showPieceCustomization(clickedPiece, e.clientX, e.clientY);
    }
  }

  getMousePosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  findClickedPiece(x, y) {
    const pieceSize = CELL_SIZE * PIECE_SIZE_RATIO;
    return this.pieces.find((piece) => {
      const dx = x - piece.x;
      const dy = y - piece.y;
      return dx * dx + dy * dy < (pieceSize / 2) * (pieceSize / 2);
    });
  }

  startDragging(piece, x, y) {
    this.isDragging = true;
    this.selectedPiece = piece;
    this.dragOffset.x = x - piece.x;
    this.dragOffset.y = y - piece.y;
  }

  movePiece(x, y) {
    this.selectedPiece.x = x - this.dragOffset.x;
    this.selectedPiece.y = y - this.dragOffset.y;
  }

  updateHighlightedCell(x, y) {
    if (x < this.canvas.width - IDLE_AREA_WIDTH) {
      const cell = this.grid.getClosestCell(x, y);
      if (this.isCellFullyVisible(cell)) {
        this.highlightedCell = cell;
      } else {
        this.highlightedCell = null;
      }
    } else {
      this.highlightedCell = null;
    }
  }

  isCellFullyVisible(cell) {
    if (this.grid.type === "square") {
      return (
        cell.x - CELL_SIZE / 2 >= 0 &&
        cell.x + CELL_SIZE / 2 <= this.canvas.width - IDLE_AREA_WIDTH &&
        cell.y - CELL_SIZE / 2 >= 0 &&
        cell.y + CELL_SIZE / 2 <= this.canvas.height
      );
    } else if (this.grid.type === "hexagonal") {
      return (
        cell.x - HEX_SIZE >= 0 &&
        cell.x + HEX_SIZE <= this.canvas.width - IDLE_AREA_WIDTH &&
        cell.y - HEX_HEIGHT / 2 >= 0 &&
        cell.y + HEX_HEIGHT / 2 <= this.canvas.height
      );
    }
    return false;
  }

  hideCustomizationIfOutside(e) {
    const customization = document.getElementById("pieceCustomization");
    if (
      customization &&
      customization.style.display !== "none" &&
      !customization.contains(e.target)
    ) {
      customization.style.display = "none";
    }
  }

  showPieceCustomization(piece, x, y) {
    const customization = document.getElementById("pieceCustomization");
    if (customization) {
      customization.style.display = "block";
      customization.style.left = `${x}px`;
      customization.style.top = `${y}px`;
      document.getElementById("pieceName").value = piece.name;
      document.getElementById("pieceColor").value = piece.color;
      document.getElementById("pieceImage").value = piece.image
        ? piece.image.src
        : "";
      this.selectedPiece = piece;
    }
  }

  generatePieceName() {
    this.pieceCounter++;
    return `Piece ${this.pieceCounter}`;
  }

  addPiece() {
    const newPiece = new Piece(
      this.canvas.width - IDLE_AREA_WIDTH / 2,
      this.canvas.height / 2,
      getRandomColor(),
      this.generatePieceName()
    );
    this.pieces.push(newPiece);
    this.repositionIdlePieces();
    this.draw();
  }

  removePiece() {
    if (this.selectedPiece) {
      const index = this.pieces.indexOf(this.selectedPiece);
      if (index > -1) {
        this.pieces.splice(index, 1);
      }
      this.selectedPiece = null;
      const customization = document.getElementById("pieceCustomization");
      if (customization) {
        customization.style.display = "none";
      }
      this.repositionIdlePieces();
      this.draw();
    }
  }

  dropPiece() {
    if (this.selectedPiece.x < this.canvas.width - IDLE_AREA_WIDTH) {
      const cell = this.grid.getClosestCell(
        this.selectedPiece.x,
        this.selectedPiece.y
      );
      if (this.isCellFullyVisible(cell)) {
        this.selectedPiece.inIdleArea = false;
        this.selectedPiece.x = cell.x;
        this.selectedPiece.y = cell.y;
      } else {
        this.selectedPiece.inIdleArea = true;
        this.repositionIdlePieces();
      }
    } else {
      this.selectedPiece.inIdleArea = true;
      this.repositionIdlePieces();
    }
  }

  repositionIdlePieces() {
    const idlePieces = this.pieces.filter((piece) => piece.inIdleArea);
    idlePieces.forEach((piece, index) => {
      piece.x = this.canvas.width - IDLE_AREA_WIDTH / 2;
      piece.y = (index + 0.5) * CELL_SIZE;
    });
  }

  updatePiece() {
    if (this.selectedPiece) {
      const newName = document.getElementById("pieceName").value.trim();
      if (newName && newName !== this.selectedPiece.name) {
        const match = newName.match(/^Piece (\d+)$/);
        if (match) {
          const number = parseInt(match[1]);
          this.pieceCounter = Math.max(this.pieceCounter, number);
        }
        this.selectedPiece.name = newName;
      }
      this.selectedPiece.color = document.getElementById("pieceColor").value;
      const newImageUrl = document.getElementById("pieceImage").value;
      this.selectedPiece
        .setImage(newImageUrl)
        .then(() => this.draw())
        .catch((error) => console.error("Failed to load image:", error));
    }
    const customization = document.getElementById("pieceCustomization");
    if (customization) {
      customization.style.display = "none";
    }
  }
}

// main.js
new Game();