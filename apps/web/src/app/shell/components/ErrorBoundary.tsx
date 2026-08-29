import type { ReactNode } from 'react';
import { Component } from 'react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <div>Global Error!</div>;
    return this.props.children;
  }
}
