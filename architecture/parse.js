import Program from "./program";
import { Instruction, ArgumentType } from "./instruction";

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
        this.text = this.text.replace(/\n{2,}/g, '\n');   //delete all free lines
        this.text = this.text.trim();
        this.text = this.text.replaceAll(',', ', ');
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
        var program_array = this.text.split(/\n/); 
        var program_len = program_array.length;

        let dataFlag = 0;
        let bssFlag = 0;        

        for (let i = 0; i < program_len; i++) {
            program_array[i] = program_array[i].trim(); // delete leading white space of each line
            let line = program_array[i];
            let line_len = program_array[i].length
            if (line == ""){continue;}  // this might mess up line number for addLable
            
            if(!line.includes('.') && !line.includes(':') ){
                this.numInstrs++;
            }
            else if (line[0] != '.' && line[line_len-1] == ':'){
                this.program.addLabel(line);
                this.lableLineNum[line] = i;
            }
            else if (program_array[i] == ".data"){  // does .data always come before .bss
                this.dataIndex = i;
                dataFlag = 1;
                bssFlag = 0;
            }
            else if (program_array[i] == ".bss"){
                this.bssIndex = i;
                bssFlag = 1;
                dataFlag = 0;
            }
            else if (dataFlag == 1){
                parsed_line = this.parseLineofData(line);
            }
            else if (bssFlag == 1){
                parsed_line = this.parseLineofBss(line);
            }
            else{
                console.log("Error: line does not match");
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
        let info_no_comma = temp[1].replaceAll(/,/g, '');   // [".double 5 6 7"]
        let info = (info_no_comma.trim()).split(" ");       // [".double", "5", "6", "7"]
        let initLen = this.getByteSizeofInitializer(info.shift());  // ".double"
        this.program.addInitializedData(var_name, info, initLen);   
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
            num_args = parseInt(info[1].trim());
        }
        catch{
            num_args = 1;
        }
        let byteLen = num_args * initLen;
        this.program.addUninitializedData(var_name, byteLen);
    }
    /**
     * Loops over program array and adds all instructions to the program
     */
    processInstructions(){
        for (let i = 0; i < program_len; i++) {
            program_array[i] = program_array[i].trim(); // delete leading white space of each line
            let line = program_array[i];
            if (line == ""){continue;}
            if(!line.includes('.') && !line.includes(':') ){
                let instr_arr = this.parseInstruction(line);
                const instrType = this.matchParsedInstruction(instr_arr);
                let decode = this.decodeParsedInstruction(instr_arr);
                this.program.addInstruction(instrType, decode);
            }
        }
    }
    /* Takes an instr and returns an array [mnemonic, arg1, ..., argN]
    Exampels:
        ADD X1, X2, X3 --> ["add", "X1", "X2", "X3"]
        SUB X1, X2, #4 --> ["sub", "X1", "X2", "#4"]
        CMP X1, X2     --> ["cmp", "X1", "X2"]
        B lable        --> ["b", "lable"]    
    */
    parseInstruction(instr_line){
        let res = [];

        let instr_info = instr_line.split(" "); // what if there are extra spaces inbetween 
        let mnemonic = instr_info[0].toLowerCase();
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
        return InstructionRegistry.match(mnemonic, argtypes);
    }

    /* Return if an arg is a register or an immediate */
    getArgumentType(arg){
        if (arg.length >= 2 && arg.length <= 3 && arg[0].toUpperCase() == 'X'){
            let reg_num = arg.slice(1, 3);
            if ((parseInt(reg_num) >= 1 && parseInt(reg_num) <= 32) || reg_num == "ZR"){
                return ArgumentType.Register;
            }
            // check if it is a lable
            return "Error"; // do like a class attribute for this
        }
        else {
            return ArgumentType.Immediate; // check if it even exists in lables
        }
    }

    /**
     * 
     * @param {[string]} instr -- ["add", "XZR", "X2"] with at least two
     * @param {int} instrLineNum 
     * @returns [int]
     */
    decodeParsedInstruction(instr, instrLineNum){
        let decode = [];
        instr.shift();
        for(let i=0; i < instr.length; i++){
            let param = instr[i];   
            if(param.toLowerCase() == "xzr"){
                decode.push(0);
            }
            else if(param[0].toLowerCase() == 'x' || param[0] == '#'){
                let int = parseInt(param.substring(1));
                if(int == NaN){
                    console.log("Error: decodeParsedInstruction incorrect register or number");
                    return;
                }
                decode.push(int);
            }
            else{   //lable?
                let lableLineNum = this.lableLineNum.param;
                if (lableLineNum == NaN){
                    console.log("Error: decodeParsedInstruction lable not in dict");
                }
                let offset = (lableLineNum - instrLineNum) * 4;
                decode.push(offset)
            }
        }
        return decode;
    }

    getByteSizeofInitializer(init){
        if(typeof init !== 'string'){
            return("Error: inisializer is not a string");
        }
        if(init == ".dword"){
            return 4;
        }
        if(init == ".char"){
            return 1;
        }
        if(init == ".int"){
            return 4;
        }
        if(init == ".double"){
            return 8;
        }
    }

    parseProgram(){
        this.processText();
        this.processProgram();
        this.processInstructions();
    }

}