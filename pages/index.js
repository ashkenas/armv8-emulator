import Simulator from "@arch/simulator";
import ErrorBoundary from "@components/errorBoundary";
import { store } from "@util/reduxSetup";
import { Provider } from "react-redux";

export default function Home() {
    return (
        <Provider store={store}>
            <ErrorBoundary title={"Runtime Error"}>
                <Simulator />
            </ErrorBoundary>
        </Provider>
    );
}
