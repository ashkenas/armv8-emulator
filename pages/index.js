import Code from "../components/code";
import Encoding from "../components/encoding";
import Registers from "../components/registers";
import Datapath from "../components/datapath";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
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
                    <Registers />
                </div>

                <div className={styles.card}>
                    <h2>Control Signals</h2>
                </div>

                <div className={`${styles.card} ${styles.expand}`}>
                    <h2>Memory</h2>
                    <Memory />
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
