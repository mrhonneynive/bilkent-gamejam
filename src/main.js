import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the prefix
kaplay({
  width: 1520,
  height: 750,
  letterbox: true,
  debug: true,
  background: [ 135, 206, 235, ],
});



loadRoot("./");

scene("menu", () => {
  const screenWidth = 1280;
  const buttonX = screenWidth / 2; // Butonları yatayda ortalamak için

  add([
    text("Welcome to the game!", { size: 48 }),
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
  

    add([
      rect(20, 20000),
      area(),
      outline(1),
      pos(0, 40),
      body({ isStatic: true }),
      opacity(0),
    ]);
    // Add an invisibl floor
    add([
      rect(200000, 20),
      area(),
      outline(1),
      pos(0, 720 - 60),
      body({ isStatic: true }),
    ]);

    add([
      sprite("atam"),
      pos(1400, 600), // Adjust the position as needed
      scale(0.3),
      anchor("center"),
      z(100),
    ]);

    add([
      sprite("sun"),
      pos(1350, 100), // Adjust the position as needed
      scale(0.2),
      anchor("center"),
      fixed(),
    ]);
    

  loadSprite("player", "sprites/player.png", {
    sliceX: 4,
    sliceY: 6,
    anims: {
      idle: { from: 0, to: 3, speed: 5, loop: true },
      run: {
        from: 4,
        to: 7,
        loop: true,
      },
      "jump-up": 8,
      "jump-down": 9,
      // Optionally, if you add sliding frames:
      // slide: { from: 10, to: 12, speed: 10, loop: false },
    },
  });

  
  loadSprite("ground", "sprites/ground.png");
  // Yer sprite'larını ekranın altına yerleştir
  for (let i = 0; i < 20; i++) {
    add([
      sprite("ground"),
      pos(i * 400 - 800, height() + 400), // Alt kısma yerleştir
      body({ isStatic: true }),
      anchor("botleft"),
      scale(0.6),

    ]);
  }

  for (let i = 0; i < 20; i += 2) {
    add([
      sprite("cloud1"),
      pos(i * 400 - 800, height() - 400), // Alt kısma yerleştir
      body({ isStatic: true }),
      anchor("botleft"),
      scale(0.3),
      z(1),
    ]);
  }

  for (let i = 1; i < 20; i += 2) {
    add([
      sprite("cloud1"),
      pos(i * 400 - 800, height() - 350), // Alt kısma yerleştir
      body({ isStatic: true }),
      anchor("botleft"),
      scale(0.3),
      z(1),
    ]);
  }

  for (let i = 0; i < 20; i++) {
    add([
      sprite("cloud2"),
      pos(i * 400 - 600, height() + 50), // Alt kısma yerleştir
      body({ isStatic: true }),
      anchor("botleft"),
      scale(0.5),
      z(1),
    ]);
  }
  
  const SPEED = 480;
  const JUMP_FORCE = 300;
  const SLIDE_SPEED = SPEED * 1.5; // extra speed for slide
  const SLIDE_DURATION = 0.3; // slide lasts 0.3 seconds
  
  setGravity(640);
  
  const player = add([
    sprite("player"),   
    pos(center()),
    anchor("center"),
    area(),
    body(),
  ]);
  
  player.play("idle");
  // Custom property to track if the player is sliding
  player.isSliding = false;
  
  player.onUpdate(() => {
    const camX = player.pos.x; // Sadece X ekseninde takip
    setCamPos(vec2(camX, 360)); // 360 = 720/2 (ekranın dikey ortası)
  });
  
  player.onPhysicsResolve(() => {
    const camX = player.pos.x; // Sadece X ekseninde takip
    setCamPos(vec2(camX, 360));
  });
  
  // When the player is on the ground, switch animations (unless sliding)
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
  
  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump(JUMP_FORCE);
      player.play("jump-up");
    }
  });
  
  // Normal left/right movement – disable these if sliding is active
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
  
  // SLIDING MECHANIC
  onKeyPress("down", () => {
    // Yerde olup sağa ya da sola gidiyorsa ve şu anda kaymıyorsa kaymaya başla
    if (
        player.isGrounded() &&
        (isKeyDown("left") || isKeyDown("right")) &&
        !player.isSliding
    ) {
        player.isSliding = true;
        player.scale.y = 0.5; // Kayma efektini vermek için sprite'ı sıkıştır
  
        // Hangi yöne bakıyorsa o yöne doğru kaymasını sağla
        const direction = player.flipX ? -1 : 1;

        // Kayma hareketini başlat
        const slideAction = action(() => {
            player.move(direction * SLIDE_SPEED, 0);
        });

        // Belirtilen süre sonra kaymayı bitir
        wait(SLIDE_DURATION, () => {
            slideAction.cancel(); // Kaymayı durdur
            player.isSliding = false;
            player.scale.y = 1; // Sprite'ı eski haline getir

            // Eğer hala hareket ediyorsa koşma animasyonuna geç, değilse dur
            if (player.isGrounded() && (isKeyDown("left") || isKeyDown("right"))) {
                player.play("run");
            } else {
                player.play("idle");
            }
        });
    }


  

  });

  
  
});

go("menu");

function addButton(
  txt = "start game",
  p = vec2(200, 100),
  f = () => debug.log("hello"),
) {
  // add a parent background object
  const btn = add([
      rect(240, 80, { radius: 8 }),
      pos(p),
      area(),
      scale(1),
      anchor("center"),
      outline(4),
      color(255, 255, 255),
  ]);

  // add a child object that displays the text
  btn.add([
      text(txt),
      anchor("center"),
      color(0, 0, 0),
  ]);

  // onHoverUpdate() comes from area() component
  // it runs every frame when the object is being hovered
  btn.onHoverUpdate(() => {
      const t = time() * 10;
      btn.color = hsl2rgb((t / 10) % 1, 0.6, 0.7);
      btn.scale = vec2(1.2);
      setCursor("pointer");
  });

  // onHoverEnd() comes from area() component
  // it runs once when the object stopped being hovered
  btn.onHoverEnd(() => {
      btn.scale = vec2(1);
      btn.color = rgb();
  });

  // onClick() comes from area() component
  // it runs once when the object is clicked
  btn.onClick(f);

  return btn;
}



