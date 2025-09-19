import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Shield, Zap, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeb3 } from '@/contexts/Web3Context';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  recommended?: boolean;
  difficulty: 'Easy' | 'Medium';
}

const WalletConnector: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'choose' | 'connecting' | 'success'>('intro');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const { connectWallet, isConnected, isConnecting } = useWeb3();

  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Most popular wallet - works in your browser',
      recommended: true,
      difficulty: 'Easy'
    },
    {
      id: 'walletconnect',
      name: 'Mobile Wallet',
      icon: '📱',
      description: 'Connect any mobile wallet app',
      difficulty: 'Easy'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Easy setup if you use Coinbase',
      difficulty: 'Easy'
    }
  ];

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWallet(walletId);
    setStep('connecting');
    
    try {
      await connectWallet();
      setStep('success');
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setStep('intro');
    }
  };

  if (isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-black/40 backdrop-blur-lg border-gray-700">
          <CardContent className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Welcome to NFTFlow!</h3>
            <p className="text-gray-400 mb-6">
              Your wallet is connected and you're ready to start renting NFTs
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Start Exploring
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-black/40 backdrop-blur-lg border-gray-700">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Connect Your Wallet</CardTitle>
                <p className="text-gray-300 mt-2">
                  Think of this like signing into Netflix - it's how we keep your rentals secure
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <Shield className="w-8 h-8 mx-auto text-green-400" />
                    <p className="text-sm text-gray-300">100% Secure</p>
                  </div>
                  <div className="space-y-2">
                    <Zap className="w-8 h-8 mx-auto text-blue-400" />
                    <p className="text-sm text-gray-300">Instant Access</p>
                  </div>
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 mx-auto text-purple-400" />
                    <p className="text-sm text-gray-300">Easy Setup</p>
                  </div>
                </div>

                <Alert className="bg-blue-500/10 border-blue-500/20">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    <strong>New to crypto?</strong> Don't worry! We'll guide you through everything step by step.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button 
                    onClick={() => setStep('choose')}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    I Have a Wallet
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    onClick={() => setShowHelp(true)}
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    I Need Help Getting Started
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}

          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Choose Your Wallet</CardTitle>
                <p className="text-gray-300 mt-2">
                  Select how you'd like to connect
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {walletOptions.map((wallet) => (
                  <motion.button
                    key={wallet.id}
                    onClick={() => handleWalletSelect(wallet.id)}
                    className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-purple-500 rounded-lg transition-all duration-200 text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{wallet.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{wallet.name}</h3>
                            {wallet.recommended && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{wallet.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-gray-500 text-gray-400">
                        {wallet.difficulty}
                      </Badge>
                    </div>
                  </motion.button>
                ))}

                <Button 
                  variant="ghost" 
                  onClick={() => setStep('intro')}
                  className="w-full text-gray-400 hover:text-white"
                >
                  ← Back
                </Button>
              </CardContent>
            </motion.div>
          )}

          {step === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <CardContent className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-6 border-4 border-purple-500 border-t-transparent rounded-full"
                />
                <h3 className="text-xl font-semibold text-white mb-2">Connecting...</h3>
                <p className="text-gray-400">
                  Please check your wallet and approve the connection
                </p>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default WalletConnector;
