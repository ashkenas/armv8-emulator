import Simulator from "@arch/simulator";
import { store } from "@util/reduxUtils";
import { Provider } from "react-redux";

export default function Home() {
    return (
        <Provider store={store}>
            <Simulator />
        </Provider>
    );
}
