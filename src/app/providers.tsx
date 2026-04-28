"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { CurtainTransitionProvider } from "@/components/CurtainTransition";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <CurtainTransitionProvider>{children}</CurtainTransitionProvider>
    </QueryClientProvider>
  );
}
