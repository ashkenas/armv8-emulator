import { ArgumentType } from "./instruction";
import ORRIInstruction from "./orri";

class MOVIInstruction extends ORRIInstruction {
    static mnemonic = 'mov';
    static syntax = [ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, null];

    constructor(rd, imm11) {
        super(rd, 31, imm11);
    }
}

export default MOVIInstruction;