import Program from "@arch/program";
import { ArgumentType } from "@inst/instruction";
import InstructionRegistry from "@inst/instructionRegistry";
import { bigIntArrayToBigInt } from "@util/formatUtils";

export default class Parse {
    constructor(text){
        this.text = text;
        this.program = new Program();
        // .text
        this.numInstrs = 0;
        this.numLables = 0;
        this.lableAddrs = {};
        this.lableLineNum = {};
        // .data
        this.dataSize = 0;
        this.dataIndex = -1;
        this.dataAddrs = {};
        this.data_vars = [];
        // .bss
        this.bssSize = 0;
        this.bssIndex = -1;
        this.bssAddrs = {};
        this.bss_vars = [];     
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
    processText(){
        // this.text = this.text.replace(/\n{2,}/g, '\n');   //delete all free lines
        this.text = this.text.trim();
        this.text = this.text.replaceAll(/(?:\/\/.*$)|[\r]/gm, '');
        var progArr = this.text.split(/\n/);
        for(let i=0; i < progArr.length; i++){
            progArr[i] = progArr[i].trim().replace(/\s+/g,' ');
        }
        this.text = progArr.join('\n');
    }
    /**
     * Loops over program array, adds lables to lable dict, parses .data and .bss
     */
    processProgram(){
        this.program_array = this.text.split(/\n/); 
        console.log(this.program_array);
        this.program_len = this.program_array.length;

        let dataFlag = 0;
        let bssFlag = 0;        

        for (let i = 0; i < this.program_len; i++) {
            this.program_array[i] = this.program_array[i].trim(); // delete leading white space of each line
            let line = this.program_array[i];
            let line_len = this.program_array[i].length
            if (!line){continue;}  // this might mess up line number for addLable
            
            if(!line.includes('.') && !line.includes(':') ){
                let instr_arr = this.parseInstruction(line);
                const instrType = this.matchParsedInstruction(instr_arr);
                let decode = this.decodeParsedInstruction(instr_arr);
                this.program.addInstruction(instrType, decode, i, line);
            }
            else if (line[0] !== '.' && line[line_len-1] === ':'){
                this.program.addLabel(line.substring(0, line_len - 1));
            }
            else if (this.program_array[i] === ".data"){  // does .data always come before .bss
                this.dataIndex = i;
                dataFlag = 1;
                bssFlag = 0;
            }
            else if (this.program_array[i] === ".bss"){
                this.bssIndex = i;
                bssFlag = 1;
                dataFlag = 0;
            }
            else if (line.startsWith(".global")) {
                this.program.startLabel = line.split(' ')[1];
            }
            else if (dataFlag === 1){
                this.parseLineofData(line);
            }
            else if (bssFlag === 1){
                this.parseLineofBss(line);
            }
            else{
                console.log(`Ignoring line: ${line}`);
            }
        }
    }

    /**
    * @param {string} data_line
    * adds data to program
    * x: .double 5, 6, 7
    **/
    parseLineofData(data_line) {
        let temp = data_line.split(":");    // ["x", " .double 5, 6, 7"]
        let var_name = temp[0].trim();      // "x"
        let [fm, type, data] = (/(\.[a-z]*)\s*(.*)/i).exec(data_line);
        data = data.split(',').map((val) => BigInt(val.trim()));
        let initLen = this.getByteSizeofInitializer(type) * data.length;  // ".double"
        this.program.addInitializedData(var_name, bigIntArrayToBigInt(data), initLen);   
    }
    /**
     * @param {string} bss_line 
     * adds bss data to program
     * y: .dword 4
     */
    parseLineofBss(bss_line){        
        let temp = bss_line.split(":");
        let var_name = temp[0].trim();
        let info = temp[1].trim();
        info = info.split(" ");
        let initLen = this.getByteSizeofInitializer(info[0].trim());
        let num_args = 0;
        try{
            num_args = +info[1].trim();
        }
        catch{
            num_args = 1;
        }
        let byteLen = num_args * initLen;
        this.program.addUninitializedData(var_name, byteLen);
    }

    /* Takes an instr and returns an array [mnemonic, arg1, ..., argN]
    Exampels:
        ADD X1, X2, X3 --> ["add", "X1", "X2", "X3"]
        SUB X1, X2, #4 --> ["sub", "X1", "X2", "#4"]
        CMP X1, X2     --> ["cmp", "X1", "X2"]
        B lable        --> ["b", "lable"]    
    */
    parseInstruction(instr_line){
        let [fm, mnemonic, arg_string] = (/([a-z]*)\s*(.*)/i).exec(instr_line.replaceAll(/[\[\]]/g, ''));
        mnemonic = mnemonic.toLowerCase();
        if(arg_string) {
            let args = arg_string.split(',').map((arg) => arg.trim());
            return [mnemonic, ...args];
        } else {
            return [mnemonic];
        }
        let first_arg = instr_info[1];

        res.push(mnemonic);
        res.push(first_arg);

        let second_arg = null;
        let third_arg = null;
        // we know there will be AT LEAST TWO, not sure about others
        try {
            second_arg = instr_info[2];
            res.push(second_arg);
            try{
                third_arg = instr_info[3];
                res.push(third_arg);
            }
            catch{
                third_arg = null;                
            }
        }
        catch{
            second_arg = null;
        }
        return res;
    }

    /**
     * 
     * @param {[string]} instr 
     * @returns Instruction
     * Takes instruciton array. Returns the instruction type using the InstructionRegistry.match
     */
    matchParsedInstruction(instr){
        let mnemonic = (instr[0].trim()).toLowerCase();
        let argtypes = [];
        for(let a=1; a < instr.length; a++){
            argtypes.push(this.getArgumentType(instr[a]));
        }
        const instrType = InstructionRegistry.match(mnemonic, argtypes);
        return instrType;
    }

    /* Return if an arg is a register or an immediate */
    getArgumentType(arg){
        if (arg.length >= 2 && arg.length <= 3 && arg[0].toUpperCase() === 'X'){
            let reg_num = arg.substring(1);
            if ((+reg_num >= 0 && +reg_num <= 31) || reg_num === "ZR"){
                return ArgumentType.Register;
            }
            // check if it is a lable
            throw `ArgType error: ${reg_num}`; // do like a class attribute for this
        }
        else {
            return ArgumentType.Immediate; // check if it even exists in lables
        }
    }

    /**
     * 
     * @param {string[]} instr -- ["add", "XZR", "X2"] with at least two
     * @param {number} instrLineNum 
     * @returns {number}
     */
    decodeParsedInstruction(instr, instrLineNum){
        let decode = [];
        instr.shift();
        for(let i=0; i < instr.length; i++){
            let param = instr[i];   
            if(param.toLowerCase() === "xzr"){
                decode.push(0);
            }
            else if(param[0].toLowerCase() === 'x' || param[0] === '#'){
                let int = +param.substring(1);
                if(isNaN(int)){
                    throw "Error: decodeParsedInstruction incorrect register or number";
                }
                decode.push(param[0] === '#' ? BigInt(int) : int);
            }
            else{   //lable?
                // let lableLineNum = this.lableLineNum.param;
                // if (lableLineNum == NaN){
                //     throw "Error: decodeParsedInstruction lable not in dict";
                // }
                // let offset = (lableLineNum - instrLineNum) * 4;
                decode.push(param)
            }
        }
        return decode;
    }

    getByteSizeofInitializer(init){
        if(typeof init !== 'string'){
            throw "Error: inisializer is not a string";
        }
        switch(init) {
            case ".word":
            case ".int":
                return 4;
            case ".dword":
            case ".double":
                return 8;
            case ".char":
                return 1;
        }
    }

    parseProgram(){
        this.processText();
        this.processProgram();
        this.program.runSubstitutions();
    }

}