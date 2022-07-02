import React from "react";
import MemoryStructure from "../util/memoryStructure";
import RegisterStructure from "../util/registerStructure";
import Code from "../components/code";
import Encoding from "../components/encoding";
import Registers from "../components/registers";
import Memory from "../components/memory";
import Datapath from "../components/datapath";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Program from "./program";
import ADDIInstruction from "../instructions/addi";
import ADDInstruction from "../instructions/add";
import SUBInstruction from "../instructions/sub";
import ADRInstruction from "../instructions/adr";
import CBZInstruction from "../instructions/cbz";
import BInstruction from "../instructions/b";
import LDURInstruction from "../instructions/ldur";
import NOPInstruction from "../instructions/nop";
import { bigIntArrayToBigInt } from "../util/formatUtils";

export default class Simulator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            registers: [],
            memory: null
        }

        this.registers = new RegisterStructure(this);
    }
    // Temporary demo code, function will be removed later
    componentDidMount() {
        const p = new Program();
        p.addInstruction(ADDIInstruction, [0, 31, 0n]);
        p.addInstruction(ADRInstruction, [1, 'array']);
        p.addInstruction(ADDIInstruction, [2, 31, 0n]);
        p.addInstruction(ADRInstruction, [3, 'length']);
        p.addInstruction(LDURInstruction, [3, 3, 0n]);
        p.addLabel('loop');
        p.addInstruction(SUBInstruction, [5, 3, 0]);
        p.addInstruction(CBZInstruction, [5, 'loop_end']);
        p.addInstruction(LDURInstruction, [6, 1, 0n]);
        p.addInstruction(ADDInstruction, [2, 2, 6]);
        p.addInstruction(ADDIInstruction, [0, 0, 1n]);
        p.addInstruction(ADDIInstruction, [1, 1, 8n]);
        p.addInstruction(BInstruction, ['loop']);
        p.addLabel('loop_end');
        p.addInstruction(NOPInstruction, []);
        p.addInitializedData('array', bigIntArrayToBigInt([7n, 5n, 4n, 8n, 2n, 9n, 1n, 3n, 10n, 6n]), 8 * 10);
        p.addInitializedData('length', 10n, 8);
        p.runSubstitutions();
        this.load(p);
    }

    load(program) {
        this.program = program;
        this.memory = new MemoryStructure(program, this);
        this.registers = new RegisterStructure(this);
    }

    tick() {
        if (!this.program)
            throw 'No program loaded!';

        if (this.program.tick(this))
            this.program = null;
    }

    render() {
        return (
            <div className={styles.container}>
                <Head>
                    <title>ARMv8 Emulator</title>
                    <meta name="description" content="Emulates ARMv8 Programs" />
                </Head>

                <div className={styles.column}>
                    <div className={`${styles.card} ${styles.expand}`}>
                        <h2>Code</h2>
                        <Code />
                        <button className={styles.btest} onClick={() => { for(let i = 0; i < 5; i++)this.program?.tick(this); }}>Next Cycle</button>
                    </div>

                    <div className={styles.card}>
                        <h2>Encoding</h2>
                        <Encoding
                            parts={[
                                ["opcode", 0b10010001000, 11, "Op-code"],
                                ["immediate", 4, 11, "Immediate"],
                                ["register", 31, 5, "Rd"],
                                ["register", 1, 5, "Rn"]
                            ]}
                        />
                    </div>
                </div>

                <div className={styles.column}>
                    <div className={styles.card}>
                        <h2>Registers</h2>
                        <Registers values={this.state.registers} />
                    </div>

                    <div className={styles.card}>
                        <h2>Control Signals</h2>
                    </div>

                    <div className={`${styles.card} ${styles.expand}`}>
                        <h2>Memory</h2>
                        <Memory memory={this.state.memory} />
                    </div>
                </div>

                <div className={styles.column} style={{ flexGrow: 2 }}>
                    <div className={styles.card}>
                        <h2>Datapath</h2>
                        <Datapath />
                    </div>
                </div>
            </div>
        );
    }
};