let video;
let handpose;
let predictions = [];

let fallingLetters = [];
let textOptions = "教育科技學系".split('');
let score = 0;

let catCanX;
let catCanY;
let catCanSize = 80;

let gameStarted = false;
let gameOver = false; // 新增遊戲結束狀態

let bgMusic; // 背景音樂

const catEarColor = '#ff6f91';
const catTailColor = '#ff9a9e';

let restartButton; // 全域變數追蹤重新挑戰按鈕

function preload() {
  // 載入背景音樂
  bgMusic = loadSound('relaxing-music-for-study--work.mp3');
}

// 貓罐頭簡易畫法
function drawCatCan(x, y, size) {
  push();
  translate(x, y);
  // 罐頭本體
  fill('#ffb347');
  stroke('#ff974f');
  strokeWeight(3);
  ellipse(0, 0, size * 0.8, size);

  // 罐頭蓋
  fill('#ffe066');
  ellipse(0, -size * 0.4, size * 0.9, size * 0.3);

  // 罐頭標籤
  fill('#fff5ba');
  noStroke();
  rectMode(CENTER);
  rect(0, 0, size * 0.5, size * 0.4, 10);

  // 貓耳 (左)
  fill(catEarColor);
  noStroke();
  triangle(-size * 0.3, -size * 0.5, -size * 0.1, -size * 0.8, 0, -size * 0.45);
  // 貓耳 (右)
  triangle(size * 0.3, -size * 0.5, size * 0.1, -size * 0.8, 0, -size * 0.45);
  pop();
}

// 教育科技學系字母 + 貓耳尾巴裝飾
class FallingLetter {
  constructor(x, y, char) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.speed = random(1.5, 3);
    this.size = 40;
  }

  update() {
    this.y += this.speed;
  }

  show() {
    push();
    textAlign(CENTER, CENTER);
    textSize(this.size);
    textStyle(BOLD);
    textFont('sans-serif');

    // 字體主色
    fill('#ffe066');
    stroke('#ffa94d');
    strokeWeight(1.5);
    text(this.char, this.x, this.y);

    // 貓耳 (左)
    fill(catEarColor);
    noStroke();
    triangle(
      this.x - this.size * 0.3, this.y - this.size * 0.6,
      this.x - this.size * 0.1, this.y - this.size * 0.9,
      this.x, this.y - this.size * 0.55
    );

    // 貓耳 (右)
    triangle(
      this.x + this.size * 0.3, this.y - this.size * 0.6,
      this.x + this.size * 0.1, this.y - this.size * 0.9,
      this.x, this.y - this.size * 0.55
    );

    // 貓尾巴簡單弧線
    stroke(catTailColor);
    strokeWeight(3);
    noFill();
    arc(this.x + this.size * 0.4, this.y + this.size * 0.2, this.size * 0.5, this.size * 0.8, PI * 1.3, PI * 2);

    pop();
  }

  hits(x, y, size) {
    // 簡單方框碰撞判定 (貓罐頭方框)
    return (
      this.x > x - size / 2 &&
      this.x < x + size / 2 &&
      this.y > y - size / 2 &&
      this.y < y + size / 2
    );
  }

  offScreen() {
    return this.y > height + 30;
  }
}


function setup() {
  createCanvas(640, 480);
  
  function preload() {
    // 載入背景音樂
    bgMusic = loadSound('relaxing-music-for-study--work.mp3');
  }
  // 播放背景音樂，並設定為循環播放
  bgMusic.loop();

  // 攝影機設定
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => {
    console.log("Handpose model ready");
  });

  handpose.on("predict", results => {
    predictions = results;
  });

  // 貓罐頭初始位置（畫面中下方）
  catCanX = width / 2;
  catCanY = height - 80;

  // 按鈕事件
  const btn = document.getElementById("startButton");
  btn.onclick = () => {
    gameStarted = true;
    btn.style.display = "none";
  };
}

