import { take } from "./take";
import { from } from "../../streams/from/from";

describe("take", () => {
  it("returns the expected number of items", async () => {
    const numberStream = from([0, 1, 2, 3]);
    const stream = take(2)(
      (async function* () {
        try {
          yield* numberStream;
        } finally {
          await numberStream.return();
        }
      })()
    );
    const callback = jest.fn();
    for await (const value of stream) {
      callback(value);
    }

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, 0);
    expect(callback).toHaveBeenNthCalledWith(2, 1);

    expect(numberStream.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
  });

  it("request number of items > number of items in stream, then returns all items in stream", async () => {
    const numberStream = from([0, 1, 2, 3]);
    const stream = take(10)(
      (async function* () {
        try {
          yield* numberStream;
        } finally {
          await numberStream.return();
        }
      })()
    );
    const callback = jest.fn();
    for await (const value of stream) {
      callback(value);
    }

    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenNthCalledWith(1, 0);
    expect(callback).toHaveBeenNthCalledWith(2, 1);
    expect(callback).toHaveBeenNthCalledWith(3, 2);
    expect(callback).toHaveBeenNthCalledWith(4, 3);

    expect(numberStream.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
  });

  it("should be done for an empty stream", async () => {
    const emptyStream = (async function* () {
      yield* [];
    })();

    const stream = take(5)(emptyStream);
    expect(stream.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
  });
});
