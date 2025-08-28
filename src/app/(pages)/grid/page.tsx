
import Grid from "./Grid";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="w-full h-full">
        <Grid />
      </main>
    </ErrorBoundary>
  );
}
