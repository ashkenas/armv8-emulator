import React from "react";
import styles from "@styles/ScrollContent.module.css";

export default function ScrollContent(props) {
    return (
        <div className={styles.scroll}>
            {props.children}
        </div>
    );
}