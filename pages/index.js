import Simulator from "@arch/simulator";
import ErrorBoundary from "@components/errorBoundary";

export default function Home() {
    return (
        <ErrorBoundary title={"Runtime Error"}>
            <Simulator />
        </ErrorBoundary>
    );
}
