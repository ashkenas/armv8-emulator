import { Instruction, ArgumentType } from "@inst/instruction";
import { signExtend, twoC } from "@util/formatUtils";
import { store, updateRegister, updateStatus } from "@util/reduxUtils";

class SUBISInstruction extends Instruction {
    static mnemonic = 'subs';
    static syntax = [ArgumentType.Register, ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null, 11];

    constructor(rd, rn, imm11) {
        super(0b11110001000);
        this.rd = rd;
        this.rn = rn;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(1, 1, 0b11, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if() {
        return {
            readReg1: this.rn,
            writeReg: this.rd,
            aluImm: this.imm11
        };
    }

    id() {
        this.opn = store.getState().registers[this.rn];

        return {
            readData1: this.opn
        };
    }

    ex() {
        this.result = twoC(this.opn - signExtend(this.imm11, 11n));
        store.dispatch(updateStatus(this.result === 0n ? 0b0100n : 0n));
        
        return {
            aluAction: 0b1011,
            aluResult: this.result
        };
    }

    wb() {
        store.dispatch(updateRegister(this.rd, this.result));

        return {
            writeData: this.result
        };
    }
}

export default SUBISInstruction;