import { Instruction, ArgumentType } from "@inst/instruction";
import { readBytes } from "@util/memoryUtils";
import { store, updateRegister } from "@util/reduxUtils";

class LDURInstruction extends Instruction {
    static mnemonic = 'ldur';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];
    
    constructor(rt, rn, imm11) {
        super(0b11111000010);
        this.rt = rt;
        this.rn = rn;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 1, 0b00, 0, 0, 0, 0, 1, 1, 0, 1);
    }

    if(simulator) {
        return {
            readReg1: this.rn,
            writeReg: this.rt,
            aluImm: this.imm11
        };
    }

    id(simulator) {
        this.opn = store.getState().registers[this.rn];

        return {
            readData1: this.opn
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
        this.memValue = readBytes(Number(this.result), 8);

        return {
            readDataM: this.memValue
        };
    }

    wb(simulator) {
        store.dispatch(updateRegister(this.rt, this.memValue));

        return {
            writeData: this.memValue
        };
    }
}

export default LDURInstruction;