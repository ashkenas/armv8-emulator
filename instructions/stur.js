import { Instruction, ArgumentType } from "@inst/instruction";
import { writeBytes } from "@util/memoryUtils";
import { store } from "@util/reduxUtils";

class STURInstruction extends Instruction {
    static mnemonic = 'str';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];
    
    constructor(rt, rn, imm11) {
        super(0b11111000000);
        this.rt = rt;
        this.rn = rn;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 1, 0b00, 0, 0, 0, 1, 0, 0, 0, 0);
    }

    if(simulator) {
        return {
            readReg1: this.rn,
            readReg2: this.rt,
            aluImm: this.imm11
        };
    }

    id(simulator) {
        this.opn = store.getState().registers[this.rn];
        this.data = store.getState().registers[this.rt];

        return {
            readData1: this.opn,
            readData2: this.data
        };
    }

    ex(simulator) {
        this.result = this.opn + this.imm11;
        
        return {
            aluAction: 0b0010,
            aluResult: this.result
        };
    }

    mem(simulator) {
        writeBytes(Number(this.result), this.data, 8);

        return {};
    }
}

export default STURInstruction;