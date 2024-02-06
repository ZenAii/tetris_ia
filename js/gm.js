function GameManager() {
  this.gridCanvas = document.getElementById("grid-canvas");
  this.scoreContainer = document.getElementById("score-container");
  this.resetButton = document.getElementById("reset-button");
  this.aiButton = document.getElementById("ai-button");

  this.gravityUpdater = new Updater();
  this.gravityUpdater.skipping = this.aiActive;
  this.gravityUpdater.onUpdate(function () {
    self.applyGravity();
    self.actuate();
  });

  var self = this;
  document.addEventListener("keydown", function (event) {
    switch (event.which) {
      case 32: //drop
        self.drop();
        self.gravityUpdater.doUpdate(Date.now());
        break;
      case 40: //down
        self.gravityUpdater.doUpdate(Date.now());
        break;
      case 37: //left
        self.moveLeft();
        self.actuate();
        break;
      case 39: //right
        self.moveRight();
        self.actuate();
        break;
      case 38: //up
        self.rotate();
        self.actuate();
        break;
    }
  });
  this.aiButton.onclick = function () {
    self.aiActive = !self.aiActive;
    self.gravityUpdater.skipping = self.aiActive;
    if (self.aiActive) {
      self.aiButton.innerText = "Stop AI";
    } else {
      self.aiButton.innerText = "Run AI";
    }
  };
  this.resetButton.onclick = function () {
    self.setup();
  };

  this.setup();
  this.gravityUpdater.checkUpdate(Date.now());
}

GameManager.prototype.setup = function () {
  this.aiButton.innerText = "Run AI";

  this.grid = new Grid(22, 10);
  this.rpg = new RandomPieceGenerator();
  this.ai = new AI(
    0.6656893691979349,
    0.9927492830902338,
    0.4654485417995602,
    0.2407724775839597
  );
  this.workingPieces = [this.rpg.nextPiece(), this.rpg.nextPiece()];
  this.workingPiece = this.workingPieces[0];

  this.isOver = true;
  this.score = 0;
  this.aiActive = false;
  this.gravityUpdater.skipping = false;

  this.actuate();
};

GameManager.prototype.actuate = function () {
  var _grid = this.grid.clone();
  if (this.workingPiece != null) {
    _grid.addPiece(this.workingPiece);
  }

  var context = this.gridCanvas.getContext("2d");

  context.save();
  context.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

  for (var r = 2; r < _grid.rows; r++) {
    for (var c = 0; c < _grid.columns; c++) {
      if (_grid.cells[r][c] == 1) {
        context.fillStyle = "#FF0000";
        context.fillRect(20 * c, 20 * (r - 2), 20, 20);
        context.strokeStyle = "#FFFFFF";
        context.strokeRect(20 * c, 20 * (r - 2), 20, 20);
      }
    }
  }

  context.restore();
  this.scoreContainer.innerHTML = this.score.toString();
};

GameManager.prototype.setWorkingPiece = function () {
  this.grid.addPiece(this.workingPiece);
  this.score += this.grid.clearLines();
  if (!this.grid.exceeded()) {
    for (var i = 0; i < this.workingPieces.length - 1; i++) {
      this.workingPieces[i] = this.workingPieces[i + 1];
    }
    this.workingPieces[this.workingPieces.length - 1] = this.rpg.nextPiece();
    this.workingPiece = this.workingPieces[0];
    if (this.aiActive) {
      this.aiMove();
      this.gravityUpdater.skipping = true;
    }
  } else {
    alert("Game Over!");
  }
};

GameManager.prototype.applyGravity = function () {
  if (this.grid.canMoveDown(this.workingPiece)) {
    this.workingPiece.row++;
  } else {
    this.gravityUpdater.skipping = false;
  }
};
GameManager.prototype.drop = function () {
  while (this.grid.canMoveDown(this.workingPiece)) {
    this.workingPiece.row++;
  }
  this.setWorkingPiece();
};

GameManager.prototype.moveLeft = function () {
  if (this.grid.canMoveLeft(this.workingPiece)) {
    this.workingPiece.column--;
  }
};
GameManager.prototype.moveRight = function () {
  if (this.grid.canMoveRight(this.workingPiece)) {
    this.workingPiece.column++;
  }
};
GameManager.prototype.rotate = function () {
  var offset = this.grid.rotateOffset(this.workingPiece);
  if (offset != null) {
    this.workingPiece.rotate(1);
    this.workingPiece.row += offset.rowOffset;
    this.workingPiece.column += offset.columnOffset;
  }
};
GameManager.prototype.aiMove = function () {
  this.workingPiece = this.ai.best(this.grid, this.workingPieces, 0).piece;
};
