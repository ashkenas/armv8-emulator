import React from "react";
import Head from "next/head";
import {
    Code,
    Encoding,
    Registers,
    Memory,
    Datapath,
    ControlSignals
} from "@components/index"
import styles from "@styles/Home.module.css";
import { merge, store, updateRegister } from "@util/reduxUtils";
import { initializeMemory, MAX_ADDRESS } from "@util/memoryUtils";

export default class Simulator extends React.Component {
    constructor(props) {
        super(props);
    }

    load(program) {
        this.program = program;
        initializeMemory(program);
        store.dispatch(updateRegister(28, BigInt(MAX_ADDRESS + 1)));
        store.dispatch(updateRegister(29, BigInt(MAX_ADDRESS + 1)));
        store.dispatch(merge({
            instructions: program.instructions.map((instruction) => instruction.lineText),
            encoding: program.instructions[program.currentInstruction].encodingParts,
            lineNumber: program.instructions[program.currentInstruction].lineNumber
        }));
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
                        <Code simulator={this} />
                        {/* Demo buttons, will be removed later */}
                        <button className={styles.btest} onClick={() => { this.program?.tick(this); }}>Next Cycle</button>
                        <button className={styles.btest} onClick={() => { for(let i = 0; i < 5; i++)this.program?.tick(this); }}>Next 5 Cycles</button>
                    </div>

                    <div className={styles.card}>
                        <h2>Encoding</h2>
                        <Encoding />
                    </div>
                </div>

                <div className={styles.column}>
                    <div className={styles.card}>
                        <h2>Registers</h2>
                        <Registers />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.card}>
                            <h2>Control Signals</h2>
                            <ControlSignals />
                        </div>

                        <div className={`${styles.card} ${styles.expand}`}>
                            <h2>Memory</h2>
                            <Memory />
                        </div>
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