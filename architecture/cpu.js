export default class CPU {
    constructor(registers) {
        this.registers = registers;
    }

    load(program) {
        this.program = program;
    }

    tick() {
        if (!this.program)
            throw 'No program loaded!';

        if (this.program.tick(this))
            this.program = null;
    }
};