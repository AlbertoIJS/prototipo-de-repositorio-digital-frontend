"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ReactNode }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ReactNode }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Error en la visualización
            </CardTitle>
            <CardDescription>
              No se pudo cargar el gráfico. Intenta recargar la página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <p>Datos no disponibles temporalmente</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
} 