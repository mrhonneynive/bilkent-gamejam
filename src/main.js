import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the prefix

kaplay({
  width: 1520,
  height: 760,
  letterbox: true,
  debug: true,
  background: [135, 206, 235],
});

loadRoot("./");

scene("menu", () => {
  const screenWidth = 1520;
  const buttonX = screenWidth / 2; // Butonları yatayda ortalamak için

  add([
    text("   HASSAAAAANNN", { size: 48 }),
    pos(buttonX - 270, 100), // Yazıyı butonlardan yukarı koyuyoruz
    color(0, 0, 0), // Beyaz renk
  ]);

  addButton("Start", vec2(buttonX, 400), () => go("game"));
  addButton("Quit", vec2(buttonX, 500), () => debug.log("bye"));
});

scene("game", () => {
  loadSprite("ground", "sprites/ground.png");
  loadSprite("atam", "sprites/atam.png");
  loadSprite("player", "sprites/player.png");
  loadSprite("sun", "sprites/sun.png");
  loadSprite("cloud1", "sprites/cloud1.png");
  loadSprite("cloud2", "sprites/cloud2.png");
  loadSprite("tree", "sprites/tree.png");

  // Load collectible sprites
  loadSprite("o1", "sprites/o1.png");
  loadSprite("o2", "sprites/o2.png");
  loadSprite("o3", "sprites/o3.png");
  loadSprite("oe", "sprites/oe.png");
  loadSprite("oe5", "sprites/oe5.png");

  // Add invisible walls and floor
  add([
    rect(20, 20000),
    area(),
    outline(1),
    pos(0, 40),
    body({ isStatic: true }),
    opacity(0),
  ]);

  add([
    rect(500, 20),
    area(),
    outline(1),
    pos(1100, 300),
    body({ isStatic: true }),

  ]);

  add([
    rect(200000, 20),
    area(),
    outline(1),
    pos(0, 720 - 60),
    body({ isStatic: true }),
  ]);

  // Add Atam sprite
  add([
    sprite("atam"),
    pos(1400, 500), // Adjust the position as needed
    scale(1),
    anchor("center"),
    z(100),
  ]);

  // Add sun sprite
  add([
    sprite("sun"),
    pos(1350, 100), // Adjust the position as needed
    scale(0.2),
    anchor("center"),
    fixed(),
  ]);

  // Load player sprite with animations
  loadSprite("player", "sprites/player.png", {
    sliceX: 8,
    sliceY: 8,
    anims: {
      idle: { from: 0, to: 0, speed: 5, loop: true },
      run: {
        from: 1,
        to: 3,
        loop: true,
      },
      "jump-up": 8,
      "jump-down": 9,
    },
  });

  // Add ground sprites
  for (let i = 0; i < 40; i++) {
    add([
      sprite("ground"),
      pos(i * 400 - 800, height() + 400), // Alt kısma yerleştir
      body({ isStatic: true }),
      anchor("botleft"),
      scale(0.6),
      z(2),
    ]);
  }

  // Add cloud1 sprites
  for (let i = 0; i < 40; i += 2) {
    add([
      sprite("cloud1"),
      pos(i * 400 - 800, height() - 400), // Alt kısma yerleştir
      body({ isStatic: true }),
      anchor("botleft"),
      scale(0.3),
      z(1),
    ]);
  }

  // Add tree sprites
  for (let i = 2; i < 40; i += 4) {
    add([
      sprite("tree"),
      pos(i * 400 - 800, height() - 80), // Alt kısma yerleştir
      body({ isStatic: true }),
      anchor("botleft"),
      scale(0.3),
      z(2),
    ]);
  }

  // Add more cloud1 sprites
  for (let i = 1; i < 40; i += 2) {
    add([
      sprite("cloud1"),
      pos(i * 400 - 800, height() - 350), // Alt kısma yerleştir
      body({ isStatic: true }),
      anchor("botleft"),
      scale(0.3),
      z(1),
    ]);
  }

  // Add cloud2 sprites
  for (let i = 0; i < 40; i++) {
    add([
      sprite("cloud2"),
      pos(i * 400 - 600, height() + 50), // Alt kısma yerleştir
      body({ isStatic: true }),
      anchor("botleft"),
      scale(0.5),
      z(1),
    ]);
  }

  // Player movement constants
  const SPEED = 480;
  const JUMP_FORCE = 300;
  const SLIDE_SPEED = SPEED * 1.5; // extra speed for slide
  const SLIDE_DURATION = 0.3; // slide lasts 0.3 seconds

  setGravity(540);

  // Add player
  const player = add([
    sprite("player"),
    pos(center()),
    anchor("center"),
    area(),
    body(),
    z(3),
    scale(2),
  ]);

  player.play("idle");
  player.isSliding = false;

  // Score system
  let score = 0;
  const scoreText = add([
    text(`Collected: ${score}/5`, { size: 32 }),
    pos(20, 20),
    fixed(),
    z(100),
  ]);

    // Sarmaşık (o6) sprite'ını yükle
  loadSprite("sirik", "sprites/sirik.png");

  // Sarmaşığı başlangıçta ekleyip görünmez yap
  const vine = add([
    sprite("sirik"),
    pos(4100, 400), // Sarmaşığın çıkacağı yer
    scale(2),
    anchor("center"),
    area(),
    opacity(0), // Başlangıçta görünmez
    z(50),
    "vine",
  ]);

  // Add collectible objects
  const collectibles = [
    { name: "o1", pos: vec2(1200, 200) },
    { name: "o2", pos: vec2(1500, 300) },
    { name: "o3", pos: vec2(2000, 300) },
    { name: "oe", pos: vec2(2500, 300) },
    { name: "oe5", pos: vec2(3000, 300) },
  ];

  collectibles.forEach((obj) => {
    add([
      sprite(obj.name),
      pos(obj.pos),
      area(),
      "collectible",
      scale(0.2), // Adjust scale as needed
      z(4),
    ]);
  });

  player.onCollide("collectible", (obj) => {
    destroy(obj);
    score++;
    scoreText.text = `Collected: ${score}/5 `;
  
    if (score === 5) {
      vine.opacity = 1; // Sarmaşığı görünür yap
      debug.log("Sırık mevcutlaştırıldı!");
    }
  });

  // Camera follow player
  player.onUpdate(() => {
    const camX = player.pos.x; // Sadece X ekseninde takip
    setCamPos(vec2(camX, 360)); // 360 = 720/2 (ekranın dikey ortası)
  });

  player.onPhysicsResolve(() => {
    const camX = player.pos.x; // Sadece X ekseninde takip
    setCamPos(vec2(camX, 360));
  });

  // Player animations
  player.onGround(() => {
    if (!isKeyDown("left") && !isKeyDown("right") && !player.isSliding) {
      player.play("idle");
    } else if (!player.isSliding) {
      player.play("run");
    }
  });

  player.onAnimEnd((anim) => {
    if (anim === "idle") {
      // Example: you can trigger something when the idle animation ends.
    }
  });

  // Fasulye sprite'ını yükle
loadSprite("fasulye", "sprites/fasulye.png");

// Fasulye fırlatma fonksiyonu
function throwBean() {
  const bean = add([
    sprite("fasulye"),
    pos(player.pos.x + (player.flipX ? -20 : 20), player.pos.y - 10), // Oyuncunun önünden fırlasın
    area(),
    body(),
    move(player.flipX ? LEFT : RIGHT, 600), // Sağ veya sol tarafa hareket etsin
    scale(0.2),
    "bean",
    z(7),
  ]);
}


let fasulyeCount = 0;
// B tuşuna basınca fasulye fırlat
onKeyPress("b", () => {
  const fasulye = add([
    sprite("fasulye"),
    pos(player.pos.x + 20, player.pos.y),
    area(),
    move(RIGHT, 800), // Hızlı hareket etmesi için
    anchor("center"),
    scale(0.2),
    "fasulye",
  ]);

  fasulye.onCollide("vine", (vine) => {
    destroy(fasulye);
    fasulyeCount++;

    if (fasulyeCount >= 5) {
      debug.log("Hayat Bitti!");
      wait(1, () => go("menu")); // 1 saniye bekleyip menüye dön
    }
  });
  
});

let sirikHealth = 5; // Başlangıçta 5 can

// Can barı ekleme
const healthBar = add([
  rect(200, 20), // Barın boyutu
  pos(20, 60), // Konumu
  color(255, 0, 0), // Kırmızı
  fixed(), // Kamera hareket etse bile sabit kalır
  z(100), // Üst katmanda olması için
]);

// Sarmaşık (sirik.png) için olay
onCollide("fasulye", "vine", (fasulye, vine) => {
  destroy(fasulye); // Fasulyeyi yok et
  sirikHealth--; // Canı azalt

  // Can barını güncelle
  healthBar.width = (sirikHealth / 5) * 200;

  if (sirikHealth <= 0) {
    destroy(vine); // Sarmaşığı yok et
    debug.log("Sırık yok edildi haha!");
  }
});

player.onCollide("vine", () => {
  // You can destroy the player or trigger some kind of "death" behavior
  destroy(player);
  
  const gameOverText = add([
    text("HAYAT BİTTİ", { size: 100, font: "sink" }), // You can adjust the font and size
    pos(center().x, center().y - 100), // Center the text on the screen, slightly above the center
    color(255, 0, 0), // Red color for the text
    z(200), // Make sure the text is above other elements
    fixed(), // Make the text fixed so it doesn't move with the camera
  ]);

  // Wait for 1 second before going back to the menu
  wait(4, () => {
    destroy(gameOverText); // Remove the "Hayat Bitti" text
    go("menu"); // Go back to the menu
  });// After 1 second, go back to the menu (you can adjust this as needed)
});


  player.jumpsLeft = 2;

  // Player controls
  onKeyPress("space", () => {
    if (player.isGrounded()) {
      // Reset jumps when player is on the ground
      player.jumpsLeft = 40;
    }
  
    if (player.jumpsLeft > 0) {
      player.jump(JUMP_FORCE);
      player.jumpsLeft--; // Decrease jumps left
  
      // Play appropriate animation
      if (player.jumpsLeft === 1) {
        player.play("jump-up");
      } else if (player.jumpsLeft === 0) {
        player.play("jump-up"); // Or use a different animation for double jump if available
      }
    }
  });

  onKeyDown("left", () => {
    if (!player.isSliding) {
      player.move(-SPEED, 0);
      player.flipX = true;
      if (player.isGrounded() && player.getCurAnim().name !== "run") {
        player.play("run");
      }
    }
  });

  onKeyDown("right", () => {
    if (!player.isSliding) {
      player.move(SPEED, 0);
      player.flipX = false;
      if (player.isGrounded() && player.getCurAnim().name !== "run") {
        player.play("run");
      }
    }
  });

  ["left", "right"].forEach((key) => {
    onKeyRelease(key, () => {
      if (
        player.isGrounded() &&
        !isKeyDown("left") &&
        !isKeyDown("right") &&
        !player.isSliding
      ) {
        player.play("idle");
      }
    });
  });
});

go("menu");

// Button creation function
function addButton(
  txt = "start game",
  p = vec2(200, 100),
  f = () => debug.log("hello")
) {
  const btn = add([
    rect(240, 80, { radius: 8 }),
    pos(p),
    area(),
    scale(1),
    anchor("center"),
    outline(4),
    color(255, 255, 255),
  ]);

  btn.add([
    text(txt),
    anchor("center"),
    color(0, 0, 0),
  ]);

  btn.onHoverUpdate(() => {
    const t = time() * 10;
    btn.color = hsl2rgb((t / 10) % 1, 0.6, 0.7);
    btn.scale = vec2(1.2);
    setCursor("pointer");
  });

  btn.onHoverEnd(() => {
    btn.scale = vec2(1);
    btn.color = rgb();
  });

  btn.onClick(f);

  return btn;
}