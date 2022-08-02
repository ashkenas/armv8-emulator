import Program from "@arch/program";
import { ArgumentType } from "@inst/instruction";
import InstructionRegistry from "@inst/instructionRegistry";
import { bigIntArrayToBigInt, twoC } from "@util/formatUtils";

export default class Parse {
    constructor(text) {
        this.text = this.processText(text);
        this.program = new Program();
        this.processProgram();
        this.program.runSubstitutions();
    }
    /* prepare program for parsing by removing emply lines, white space, and doule spaces ADD make sure lable and declaraction on same line in data and bss
    Example:
    "_start:


   adr x1, x

  adr x2, y
    ldr x3,  N
    mov    x8, #0

    mov x9,#0" 
    -------->
    "_start:
    adr x1, x
    adr x2, y
    ldr x3, N
    mov x8, #0
    mov x9, #0"
    */
    processText(text) {
        text = text.trim();
        text = text.replaceAll(/(?:\/\/.*$)|[\r]/gm, '');
        const progArr = text.split(/\n/);
        for(let i=0; i < progArr.length; i++){
            progArr[i] = progArr[i].trim().replace(/\s+/g,' ');
        }
        return progArr.join('\n');
    }

    /**
     * Loops over program array, adds lables to lable dict, parses .data and .bss
     */
    processProgram(){
        const program_array = this.text.split(/\n/);
        const program_len = program_array.length;

        let dataFlag = 0;
        let bssFlag = 0;        

        for (let i = 0; i < program_len; i++) {
            let line = program_array[i];
            if (!line)
                continue;

            let line_len = line.length;

            try {
                if (!line.includes('.') && !line.includes(':')) {
                    let instr_arr = this.parseInstruction(line);
                    const instrType = this.matchParsedInstruction(instr_arr);
                    if (instrType === undefined)
                        throw `Invalid instruction type: ${instr_arr[0]} ${instr_arr.slice(1).map(this.getArgumentType).map(ArgumentType.toString).join(', ')}`;
                    let decode = this.decodeParsedInstruction(instr_arr);
                    this.program.addInstruction(instrType, decode, i, line);
                }
                else if (line[0] !== '.' && line[line_len-1] === ':') {
                    this.program.addLabel(line.substring(0, line_len - 1));
                }
                else if (line === ".text") {
                    dataFlag = 0;
                    bssFlag = 0;
                }
                else if (line === ".data") {
                    dataFlag = 1;
                    bssFlag = 0;
                }
                else if (line === ".bss") {
                    bssFlag = 1;
                    dataFlag = 0;
                }
                else if (line === ".end") {
                    break;
                }
                else if (line.startsWith(".global")) {
                    this.program.startLabel = line.split(' ')[1];
                }
                else if (dataFlag === 1) {
                    this.parseLineofData(line);
                }
                else if (bssFlag === 1) {
                    this.parseLineofBss(line);
                }
                else {
                    throw `Unknown syntax/command.`;
                }
            } catch (e) {
                throw `Line ${i + 1}: ${line}\n\n${e}`;
            }
        }
    }

    /**
     * adds data to program
     * x: .double 5, 6, 7
     * @param {string} data_line
     */
    parseLineofData(data_line) {
        if(data_line.includes(':'))
            this.program.addLabel(data_line.split(':')[0]);

        let [fm, type, data] = (/(\.[a-z]*)\s*(.*)/i).exec(data_line);
        const valLength = this.getByteSizeofInitializer(type);
        data = data.split(',').map((val) => twoC(BigInt(val.trim()), BigInt(valLength) * 8n));
        const initLen = valLength * data.length;  // ".double"
        this.program.addInitializedData(bigIntArrayToBigInt(data), initLen);   
    }

    /**
     * adds bss data to program
     * y: .dword 4
     * @param {string} bss_line 
     */
    parseLineofBss(bss_line){
        if(bss_line.includes(':'))
            this.program.addLabel(bss_line.split(':')[0]);

        let [fm, type, size] = (/(\.[a-z]*)\s*(-?[0-9]*)/i).exec(bss_line);
        let initLen = this.getByteSizeofInitializer(type) * (size && !isNaN(+size) ? +size : 1);  // ".double"
        this.program.addUninitializedData(initLen);
    }

    /**
     * Converts a string of an instruction include an array
     * of its parts.
     * @param {string} line Instruction as a string
     * @returns {string[]} Instruction as array of [mnemonic, ...args]
     */
    parseInstruction(line){
        let [fm, mnemonic, argString] = (/([a-z]*)\s*(.*)/i).exec(line.replaceAll(/[\[\]]/g, ''));
        mnemonic = mnemonic.toLowerCase();

        if(argString) {
            let args = argString.split(',').map((arg) => arg.trim());
            return [mnemonic, ...args];
        } else { // No arguments found
            return [mnemonic];
        }
    }

    /** 
     * Takes instruction array. Returns the appropriate constructor
     * for that instruction.
     * @param {string[]} instr Instruction array [type, ...args]
     * @returns Instruction
     */
    matchParsedInstruction(instr){
        let mnemonic = (instr[0].trim()).toLowerCase();
        let argtypes = [];

        for(let a = 1; a < instr.length; a++){
            argtypes.push(this.getArgumentType(instr[a]));
        }

        return InstructionRegistry.match(mnemonic, argtypes);
    }

    /**
     * Gets the type of an argument from its string value.
     * @param {string} arg Argument as a string
     * @returns {ArgumentType} Type of the argument
     */
    getArgumentType(arg){
        if ((/^(?:x[0-9]+|sp|fp|lr|xzr)$/i).test(arg))
            return ArgumentType.Register;

        return ArgumentType.Immediate;
    }

    /**
     * Decode arguments into numeric forms where possible.
     * @param {string[]} instr Instruction array [type, ...args]
     * @returns {any[]} Decoded arguments
     */
    decodeParsedInstruction(instr){
        let args = [];
        for(let i = 1; i < instr.length; i++) {
            let param = instr[i];
            switch(param.toLowerCase()) {
                case "xzr":
                    args.push(31);
                    break;
                case "lr":
                    args.push(30);
                    break;
                case "fp":
                    args.push(29);
                    break;
                case "sp":
                    args.push(28);
                    break;
                default:
                    if (param[0].toLowerCase() === 'x') {
                        let arg = +param.substring(1);
                        if (isNaN(arg))
                            throw `Argument ${i} (${param}):\nInvalid register number '${arg}'.`;
                        else if (arg < 0 || arg > 31)
                            throw `Argument ${i} (${param}):\nRegister number must be in range [0, 31].`
                        args.push(arg);
                    } else if (param[0] === '#') {
                        let arg = +param.substring(1);
                        if (isNaN(arg))
                            throw `Argument ${i} (${param}):\nInvalid immediate '${arg}'.`;
                        else if (arg < -(2 ** 10) || arg > (2 ** 10) - 1)
                            throw `Argument ${i} (${param}):\nImmediate must be in range [-2^10, 2^10 - 1].`
                        args.push(twoC(BigInt(arg), 11n));
                    } else {
                        args.push(param)
                    }
            }
        }
        return args;
    }

    getByteSizeofInitializer(init) {
        switch(init) {
            case ".word":
            case ".int":
            case ".float":
                return 4;
            case ".dword":
            case ".double":
                return 8;
            case ".char":
            case ".byte":
            case ".space":
                return 1;
        }
    }
}