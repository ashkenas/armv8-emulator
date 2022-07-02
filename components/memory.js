import React from 'react'

/**
 * React Component representing a virtual memory space for a process.
 */
class Memory extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (!this.program)
            return <></>;

        // Count hex digits in max address
        let digits = -1;
        while ((this.MAX_ADDRESS >> BigInt((digits + 1) * 8)) > 0)
            digits += 1;
        
        return <>{[...this.props.memory.text.data].map((val, i) =>
            <div key={`block${i}`} className={styles.dword}>
                {(i*8).toString(16).padStart(digits, '0')}:
                <span className={styles.value}>{bigIntToHexString(val, 64)}</span>
            </div>
        ).concat([...this.props.memory.stack.data].map((val, i) =>
            <div key={`block${i}`} className={styles.dword}>
                {(this.MAX_ADDRESS - BigInt(i*8)).toString(16).padStart(digits, '0')}:
                <span className={styles.value}>{bigIntToHexString(val, 64)}</span>
            </div>
        ))}</>;
    }
}

export default Memory;