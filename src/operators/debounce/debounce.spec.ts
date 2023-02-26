import { debounce } from "./debounce";
import fakeTimers from "@sinonjs/fake-timers";
import { subscribe } from "../../subscribe";

describe("debounce", () => {
  let clock: ReturnType<typeof fakeTimers.install>;

  beforeEach(() => {
    clock = fakeTimers.install();
  });

  afterEach(() => {
    clock.uninstall();
  });

  it("should debounce the input generator and emit the last value after the specified time has passed", async () => {
    async function* inputGenerator() {
      yield 1;
      await new Promise((resolve) => setTimeout(resolve, 500));
      yield 2;
      await new Promise((resolve) => setTimeout(resolve, 100));
      yield 3;
    }

    const debounceSource = debounce(200)(inputGenerator());

    const values: number[] = [];

    const unsubscribe = subscribe(
      () => debounceSource,
      function* () {
        while (true) {
          values.push((yield) as number);
        }
      }
    );

    expect(values).toEqual([]);

    await clock.tickAsync(100);
    expect(values).toEqual([]);

    await clock.tickAsync(200);
    expect(values).toEqual([1]);

    await clock.tickAsync(300);
    expect(values).toEqual([1, 3]);

    unsubscribe();
  });
});
