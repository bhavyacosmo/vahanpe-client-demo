import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl text-red-900">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                    <p className="mb-4">The application crashed. Here is the error:</p>
                    <pre className="bg-white p-4 rounded border border-red-100 overflow-auto text-sm">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Go Back to Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
