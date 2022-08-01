import { Instruction, ArgumentType } from "@inst/instruction";
import { store, updateRegister } from "@util/reduxUtils";

class ADRInstruction extends Instruction {
    static mnemonic = 'adr';
    static syntax = [ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, 11];

    constructor(rt, imm11) {
        super(0b00010000000);
        this.rt = rt;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 1, 0b01, 0, 0, 0, 0, 0, 0, 0, 1);
    }

    if() {
        return {
            aluImm: this.imm11,
            readReg2: this.rt
        };
    }
    
    ex() {
        return {
            aluAction: 0b0111,
            aluResult: this.imm11
        };
    }

    wb(program) {
        store.dispatch(updateRegister(this.rt, this.imm11 + BigInt(program.currentInstruction * 4)));

        return {
            writeData: this.imm11 + BigInt(program.currentInstruction * 4)
        };
    }
}

export default ADRInstruction;