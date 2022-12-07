type Lensten = () => void;
type reactiveFn<V = any> = (value?: V) => V;
interface Effect {
  fn: Lensten;
  reactiveVals: Set<ReactiveVal>;
}

interface ReactiveVal {
  value: any;
  effects: Set<Effect>;
}
type DistoryEffect = () => void;

let currentEffect: Effect | null = null;

function createEffect(fn: Lensten): Effect {
  return {
    fn,
    reactiveVals: new Set(),
  };
}

export function effect(fn: Lensten, deps?: reactiveFn[]): DistoryEffect {
  const prevEffect = currentEffect;
  const effect = createEffect(fn);

  if (deps) {
    currentEffect = null;
    fn();
  }

  currentEffect = effect;
  if (deps) {
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
    value,
    effects: new Set<Effect>(),
  };
}

export function reactive<V = any>(value: V): reactiveFn<V>;
export function reactive(value: any) {
  const reactiveVal = createReactive(value);
  return function (value: any) {
    if (arguments.length === 0) {
      if (currentEffect !== null) {
        reactiveVal.effects.add(currentEffect);
        currentEffect.reactiveVals.add(reactiveVal);
      }

      return reactiveVal.value;
    } else {
      reactiveVal.value = value;
      reactiveVal.effects.forEach(({ fn }) => {
        fn();
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
    if (memoValue === null) {
      memoValue = reactive(fn());
      return;
    }
    memoValue(fn());
  }, deps);
  return memoValue;
}
