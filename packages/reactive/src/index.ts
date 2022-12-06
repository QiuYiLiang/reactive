type Fn = () => void;
type DistoryEffect = () => void;

let Lensten: Fn | null = null;

export function reactive<V = any>(value: V): (value?: V) => V;
export function reactive(value: any) {
  let state = value;
  const lenstens = new Set<Fn>();
  return function (value: any) {
    if (arguments.length === 0) {
      if (typeof Lensten === "function") {
        lenstens.add(Lensten);
      }

      return state;
    } else {
      state = value;
      lenstens.forEach((fn) => {
        fn();
      });
      return state;
    }
  };
}

export function effect(fn: Fn): DistoryEffect;
export function effect(fn: any) {
  const prevLensten = Lensten;
  Lensten = fn;
  fn();
  Lensten = prevLensten;
}