function draw() {
  background('#fff4eb');

  // 攝影機畫面（鏡像）
  push();
  translate(width, 0);
  scale(-1, 1);
  tint(255, 150);
  image(video, 0, 0, width, height);
  pop();

  if (gameOver) {
    drawGameOverScreen(); // 顯示結束畫面
    return;
  }

  if (!gameStarted) {
    drawStartScreen(); // 顯示初始畫面
    return;
  }

  updateCatCanPosition();

  drawCatCan(catCanX, catCanY, catCanSize);

  // 生成字體 (掉落速度跟字間隔調整)
  if (frameCount % 60 === 0) {
    let letter = random(textOptions);
    fallingLetters.push(new FallingLetter(random(40, width - 40), -40, letter));
  }

  // 字體更新與碰撞判定
  for (let i = fallingLetters.length - 1; i >= 0; i--) {
    let fl = fallingLetters[i];
    fl.update();
    fl.show();

    if (fl.hits(catCanX, catCanY, catCanSize)) {
      fallingLetters.splice(i, 1);
      score++;
    } else if (fl.offScreen()) {
      fallingLetters.splice(i, 1);
    }
  }

  // 檢查分數是否達到 20 分
  if (score >= 20) {
    gameOver = true; // 切換到遊戲結束狀態
  }

  // 顯示分數
  fill('#ff6f91');
  stroke('#e75470');
  strokeWeight(3);
  textSize(30);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("💖 得分：" + score, 15, 15);
}

function drawStartScreen() {
  background('#fff4eb');

  // 標題文字往上
  push();
  textAlign(CENTER, CENTER);
  fill('#ff6f91');
  stroke('#f67280');
  strokeWeight(3);
  textSize(48);
  textStyle(BOLD);
  text("教育科技學系\n🐾 貓咪接字遊戲 🐾", width / 2, height / 2);
  pop();

  // 貓耳
  fill('#ff6f91');
  noStroke();
  triangle(width / 2 - 110, height / 3 + 20, width / 2 - 50, height / 3 + 20, width / 2 - 80, height / 3 - 20);
  triangle(width / 2 + 50, height / 3 + 20, width / 2 + 110, height / 3 + 20, width / 2 + 80, height / 3 - 20);

  pop();
}

function drawGameOverScreen() {
  background('#fff4eb');

  // 顯示結束畫面文字
  push();
  textAlign(CENTER, CENTER);
  fill('#ff6f91');
  stroke('#f67280');
  strokeWeight(3);
  textSize(48);
  textStyle(BOLD);
  text("遊戲結束！\n🎉 恭喜達成 20 分 🎉", width / 2, height / 2 - 50);
  pop();

  // 如果按鈕尚未創建，則創建按鈕
  if (!restartButton) {
    restartButton = createButton('重新挑戰');
    restartButton.position(width / 2 - 50, height / 2 + 50);
    restartButton.mousePressed(() => {
      console.log("重新挑戰按鈕被點擊");
      resetGame(); // 重置遊戲狀態
      restartButton.remove(); // 確保按鈕被移除
      restartButton = null; // 將按鈕變數設為 null
      console.log("重新挑戰按鈕已移除");
    });

    // 確保按鈕樣式不影響畫面
    restartButton.style('font-size', '20px');
    restartButton.style('padding', '10px 20px');
  }
}

function resetGame() {
  // 重置遊戲狀態
  gameOver = false;
  gameStarted = false;
  score = 0;
  fallingLetters = [];
  catCanX = width / 2;
  catCanY = height - 80;

  // 重新顯示開始遊戲按鈕
  const startButton = document.getElementById("startButton");
  if (startButton) {
    startButton.style.display = "block";
  }
}

function updateCatCanPosition() {
  if (predictions.length > 0) {
    let hand = predictions[0];
    let landmarks = hand.landmarks;

    // 手掌中心點用 wrist(0)和中指基底(9)平均來算（可以微調）
    let wrist = landmarks[0];
    let middleBase = landmarks[9];
    let palmX = (wrist[0] + middleBase[0]) / 2;
    let palmY = (wrist[1] + middleBase[1]) / 2;

    // 因為鏡像，X軸要反轉
    catCanX = width - palmX;
    catCanY = palmY;

    // 限制貓罐
}

}
