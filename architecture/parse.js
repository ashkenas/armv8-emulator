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

                const decode = decodeParsedInstruction(instrType, instructionArray.slice(1));
                program.addInstruction(instrType, decode, i, line);
            } else if (section === "data") {
                if (line.includes(':'))
                    program.addLabel(line.split(':')[0]);
            
                let [, type, data] = (/(\.[a-z]*)\s*(.*)/i).exec(line);
                if (type === '.balign') {
                    program.alignInitializedData(+data);
                } else {
                    const valLength = getByteSizeofInitializer(type);
                    data = data.split(',').map((val) => twoC(BigInt(val.trim()), BigInt(valLength) * 8n));
                    const initLen = valLength * data.length;
                    program.addInitializedData(bigIntArrayToBigInt(data), initLen);  
                }
            } else if (section === "bss") {
                if (line.includes(':'))
                    program.addLabel(line.split(':')[0]);

                const [, type, count, size] = (/(\.[a-z]*)\s*(-?.*)\s*(?:,\s*(.*))?/i).exec(line);

                const pCount = +count;
                if (isNaN(pCount) || (!isNaN(pCount) && Math.floor(pCount) !== pCount))
                    throw 'Arguments to bss directives must be integers.';

                if (type === '.balign') {
                    program.alignUninitializedData(pCount);
                } else if (type === '.space' || type === '.skip' || type === '.zero') {
                    program.addUninitializedData(pCount);
                } else if (type === '.fill') {
                    if (size !== undefined) {
                        let pSize = +size;
                        if (isNaN(pSize) || (!isNaN(pSize) && Math.floor(pSize) !== pSize))
                            throw 'Arguments to bss directives must be integers.';

                        if (pSize > 8)
                            pSize = 8;

                        program.addUninitializedData(pCount * pSize);
                    } else {
                        program.addUninitializedData(pCount);
                    }
                } else {
                    throw 'Invalid bss directive.';
                }
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
 * @param {Instruction} instrType Instruction type class
 * @param {string[]} instrArgs Instruction arguments as strings
 * @returns {any[]} Decoded arguments
 */
function decodeParsedInstruction(instrType, instrArgs) {
    const args = [];
    for(let i = 0; i < instrArgs.length; i++) {
        const param = instrArgs[i];
        if (instrType.syntax[i] === ArgumentType.Register) {
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
                    const arg = +param.substring(1);
                    if (isNaN(arg))
                        throw `Argument ${i + 1} (${param}):\nInvalid register number '${arg}'.`;
                    else if (arg < 0 || arg > 31)
                        throw `Argument ${i + 1} (${param}):\nRegister number must be in range [0, 31].`
                    args.push(arg);
            }
        } else {
            if ((/^#?-?[0-9]+$/).test(param)) {
                const arg = param[0] === '#' ? +param.substring(1) : +param;
                if (isNaN(arg)) {
                    throw `Argument ${i + 1} (${param}):\nInvalid immediate '${arg}'.`;
                } else {
                    const bitLength = (instrType.restrictions[i] - 1);
                    if (bitLength === 0) {
                        if (arg !== 0)
                            throw `Argument ${i + 1} (${param}):\nImmediate for this instruction must be 0.`;
                    } else if (arg < -(2 ** bitLength) || arg > (2 ** bitLength) - 1) {
                        throw `Argument ${i + 1} (${param}):\nImmediate must be in range [-2^${bitLength}, 2^${bitLength} - 1].`
                    }
                }
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
        default:
            throw `Unknown data initializer '${init}'.`;
    }
}
