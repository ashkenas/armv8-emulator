import Program from "@arch/program";
import { ArgumentType } from "@inst/instruction";
import InstructionRegistry from "@inst/instructionRegistry";
import { bigIntArrayToBigInt, twoC } from "@util/formatUtils";

export default function Parse(text) {
    const lines = processText(text);
    const program = new Program();

    let section = "text";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line)
            continue;

        try {
            if (line === ".text" || line === ".data" || line === ".bss") {
                section = line.substring(1);
            } else if (line.startsWith(".global")) {
                program.startLabel = line.split(' ')[1];
            } else if (line === ".end") {
                break;
            } else if (line[line.length - 1] === ':') {
                program.addLabel(line.substring(0, line.length - 1));
            } else if (section === "text") {
                const instructionArray = parseInstruction(line);
                const instrType = matchParsedInstruction(instructionArray);

                if (instrType === undefined)
                    throw `Invalid instruction type: ${instructionArray[0]} ${instructionArray.slice(1).map(getArgumentType).map(ArgumentType.toString).join(', ')}`;

                const decode = decodeParsedInstruction(instructionArray);
                program.addInstruction(instrType, decode, i, line);
            } else if (section === "data") {
                if (line.includes(':'))
                    program.addLabel(line.split(':')[0]);
            
                let [, type, data] = (/(\.[a-z]*)\s*(.*)/i).exec(line);
                const valLength = getByteSizeofInitializer(type);
                data = data.split(',').map((val) => twoC(BigInt(val.trim()), BigInt(valLength) * 8n));
                const initLen = valLength * data.length;
                program.addInitializedData(bigIntArrayToBigInt(data), initLen);  
            } else if (section === "bss") {
                if (line.includes(':'))
                    program.addLabel(line.split(':')[0]);
            
                const [, type, size] = (/(\.[a-z]*)\s*(-?[0-9]*)/i).exec(line);
                const initLen = getByteSizeofInitializer(type) * (size && !isNaN(+size) ? +size : 1);
                program.addUninitializedData(initLen);
            } else {
                throw `Unknown syntax/command.`;
            }
        } catch (e) {
            throw `Line ${i + 1}: ${line}\n\n${e}`;
        }
    }
    
    program.runSubstitutions();
    return program;
};

function processText(text) {
    text = text.trim();
    text = text.replaceAll(/(?:\/\/.*$)|[\r]/gm, '');

    const lines = text.split(/\n/);
    for(let i = 0; i < lines.length; i++){
        lines[i] = lines[i].trim().replace(/\s+/g,' ');
    }

    return lines;
}

/**
 * Converts a string of an instruction include an array
 * of its parts.
 * @param {string} line Instruction as a string
 * @returns {string[]} Instruction as array of [mnemonic, ...args]
 */
function parseInstruction(line) {
    const [, mnemonic, argString] = (/([a-z]*)\s*(.*)/i).exec(line.replaceAll(/[\[\]]/g, ''));

    if (argString) {
        return [mnemonic.toLowerCase(), ...argString.split(',').map((arg) => arg.trim())];
    } else { // No arguments found
        return [mnemonic.toLowerCase()];
    }
}

/** 
 * Takes instruction array. Returns the appropriate constructor
 * for that instruction.
 * @param {string[]} instr Instruction array [type, ...args]
 * @returns Instruction
 */
function matchParsedInstruction(instr){
    let mnemonic = (instr[0].trim()).toLowerCase();
    let argtypes = [];

    for(let a = 1; a < instr.length; a++){
        argtypes.push(getArgumentType(instr[a]));
    }

    return InstructionRegistry.match(mnemonic, argtypes);
}

/**
 * Gets the type of an argument from its string value.
 * @param {string} arg Argument as a string
 * @returns {ArgumentType} Type of the argument
 */
function getArgumentType(arg){
    if ((/^(?:x[0-9]+|sp|fp|lr|xzr)$/i).test(arg))
        return ArgumentType.Register;

    return ArgumentType.Immediate;
}

/**
 * Decode arguments into numeric forms where possible.
 * @param {string[]} instr Instruction array [type, ...args]
 * @returns {any[]} Decoded arguments
 */
function decodeParsedInstruction(instr){
    const args = [];
    for(let i = 1; i < instr.length; i++) {
        const param = instr[i];
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
                    const arg = +param.substring(1);
                    if (isNaN(arg))
                        throw `Argument ${i} (${param}):\nInvalid register number '${arg}'.`;
                    else if (arg < 0 || arg > 31)
                        throw `Argument ${i} (${param}):\nRegister number must be in range [0, 31].`
                    args.push(arg);
                } else if (param[0] === '#') {
                    const arg = +param.substring(1);
                    if (isNaN(arg))
                        throw `Argument ${i} (${param}):\nInvalid immediate '${arg}'.`;
                    else if (arg < -(2 ** 10) || arg > (2 ** 10) - 1)
                        throw `Argument ${i} (${param}):\nImmediate must be in range [-2^10, 2^10 - 1].`
                    args.push(twoC(BigInt(arg), 11n));
                } else {
                    args.push(param);
                }
        }
    }
    return args;
}

function getByteSizeofInitializer(init) {
    switch(init) {
        case ".word":
        case ".int":
        case ".float":
            return 4;
        case ".dword":
        case ".double":
        case ".quad":
            return 8;
        case ".char":
        case ".byte":
        case ".space":
            return 1;
    }
}
