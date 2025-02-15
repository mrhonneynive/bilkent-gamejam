import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the prefix
kaplay({
  width: 1280,
  height: 720,
  letterbox: true,
  debug: true,
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
  add([
    sprite("ground"), // Use the ground sprite
    pos(-400, height() + 650), // Position it at the bottom of the screen
    // area(), // Enable collision detection
    body({ isStatic: true }), // Make it static so the player can walk on it
    anchor("botleft"), // Align it properly at the bottom left
  ]);
  
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
  
  // Update the camera position each frame
  player.onUpdate(() => {
    setCamPos(player.worldPos());
  });
  
  // Also update camera position when physics are resolved
  player.onPhysicsResolve(() => {
    setCamPos(player.worldPos());
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


  

  // Add a floor
  add([
    sprite("ground"),
    rect(200, 24),
    area(),
    outline(1),
    pos(0, height()),
    body({ isStatic: true }),
  ]);
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



