import kaplay from "kaplay";
import "kaplay/global"; // uncomment if you want to use without the prefix

kaplay({
  width: 1280,
  height: 720,
  letterbox: true,
  debug: true,
});

loadRoot("./"); // A good idea for Itch.io publishing later
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
  // Only slide if the player is grounded, moving (left or right is held), and not already sliding
  if (
    player.isGrounded() &&
    (isKeyDown("left") || isKeyDown("right")) &&
    !player.isSliding
  ) {
    player.isSliding = true;

    // If you have a slide animation, you could do:
    // player.play("slide");
    // Otherwise, we simulate a slide by squashing the sprite:
    player.scale.y = 0.5; // squish vertically to mimic a sliding posture

    // Determine slide direction based on which way the player is facing:
    const direction = player.flipX ? -1 : 1;

    // Apply a burst of sliding movement.
    // Here we repeatedly move the player for the duration of the slide.
    const slideInterval = setInterval(() => {
      player.move(direction * SLIDE_SPEED, 0);
    }, 16); // roughly every frame (60fps)

    // End the slide after SLIDE_DURATION seconds
    wait(SLIDE_DURATION, () => {
      clearInterval(slideInterval);
      player.isSliding = false;
      player.scale.y = 1; // revert the squashed scale

      // Return to the appropriate animation based on input:
      if (player.isGrounded() && (isKeyDown("left") || isKeyDown("right"))) {
        player.play("run");
      } else {
        player.play("idle");
      }
    });
  }
});

// Add a floor
add([
  rect(width(), 24),
  area(),
  outline(1),
  pos(0, height()),
  body({ isStatic: true }),
]);
