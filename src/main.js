import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay({
  width: 1280,
  height: 960,
  letterbox: true,
  debug: true,
});

k.loadRoot("./"); // A good idea for Itch.io publishing later
k.loadSprite("bean", "sprites/bean.png");

k.add([k.pos(120, 80), k.sprite("bean")]);

k.onClick(() => k.addKaboom(k.mousePos()));