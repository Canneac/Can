/**
 * localStorage üzerinde, React useSyncExternalStore ile uyumlu küçük kalıcı depo.
 * Sunucuda ve ilk hidrasyonda boş değer döner; tarayıcıda kayıtlı değer okunur.
 */
export function createLocalStore<T>(key: string, empty: T) {
  let cache: T = empty;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : empty;
    } catch {
      cache = empty;
    }
    loaded = true;
  };
  const emit = () => listeners.forEach((listener) => listener());

  if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      if (event.key === key) {
        load();
        emit();
      }
    });
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot(): T {
      if (!loaded) load();
      return cache;
    },
    getServerSnapshot(): T {
      return empty;
    },
    set(next: T) {
      cache = next;
      loaded = true;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Depolama kapalıysa sepet yalnızca bu oturumda bellekte kalır.
      }
      emit();
    },
  };
}
