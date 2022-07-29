import { Instruction } from "@inst/instruction";
import { removeFrame, store } from "@util/reduxUtils";

class RETInstruction extends Instruction {
    static mnemonic = 'ret';
    static syntax = [];
    static restrictions = [];

    constructor() {
        super(0b11010110010);
        this.rt = 0b11110;
        this.encodeInstruction();
        this.setControlSignals(0, 0, 0b01, 0, 0, 1, 0, 0, 0, 0, 0);
    }

    if(simulator) {
        return {
            readReg2: this.rt
        };
    }

    id(simulator) {
        this.opn = store.getState().registers[this.rt];

        return {
            readData2: this.opn
        };
    }
    
    ex(simulator) {
        this.aluResult = this.opn;

        return {
            aluAction: 0b0111,
            aluResult: this.opn
        };
    }

    mem(simulator) {
        store.dispatch(removeFrame());

        return {};
    }
}

export default RETInstruction;