import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { expandTo, setBytes } from "./byteArray";
import { nextMultiple } from "./formatUtils";
import { MAX_ADDRESS } from "./memoryUtils";

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
    lineNumber: null,
    bssStartAddress: 0n,
    bssEndAddress: 0n
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
            return { ...state, controlSignals: { ...state.controlSignals, ...newSignals }};
        case 'updateWires':
            return { ...state, wires: { ...state.wires, ...action.payload } };
        case 'updateRegister':
            if (action.payload.register === 31)
                return;

            const newValues = [...state.registers];
            newValues[action.payload.register] = action.payload.value;
            const newState = { ...state, registers: newValues };

            if (action.payload.register === 28)
                newState.stackData = expandTo(state.stackData, nextMultiple(MAX_ADDRESS - Number(action.payload.value) + 1, 8) + 8);

            return newState;
        case 'addFrame':
            return { ...state, frames: [...state.frames, action.payload] };
        case 'removeFrame':
            return { ...state, frames: state.frames.slice(0, -1) };
        case 'updateBytes':
            if (action.payload.address <= state.bssEndAddress) {
                const newTextData = [...state.textData];
                setBytes(newTextData, action.payload.address, action.payload.value, action.payload.size);
                return { ...state, textData: newTextData };
            } else {
                const newStackData = expandTo(state.stackData, nextMultiple(MAX_ADDRESS - action.payload.address + 1, 8) + 8);
                setBytes(newStackData, MAX_ADDRESS - action.payload.address, action.payload.value, -action.payload.size);
                return { ...state, stackData: newStackData };
            }
        default:
            return state;
    }
};

export const store = createStore(rootReducer, undefined, applyMiddleware(thunkMiddleware));

export function merge(payload) {
    return { type: 'merge', payload: payload };
};

export function updateControlSignals(controlSignals) {
    return { type: 'updateControlSignals', payload: controlSignals };
}

export function updateWires(wires) {
    return { type: 'updateWires', payload: wires };
}

export function updateRegister(register, value) {
    return { type: 'updateRegister', payload: { register: register, value: value } };
};

export function addFrame(address) {
    return { type: 'addFrame', payload: address };
};

export function removeFrame() {
    return { type: 'removeFrame' }
};

export function updateBytes(address, value, size) {
    return { type: 'updateBytes', payload: { address: address, value: value, size: size } };
};
