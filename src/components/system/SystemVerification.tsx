
import React, { useState, useEffect } from 'react';
import { VerificationService, SystemVerificationResult } from '@/application/services/VerificationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

export const SystemVerification: React.FC = () => {
  const [verificationResult, setVerificationResult] = useState<SystemVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runVerification = async () => {
    setIsLoading(true);
    try {
      const result = await VerificationService.getInstance().verifySystem();
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runVerification();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getFeatureStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (percentage >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (!verificationResult && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Verification</CardTitle>
          <CardDescription>Check system completeness and functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runVerification} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Verification</CardTitle>
          <CardDescription>Running system verification...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Verifying system...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(verificationResult!.overallStatus)}
            System Status: {verificationResult!.overallStatus.toUpperCase()}
          </CardTitle>
          <CardDescription>
            Overall completion: {verificationResult!.completionPercentage}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={verificationResult!.completionPercentage} className="mb-4" />
          <Button onClick={runVerification} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Status</CardTitle>
          <CardDescription>Detailed breakdown of system features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationResult!.features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getFeatureStatusIcon(feature.completionPercentage)}
                  <div>
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.completionPercentage}% complete
                      {feature.issues.length > 0 && (
                        <span className="text-red-600 ml-2">
                          ({feature.issues.length} issues)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Progress value={feature.completionPercentage} className="w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {verificationResult!.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Actions to improve system completeness</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {verificationResult!.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
