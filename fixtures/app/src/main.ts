import { computed, effect, reactive } from "@qiuyl/reactive";

const count = reactive(0);
const count2 = reactive(1);

const count3 = computed(() => {
  return count() + count2();
}, [count, count2]);

const button = document.createElement("button");

effect(() => {
  button.textContent = String(count3());
});

button.addEventListener("click", () => {
  count(count() + 1);
  count2(count2() + 2);
  console.log(count3());
});

document.getElementById("app")?.append(button);
