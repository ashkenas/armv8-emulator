import styles from '@styles/ErrorBoundary.module.css';
import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: false, errorInfo: false };
    }

    static getDerivedStateFromError(error) {
        return { error: error };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error(errorInfo);
        this.setState({ error: error, errorInfo: errorInfo });
    }

    render() {
        if (!this.state.errorInfo)
            return this.props.children;

        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <h2 className={styles.title}>{this.props.title}</h2>
                    <div className={styles.body}>
                        <pre>{this.state.error.toString()}</pre>
                    </div>
                </div>
            </div>
        );
    }
};
