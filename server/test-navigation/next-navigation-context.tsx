import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type TestNavigationState = {
  pathname: string;
  search: string;
  params: Record<string, string | string[] | undefined>;
};

type TestNavigationContextValue = TestNavigationState & {
  searchParams: URLSearchParams;
  router: {
    push: (href: string) => void;
    replace: (href: string) => void;
    refresh: () => void;
    back: () => void;
    forward: () => void;
    prefetch: (href: string) => Promise<void>;
  };
};

const TestNavigationContext = createContext<TestNavigationContextValue>({
  pathname: "/",
  search: "",
  params: {},
  searchParams: new URLSearchParams(),
  router: {
    push: () => undefined,
    replace: () => undefined,
    refresh: () => undefined,
    back: () => undefined,
    forward: () => undefined,
    prefetch: async () => undefined,
  },
});

export function TestNextNavigationProvider({
  state,
  children,
}: {
  state: TestNavigationState;
  children: ReactNode;
}) {
  const value = useMemo<TestNavigationContextValue>(() => {
    const search = state.search.replace(/^\?/, "");
    return {
      ...state,
      search,
      searchParams: new URLSearchParams(search),
      router: {
        push: () => undefined,
        replace: () => undefined,
        refresh: () => undefined,
        back: () => undefined,
        forward: () => undefined,
        prefetch: async () => undefined,
      },
    };
  }, [state.pathname, state.search, state.params]);

  return (
    <TestNavigationContext.Provider value={value}>
      {children}
    </TestNavigationContext.Provider>
  );
}

export function useTestNextNavigation() {
  return useContext(TestNavigationContext);
}
