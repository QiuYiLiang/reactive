import { reactive, effect } from "reactive";

const count = reactive(0);

const button = document.createElement("button");

button.addEventListener("click", () => {
  count(count() + 1);
});

effect(() => {
  button.textContent = String(count());
});

document.getElementById("app")?.append(button);
