import Code from '../components/code.js'
import Encoding from '../components/encoding.js'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>ARMv8 Emulator</title>
                <meta name="description" content="Emulates ARMv8 Programs" />
            </Head>

            <div className={styles.column}>
                <div className={styles.card}>
                    <h2>Code</h2>
                    <Code />
                </div>
            </div>

            <div className={styles.column}>
                <div className={styles.card}>
                    <h2>Registers</h2>
                </div>

                <div className={styles.card}>
                    <h2>Control Signals</h2>
                </div>

                <div className={`${styles.card} ${styles.expand}`}>
                    <h2>Memory</h2>
                    {/* Memory component here */}
                </div>

                <div className={styles.card}>
                    <h2>Encoding</h2>
                    <Encoding parts={[['none', 1, 1], ['opcode', 0b001000, 6], ['none', 0b100, 3], ['immediate', 4, 12], ['register', 31, 5], ['register', 1, 5]]} />
                </div>
            </div>

            <div className={styles.column} style={{flexGrow: 2}}>
                {/* Data path component here */}
            </div>
        </div>
    )
}
