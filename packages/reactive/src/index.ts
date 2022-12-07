type Lensten = () => void;
type reactiveFn<V = any> = (value?: V) => V;

interface Effect {
  fn: Lensten;
  reactiveVals: Set<ReactiveVal>;
  timer: any;
  useDeps: boolean;
}

interface ReactiveVal {
  initValue: any;
  value: any;
  effects: Set<Effect>;
}
type DistoryEffect = () => void;

let currentEffect: Effect | null = null;

function createEffect(fn: Lensten, useDeps: boolean): Effect {
  return {
    fn,
    reactiveVals: new Set(),
    timer: null,
    useDeps,
  };
}

export function effect(fn: Lensten, deps?: reactiveFn[]): DistoryEffect {
  const prevEffect = currentEffect;
  const useDeps = typeof deps !== "undefined";
  const effect = createEffect(fn, useDeps);

  if (useDeps) {
    currentEffect = null;
    fn();
  }

  currentEffect = effect;
  if (useDeps) {
    deps.forEach((dep) => {
      dep();
    });
  } else {
    fn();
  }
  currentEffect = prevEffect;

  return () => {
    effect.reactiveVals.forEach((reactiveVal) => {
      reactiveVal.effects.delete(effect);
    });
  };
}

function createReactive(value: any): ReactiveVal {
  return {
    initValue: value,
    value,
    effects: new Set<Effect>(),
  };
}

let runningEffect: Effect | null = null;

export function reactive<V = any>(value: V): reactiveFn<V>;
export function reactive(value: any) {
  const reactiveVal = createReactive(value);
  return function (value: any) {
    if (arguments.length === 0) {
      if (
        runningEffect !== null &&
        runningEffect.useDeps &&
        !runningEffect.reactiveVals.has(reactiveVal)
      ) {
        return reactiveVal.initValue;
      }

      if (currentEffect !== null) {
        reactiveVal.effects.add(currentEffect);
        currentEffect.reactiveVals.add(reactiveVal);
      }

      return reactiveVal.value;
    } else {
      if (reactiveVal.value === value) {
        return reactiveVal.value;
      }
      reactiveVal.value = value;
      reactiveVal.effects.forEach((effect) => {
        const { fn } = effect;
        if (effect.timer === null) {
          effect.timer = setTimeout(() => {
            const prevRunningEffect = runningEffect;
            runningEffect = effect;
            fn();
            runningEffect = prevRunningEffect;
            effect.timer = null;
          }, 0);
        }
      });
      return reactiveVal.value;
    }
  };
}

type ComputedFn<V = any> = () => V;
export function computed<V = any>(
  fn: ComputedFn<V>,
  deps?: reactiveFn[]
): ComputedFn<V> {
  let memoValue: any = null;
  effect(() => {
    const value = fn();
    if (memoValue === null) {
      memoValue = reactive(value);
      return;
    }
    memoValue(value);
  }, deps);
  return memoValue;
}
