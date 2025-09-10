import React from "react";

type State = { hasError: boolean; error?: Error | null };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
    constructor(props: React.PropsWithChildren) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        
        
        console.error("Unhandled error caught by ErrorBoundary:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-xl bg-white/80 rounded-md p-6 shadow">
                        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                        <p className="mb-2 text-sm text-muted-foreground">
                            An error occurred while loading the application. Open the devtools console for details.
                        </p>
                        <pre className="text-xs max-h-40 overflow-auto bg-gray-100 p-2 rounded">
                            {this.state.error?.message}
                        </pre>
                        <div className="mt-3">
                            <button onClick={() => location.reload()} className="px-3 py-1 rounded bg-blue-500 text-white">
                                Reload
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}