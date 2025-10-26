import { Suspense } from "react";
import ResultsClient from "./ResultsClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading…</div>
        </div>
      }
    >
      <ResultsClient />
    </Suspense>
  );
}
