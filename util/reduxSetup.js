import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";

const initialState = {
    instructions: [],
    registers: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
    textData: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
    stackData: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
    frames: [],
    controlSignals: {},
    wires: {},
    encoding: [{
        type: '',
        value: 0,
        length: 32,
        tooltip: 'No instruction loaded'
    }],
    lineNumber: null
};

const rootReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'merge':
            return { ...state, ...action.payload };
        case 'updateControlSignals':
            const newSignalNames = Object.keys(action.payload).filter((signal) => action.payload[signal] !== null);
            const newSignals = newSignalNames.reduce((controlSignals, signal) => {
                controlSignals[signal] = action.payload[signal];
                return controlSignals;
            }, {});
            return { ...state, controlSignals: { ...state.controlSignals, ...newSignals }}
        case 'updateWires':
            return { ...state, wires: { ...state.wires, ...action.payload } };
        case 'updateRegister':
            const newValues = [...state.registers];
            newValues[action.payload.register] = action.payload.value;
            return { ...state, registers: newValues };
        default:
            return state;
    }
};

export const store = createStore(rootReducer, undefined, applyMiddleware(thunkMiddleware));

export function merge(payload) {
    return { type: 'merge', payload: payload };
}
