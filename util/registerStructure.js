import MemoryStructure from "@util/memoryStructure";
import { nextMultiple } from "./formatUtils";

export default class RegisterStructure {
    constructor(simulator) {
        this.simulator = simulator;

        this.values = [];
        for (let i = 0; i < 32; i++)
            this.values.push(0n);
        this.values[28] = BigInt(MemoryStructure.MAX_ADDRESS + 1);
        this.values[29] = BigInt(MemoryStructure.MAX_ADDRESS + 1);

        this.simulator.setState({ registers: this.values });
    }

    setRegister(register, value) {
        if (register < 0 || register > 31)
            throw `Register X${register} does not exist!`;

        if (typeof value != 'bigint')
            throw 'Register values must be bigint.';

        if (register === 31)
            return;

        if (register === 28)
            this.simulator.memory.expandStack(nextMultiple(MemoryStructure.MAX_ADDRESS - Number(value) + 1, 8) + 8);

        this.values[register] = value;
        this.simulator.setState({ registers: this.values });
    }

    getRegister(register) {
        if (register < 0 || register > 31)
            throw `Register X${register} does not exist!`;

        return this.values[register];
    }
}