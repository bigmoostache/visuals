
import Plan from "./Plan";
import { PlanProvider } from '@/app/(pages)/plan/context/PlanContext';

export default function Home() {

    return (
        <PlanProvider>
            <main className="w-full h-full">
                <Plan />
            </main>
        </PlanProvider>
    );
}

