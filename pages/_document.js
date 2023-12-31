import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html>
            <Head>
                <link
                    rel="stylesheet"
                    href={
                        "https://fonts.googleapis.com/css2?display=swap&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&family=Fira+Mono"
                    }
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
