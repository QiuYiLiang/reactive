import { computed, effect, reactive } from "@qiuyl/reactive";

const count = reactive(0);

const count2 = computed(() => {
  return count() * 2;
});

const button = document.createElement("button");

effect(() => {
  button.textContent = String(count2());
});

button.addEventListener("click", () => {
  count(count() + 1);
});

document.getElementById("app")?.append(button);
