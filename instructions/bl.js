import { Instruction, ArgumentType } from "@inst/instruction";
import { addFrame, store, updateRegister } from "@util/reduxUtils";

class BLInstruction extends Instruction {
    static mnemonic = 'bl';
    static syntax = [ArgumentType.Immediate];
    static restrictions = [11];

    constructor(imm11) {
        super(0b10010100000);
        this.rt = 0b11110;
        this.imm11 = imm11;
        this.encodeInstruction();
        this.setControlSignals(0, 0, 0b01, 0, 1, 0, 0, 0, 0, 1, 1);
    }

    if() {
        return {
            aluImm: this.imm11,
            readReg2: this.rt
        };
    }

    id() {
        this.opn = store.getState().registers[this.rt];

        return {
            readData2: this.opn
        };
    }
    
    ex(program) {
        return {
            aluAction: 0b0111,
            aluResult: this.opn,
            branchPC: Number(this.imm11) + program.currentInstruction * 4
        };
    }

    mem() {
        store.dispatch(addFrame(store.getState().registers[28] - 1n));

        return {};
    }

    wb() {
        store.dispatch(updateRegister(this.rt, BigInt(this.nextPC)));

        return {
            writeData: this.nextPC
        };
    }
}

export default BLInstruction;