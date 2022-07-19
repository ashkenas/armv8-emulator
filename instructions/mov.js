import { ArgumentType } from "./instruction";
import ORRInstruction from "./orr";

class MOVInstruction extends ORRInstruction {
    static mnemonic = 'mov';
    static syntax = [ArgumentType.Register, ArgumentType.Register];
    static restrictions = [null, null];

    constructor(rd, rm) {
        super(rd, rm, rm);
    }
}

export default MOVInstruction;