import { Instruction } from "@inst/instruction";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { expandTo, setBytes } from "./byteArray";
import { nextMultiple } from "./formatUtils";
import { MAX_ADDRESS } from "./memoryUtils";

const regMask = (1n << 64n) - 1n;

const demoProgram = `.text
.global _start
rec_add:
    sub X1, X0, X19
    cbz X1, rec_add_base //this comment sure will cause problems
    ldur X1, [X0, #0]
    add X0, X0, #8
    sub X28, X28, #16
    stur X1, [X28, #8]
    stur X30, [X28, #0]
    bl rec_add
    b rec_add_end
rec_add_base:
    mov X0, #0
    ret
rec_add_end:
    ldur X30, [X28, #0]
    ldur X1, [X28, #8]
    add X28, X28, #16
    add X0, X0, X1
    ret
_start:
    adr X0, array
    adr X19, end
    bl rec_add
    adr x1, out
    stur x0, [x1, #0]
    svc #0
.data
array:
    .dword 8, 4, 3
end:
    .dword 0
.bss
out:
    .space 8
.end`;

const initialState = {
    text: demoProgram,
    instructions: [],
    registers: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
    cpsr: 0n,
    lastRegister: -1,
    textData: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
    stackData: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
    frames: [],
    controlSignals: {...Instruction._controlSignalNames.reduce((signals, signal) => (signals[signal] = 0, signals), {})},
    newSignals: {},
    wires: {},
    newWires: [],
    encoding: [{
        type: '',
        value: 0,
        length: 32,
        tooltip: 'No instruction loaded'
    }],
    lineNumber: null,
    programSize: 0,
    bssStartAddress: 0,
    bssEndAddress: 0
};

const rootReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'merge':
            return { ...state, ...action.payload };
        case 'updateControlSignals':
            const newSignalNames = Object.keys(action.payload).filter((signal) => action.payload[signal] !== state.controlSignals[signal]);
            const newSignals = newSignalNames.reduce((controlSignals, signal) => {
                controlSignals[signal] = action.payload[signal];
                return controlSignals;
            }, {});
            return { ...state, controlSignals: { ...state.controlSignals, ...newSignals }, newSignals: newSignals };
        case 'updateWires':
            const newWireNames = Object.keys(action.payload).filter((wire) => action.payload[wire] !== state.wires[wire]);
            const newWires = newWireNames.reduce((wires, wire) => {
                wires[wire] = action.payload[wire];
                return wires;
            }, {});
            return { ...state, wires: { ...state.wires, ...newWires }, newWires: newWireNames };
        case 'updateRegister':
            if (action.payload.register === 31)
                return state;

            const newValues = [...state.registers];
            newValues[action.payload.register] = action.payload.value & regMask;
            const newState = { ...state, lastRegister: action.payload.register, registers: newValues };

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
        case 'updateText':
            return { ...state, text: action.payload };
        case 'updateStatus':
            return { ...state, cpsr: action.payload << 28n };
        case 'reset':
            return { ...initialState, text: state.text };
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
    return { type: 'removeFrame' };
};

export function updateBytes(address, value, size) {
    return { type: 'updateBytes', payload: { address: address, value: value, size: size } };
};

export function updateText(text) {
    return { type: 'updateText', payload: text };
}

export function updateStatus(cpsr) {
    return { type: 'updateStatus', payload: cpsr };
}

export function reset() {
    return { type: 'reset' };
}
