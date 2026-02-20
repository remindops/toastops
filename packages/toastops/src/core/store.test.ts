import { expect, test, describe, beforeEach } from "bun:test";
import { ToastStore } from "./store";

describe("Toast Store Core Logic", () => {
  let store: ToastStore;
  let toast: ReturnType<typeof createMockToastApi>;

  function createMockToastApi(localStore: ToastStore) {
    const t = (msg: string, opts?: any) => localStore.create(msg, 'blank', opts);
    t.success = (msg: string, opts?: any) => localStore.create(msg, 'success', opts);
    t.error = (msg: string, opts?: any) => localStore.create(msg, 'error', opts);
    t.dismiss = (id?: string) => localStore.dismissToast(id);
    return t;
  }

  beforeEach(() => {
    // Create a fresh store and fresh API binding for each test 
    // to strictly prevent 400ms fade-out timeout bleeding
    store = new ToastStore();
    toast = createMockToastApi(store);
  });

  test("adds a new toast via internal store and external API", () => {
    let callCount = 0;
    const unsub = store.subscribe((state) => {
      callCount++;
      if (state.toasts.length > 0) {
        expect(state.toasts[0].message).toBe("Hello World");
      }
    });

    const id = toast("Hello World");
    expect(id).toBeDefined();
    expect(callCount).toBeGreaterThan(0);
    unsub();
  });

  test("enforces the max TOAST_LIMIT of 5", () => {
    let finalToastCount = 0;
    const unsub = store.subscribe((state) => {
      finalToastCount = state.toasts.length;
    });

    // Add 10 toasts
    for (let i = 0; i < 10; i++) {
       toast(`Msg ${i}`);
    }

    // Limit is hardcoded to 5 inside `store.ts`
    expect(finalToastCount).toBe(5);
    unsub();
  });

  test("auto-dismisses a toast after the duration", async () => {
    let currentToasts = 0;
    const unsub = store.subscribe((state) => {
      currentToasts = state.toasts.length;
    });

    toast("Temporary", { duration: 100 }); // Fast for tests
    expect(currentToasts).toBe(1);

    // Fast-forward
    await Bun.sleep(600); // 100 duration + 400 fade out

    expect(currentToasts).toBe(0);
    unsub();
  });

  test("programmatically dismisses a specific toast", async () => {
    let stateRef = { toasts: [] as any[] };
    const unsub = store.subscribe((state) => {
      stateRef = state;
    });

    const id1 = toast("First");
    const id2 = toast("Second");
    
    expect(stateRef.toasts.length).toBe(2);

    toast.dismiss(id1);

    const firstToast = stateRef.toasts.find(t => t.id === id1);
    expect(firstToast?.visible).toBe(false);

    // Wait for animation cleanup (400ms)
    await Bun.sleep(500);

    // Completely removed
    expect(stateRef.toasts.length).toBe(1);
    expect(stateRef.toasts[0].id).toBe(id2);

    unsub();
  });

  test("correctly parses different toast variants", () => {
    let stateRef = { toasts: [] as any[] };
    const unsub = store.subscribe((state) => {
      stateRef = state;
    });

    toast.success("Done");
    toast.error("Fail");
    
    expect(stateRef.toasts[0].type).toBe("error"); // LIFO queue, error is newer
    expect(stateRef.toasts[1].type).toBe("success");
    
    unsub();
  });
});
