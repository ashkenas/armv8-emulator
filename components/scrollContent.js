import React from "react";
import styles from "@styles/ScrollContent.module.css";

export default function ScrollContent({ children, height }) {
    const auxStyles = {};
    if (height)
        auxStyles.maxHeight = height;

    return (
        <div className={styles.scroll} style={auxStyles}>
            {children}
        </div>
    );
}