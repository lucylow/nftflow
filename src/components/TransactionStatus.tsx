import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  AlertCircle,
  Loader2,
  Fuel
} from 'lucide-react';
import { TransactionStatus as TxStatus } from '@/hooks/useEnhancedNFTFlow';

interface TransactionStatusProps {
  status: TxStatus | null;
  onClose?: () => void;
  className?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status,
  onClose,
  className = ''
}) => {
  const getStatusIcon = () => {
    if (!status) return null;

    switch (status.status) {
      case 'pending':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    if (!status) return 'default';

    switch (status.status) {
      case 'pending':
        return 'default';
      case 'confirmed':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    if (!status) return '';

    switch (status.status) {
      case 'pending':
        return 'Transaction Pending';
      case 'confirmed':
        return 'Transaction Confirmed';
      case 'failed':
        return 'Transaction Failed';
      default:
        return 'Unknown Status';
    }
  };

  const getExplorerUrl = (hash: string) => {
    // This should be configurable based on network
    return `https://shannon-explorer.somnia.network/tx/${hash}`;
  };

  if (!status) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 z-50 max-w-md ${className}`}
      >
        <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-medium">{getStatusText()}</span>
              </div>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Badge variant={getStatusColor() as any} className="mb-2">
                {status.status.toUpperCase()}
              </Badge>

              

              {status.hash && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transaction Hash:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {`${status.hash.slice(0, 8)}...${status.hash.slice(-8)}`}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getExplorerUrl(status.hash!), '_blank')}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {status.confirmations !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confirmations:</span>
                  <span className="text-sm font-mono">{status.confirmations}</span>
                </div>
              )}

              {status.gasUsed && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Gas Used:</span>
                  </div>
                  <span className="text-sm font-mono">{parseFloat(status.gasUsed).toFixed(6)} ETH</span>
                </div>
              )}

              {status.errorMessage && (
                <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-destructive">{status.errorMessage}</span>
                  </div>
                </div>
              )}

              {status.status === 'pending' && (
                <div className="mt-3 p-2 bg-primary/10 border border-primary/20 rounded">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-sm text-primary">
                      Please wait while your transaction is being processed...
                    </span>
                  </div>
                </div>
              )}

              {status.status === 'confirmed' && (
                <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      Transaction completed successfully!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};