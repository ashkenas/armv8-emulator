import Simulator from "@arch/simulator";
import ErrorBoundary from "@components/errorBoundary";
import { Provider} from "react-redux";
import { applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";

const store = createStore(() => {}, undefined, applyMiddleware(thunkMiddleware));

export default function Home() {
    return (
        <Provider store={store}>
            <ErrorBoundary title={"Runtime Error"}>
                <Simulator />
            </ErrorBoundary>
        </Provider>
    );
}
