"use client";
import { useState } from 'react';
import styles from './JsonViewer.module.css';

interface JsonViewerProps {
    data: any;
    initialExpanded?: boolean;
}

// JsonView component for displaying a single JSON node
const JsonView = ({ data, initialExpanded = false }: JsonViewerProps) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    const getType = (value: any): string => {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const type = getType(data);

    // Primitive types rendering
    if (type === 'string') {
        return <span className={styles.string}>"{data}"</span>;
    }
    if (type === 'number') {
        return <span className={styles.number}>{data}</span>;
    }
    if (type === 'boolean') {
        return <span className={styles.boolean}>{data ? 'true' : 'false'}</span>;
    }
    if (type === 'null') {
        return <span className={styles.null}>null</span>;
    }
    if (type === 'undefined') {
        return <span className={styles.null}>undefined</span>;
    }

    // For objects and arrays
    const isArray = type === 'array';
    const isEmpty = isArray ? data.length === 0 : Object.keys(data).length === 0;

    return (
        <div className={styles.jsonNode}>
            <div className={styles.toggler} onClick={toggleExpand}>
                <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                <span className={styles.bracket}>
          {isArray ? '[' : '{'}
        </span>

                {!isExpanded && (
                    <span className={styles.preview}>
            {isEmpty
                ? ''
                : isArray
                    ? `${data.length} ${data.length === 1 ? 'item' : 'items'}`
                    : `${Object.keys(data).length} ${Object.keys(data).length === 1 ? 'property' : 'properties'}`
            }
          </span>
                )}

                {!isExpanded && <span className={styles.bracket}>{isArray ? ']' : '}'}</span>}
            </div>

            {isExpanded && (
                <div className={styles.content}>
                    {isEmpty ? (
                        <span className={styles.bracket}>{isArray ? ']' : '}'}</span>
                    ) : (
                        <>
                            <div className={styles.properties}>
                                {isArray
                                    ? data.map((item: any, index: number) => (
                                        <div key={index} className={styles.property}>
                                            <span className={styles.key}>{index}: </span>
                                            <JsonView data={item} />
                                            {index < data.length - 1 && <span className={styles.comma}>,</span>}
                                        </div>
                                    ))
                                    : Object.entries(data).map(([key, value], index, array) => (
                                        <div key={key} className={styles.property}>
                                            <span className={styles.key}>"{key}": </span>
                                            <JsonView data={value} />
                                            {index < array.length - 1 && <span className={styles.comma}>,</span>}
                                        </div>
                                    ))
                                }
                            </div>
                            <div className={styles.closingBracket}>
                                <span className={styles.bracket}>{isArray ? ']' : '}'}</span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default function Home() {
    // Example JSON data
    const jsonData = {
        name: "JSON Viewer",
        version: 1.0,
        features: ["folding", "syntax highlighting", "responsive"],
        isAwesome: true,
        author: {
            name: "Developer",
            contact: {
                email: "dev@example.com",
                website: "https://example.com"
            }
        },
        examples: [
            { id: 1, type: "simple" },
            { id: 2, type: "complex", hasChildren: true },
            null,
            123,
            "string value"
        ],
        emptyArray: [],
        emptyObject: {}
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>JSON Viewer</h1>
            <div className={styles.jsonViewer}>
                <JsonView data={jsonData} initialExpanded={true} />
            </div>
        </div>
    );
}