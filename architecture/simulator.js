import React, { useEffect, useState } from "react";
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
import { useSelector } from "react-redux";
import Parse from "./parse";

export default function Simulator(props) {
    const text = useSelector((state) => state.text);
    const [error, setError] = useState(false);

    let program = null;

    useEffect(() => {
        try {
            const p = new Parse(text);
            program = p.program;
            setError(false);
        } catch (e) {
            setError(e);
        }

        if (!program)
            return;

        initializeMemory(program);
        store.dispatch(updateRegister(28, BigInt(MAX_ADDRESS + 1)));
        store.dispatch(updateRegister(29, BigInt(MAX_ADDRESS + 1)));
        store.dispatch(merge({
            instructions: program.instructions.map((instruction) => instruction.lineText),
            encoding: program.instructions[program.currentInstruction].encodingParts,
            lineNumber: program.instructions[program.currentInstruction].lineNumber,
            lastRegister: -1
        }));
    }, [text]);

    return (
        <div className={styles.container}>
            <Head>
                <title>ARMv8 Emulator</title>
                <meta name="description" content="Emulates ARMv8 Programs" />
            </Head>

            <div className={styles.column}>
                <div className={`${styles.card} ${styles.expand}`}>
                    <Code error={error} />
                    {/* Demo buttons, will be removed later */}
                    <button className={styles.btest} onClick={() => { program?.tick(); }}>Next Cycle</button>
                    <button className={styles.btest} onClick={() => { program?.tick(); while(program.instructions[program.currentInstruction]?.cycle) program?.tick(); }}>Next Instruction</button>
                </div>

                <div className={styles.card}>
                    <h2>Encoding</h2>
                    <Encoding />
                </div>
            </div>

            <div className={styles.column}>
                <div className={styles.row}>
                    <div className={`${styles.card} ${styles.fix}`}>
                        <Registers />
                    </div>

                    <div className={styles.card}>
                        <ControlSignals />
                    </div>
                </div>

                <div className={`${styles.card} ${styles.expand}`}>
                    <Memory />
                </div>
            </div>

            <div className={`${styles.column} ${styles.expand}`}>
                <div className={styles.card}>
                    <Datapath />
                </div>
            </div>
        </div>
    );
};