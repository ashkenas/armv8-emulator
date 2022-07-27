import MOVIInstruction from "./movi";

class NOPInstruction extends MOVIInstruction {
    static mnemonic = 'nop';
    static syntax = [];
    static restrictions = [];
    
    constructor() {
        super(31, 0);
    }
}

export default NOPInstruction;