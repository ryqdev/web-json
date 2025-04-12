"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './JsonViewer.module.css';

interface JsonValue {
    [key: string]: JsonValueType;
}

type JsonValueType =
    | string
    | number
    | boolean
    | null
    | JsonValue
    | JsonValueType[];

interface JsonViewerProps {
    data: JsonValueType;
    initialExpanded?: boolean;
    searchTerm?: string;
    path?: string[];
    searchResults?: Set<string>;
}

// JsonView component for displaying a single JSON node
const JsonView = ({
                      data,
                      initialExpanded = false,
                      searchTerm = '',
                      path = [],
                      searchResults = new Set()
                  }: JsonViewerProps) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
    const nodeRef = useRef<HTMLDivElement>(null);

    const getType = (value: JsonValueType): string => {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const type = getType(data);

    // Check if current node or its children contain the search term
    const containsSearchTerm = (value: JsonValueType, currentPath: string[] = []): boolean => {
        if (!searchTerm || searchTerm.trim() === '') return false;

        const stringValue = String(value);
        const currentPathStr = currentPath.join('.');

        // Check current value
        if (typeof value !== 'object' && stringValue.toLowerCase().includes(searchTerm.toLowerCase())) {
            searchResults.add(currentPathStr);
            return true;
        }

        // For null
        if (value === null) {
            return false;
        }

        // For arrays and objects, check children
        if (typeof value === 'object') {
            for (const [key, childValue] of Object.entries(value as JsonValue)) {
                const childPath = [...currentPath, key];
                const childPathStr = childPath.join('.');

                // Check if the key contains the search term
                if (searchTerm.trim() !== '' && key.toLowerCase().includes(searchTerm.toLowerCase())) {
                    searchResults.add(childPathStr);
                }

                // Recursively check child values
                if (containsSearchTerm(childValue, childPath)) {
                    searchResults.add(currentPathStr); // Mark parent as containing a match too
                }
            }

            return searchResults.has(currentPathStr);
        }

        return false;
    };

    // Auto-expand if this node or its children contain the search term
    useEffect(() => {
        const currentPath = path.join('.');

        // If search term is empty, don't alter expand state unless it's initial
        if (!searchTerm || searchTerm.trim() === '') {
            if (!initialExpanded && !isExpanded) {
                return; // Don't collapse if it was manually expanded
            }
            return;
        }

        // Clear the marking to recompute
        const shouldExpand = searchResults.has(currentPath) || containsSearchTerm(data, path);

        if (shouldExpand) {
            setIsExpanded(true);

            // Scroll the node into view if it's a direct match
            if (nodeRef.current && searchResults.has(currentPath)) {
                nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [searchTerm, path, data, initialExpanded, isExpanded, searchResults, containsSearchTerm]);

    // Highlight text that matches the search term
    const highlightText = (text: string) => {
        if (!searchTerm || searchTerm.trim() === '') return text;

        const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

        return parts.map((part, index) =>
            part.toLowerCase() === searchTerm.toLowerCase() ?
                <mark key={index} className={styles.highlight}>{part}</mark> :
                part
        );
    };

    // Primitive types rendering with highlighting
    if (type === 'string') {
        const isMatch = searchTerm && searchTerm.trim() !== '' && searchResults.has(path.join('.'));
        return (
            <span
                ref={nodeRef}
                className={`${styles.string} ${isMatch ? styles.matchNode : ''}`}
            >
        &quot;{highlightText(data as string)}&quot;
      </span>
        );
    }
    if (type === 'number') {
        const stringValue = String(data);
        const isMatch = searchTerm && searchTerm.trim() !== '' && searchResults.has(path.join('.'));
        return (
            <span
                ref={nodeRef}
                className={`${styles.number} ${isMatch ? styles.matchNode : ''}`}
            >
        {highlightText(stringValue)}
      </span>
        );
    }
    if (type === 'boolean') {
        const stringValue = data ? 'true' : 'false';
        const isMatch = searchTerm && searchTerm.trim() !== '' && searchResults.has(path.join('.'));
        return (
            <span
                ref={nodeRef}
                className={`${styles.boolean} ${isMatch ? styles.matchNode : ''}`}
            >
        {highlightText(stringValue)}
      </span>
        );
    }
    if (type === 'null') {
        const isMatch = searchTerm && searchTerm.trim() !== '' && searchResults.has(path.join('.'));
        return (
            <span
                ref={nodeRef}
                className={`${styles.null} ${isMatch ? styles.matchNode : ''}`}
            >
        null
      </span>
        );
    }
    if (type === 'undefined') {
        const isMatch = searchTerm && searchTerm.trim() !== '' && searchResults.has(path.join('.'));
        return (
            <span
                ref={nodeRef}
                className={`${styles.null} ${isMatch ? styles.matchNode : ''}`}
            >
        undefined
      </span>
        );
    }

    // For objects and arrays
    const isArray = type === 'array';
    const isEmpty = isArray
        ? (data as JsonValueType[]).length === 0
        : Object.keys(data as JsonValue).length === 0;
    const isMatch = searchTerm && searchTerm.trim() !== '' && searchResults.has(path.join('.'));

    return (
        <div
            ref={nodeRef}
            className={`${styles.jsonNode} ${isMatch ? styles.matchContainer : ''}`}
        >
            <div
                className={`${styles.toggler} ${isMatch ? styles.matchNode : ''}`}
                onClick={toggleExpand}
            >
                <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                <span className={styles.bracket}>
          {isArray ? '[' : '{'}
        </span>

                {!isExpanded && (
                    <span className={styles.preview}>
            {isEmpty
                ? ''
                : isArray
                    ? `${(data as JsonValueType[]).length} ${(data as JsonValueType[]).length === 1 ? 'item' : 'items'}`
                    : `${Object.keys(data as JsonValue).length} ${Object.keys(data as JsonValue).length === 1 ? 'property' : 'properties'}`
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
                                    ? (data as JsonValueType[]).map((item, index) => (
                                        <div key={index} className={styles.property}>
                                            <span className={styles.key}>{index}: </span>
                                            <JsonView
                                                data={item}
                                                searchTerm={searchTerm}
                                                path={[...path, String(index)]}
                                                searchResults={searchResults}
                                            />
                                            {index < (data as JsonValueType[]).length - 1 && <span className={styles.comma}>,</span>}
                                        </div>
                                    ))
                                    : Object.entries(data as JsonValue).map(([key, value], index, array) => {
                                        const keyHasMatch = searchTerm &&
                                            searchTerm.trim() !== '' &&
                                            key.toLowerCase().includes(searchTerm.toLowerCase());

                                        return (
                                            <div key={key} className={styles.property}>
                          <span className={`${styles.key} ${keyHasMatch ? styles.highlight : ''}`}>
                            &quot;{highlightText(key)}&quot;:
                          </span>
                                                <JsonView
                                                    data={value}
                                                    searchTerm={searchTerm}
                                                    path={[...path, key]}
                                                    searchResults={searchResults}
                                                />
                                                {index < array.length - 1 && <span className={styles.comma}>,</span>}
                                            </div>
                                        );
                                    })
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
    const [jsonInput, setJsonInput] = useState('');
    const [jsonData, setJsonData] = useState<JsonValueType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState(new Set<string>());
    const [resultCount, setResultCount] = useState(0);

    // Example JSON for initial placeholder
    const exampleJson = JSON.stringify({
        name: "JSON Viewer",
        version: 1.0,
        features: ["folding", "syntax highlighting", "responsive", "search"],
        isAwesome: true,
        author: {
            name: "Developer",
            contact: {
                email: "dev@example.com"
            }
        },
        nestedData: {
            level1: {
                level2: {
                    level3: {
                        deepValue: "This is deeply nested data that would normally be hidden"
                    }
                }
            }
        }
    }, null, 2);

    // Parse JSON automatically when input changes
    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            if (!jsonInput.trim()) {
                setJsonData(null);
                setError(null);
                return;
            }

            try {
                const parsed = JSON.parse(jsonInput) as JsonValueType;
                setJsonData(parsed);
                setError(null);
            } catch (err) {
                setError("Invalid JSON: " + (err as Error).message);
                setJsonData(null);
            }
        }, 300); // 300ms debounce delay

        return () => clearTimeout(debounceTimeout);
    }, [jsonInput]);

    // Update search results when search term or JSON data changes
    useEffect(() => {
        // Reset search results when search term is empty
        if (!searchTerm || searchTerm.trim() === '' || !jsonData) {
            setSearchResults(new Set());
            setResultCount(0);
            return;
        }

        const results = new Set<string>();

        // Helper function to search through all nodes
        const searchInObject = (obj: JsonValueType, path: string[] = []): boolean => {
            if (obj === null || typeof obj !== 'object') {
                const stringValue = String(obj);
                if (stringValue.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.add(path.join('.'));
                    return true;
                }
                return false;
            }

            let hasMatch = false;

            for (const [key, value] of Object.entries(obj as JsonValue)) {
                const newPath = [...path, key];
                const currentPathStr = newPath.join('.');

                // Check if key matches
                if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.add(currentPathStr);
                    hasMatch = true;
                }

                // Check if value matches (recursively for objects)
                const valueMatches = searchInObject(value, newPath);
                if (valueMatches) {
                    hasMatch = true;
                    // Mark parent paths as having matches too
                    if (path.length > 0) {
                        results.add(path.join('.'));
                    }
                }
            }

            return hasMatch;
        };

        searchInObject(jsonData);
        setSearchResults(results);
        setResultCount(results.size);
    }, [searchTerm, jsonData]);

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>JSON Viewer</h1>

            <div className={styles.splitLayout}>
                <div className={styles.leftPanel}>
                    <h2 className={styles.panelTitle}>Input JSON</h2>
                    <div className={styles.textareaContainer}>
            <textarea
                className={styles.jsonInput}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`Enter your JSON here...\n\nExample:\n${exampleJson}`}
                spellCheck="false"
            />
                    </div>

                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}
                </div>

                <div className={styles.rightPanel}>
                    <div className={styles.viewerHeader}>
                        <h2 className={styles.panelTitle}>JSON Viewer</h2>
                        {jsonData && (
                            <div className={styles.searchContainer}>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Search in JSON..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && searchTerm.trim() !== '' && (
                                    <div className={styles.searchStats}>
                                        {resultCount} match{resultCount !== 1 ? 'es' : ''}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {jsonData ? (
                        <div className={styles.container}>
                            <div className={styles.jsonViewer}>
                                <JsonView
                                    data={jsonData}
                                    initialExpanded={true}
                                    searchTerm={searchTerm}
                                    searchResults={searchResults}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            {error ? (
                                <p>Please fix the JSON syntax error to visualize</p>
                            ) : (
                                <p>Enter valid JSON in the editor to visualize</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}