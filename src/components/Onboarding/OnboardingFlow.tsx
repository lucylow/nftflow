import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Wallet, Play, Clock, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-states';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  interactive?: boolean;
  action?: string;
}

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to NFTFlow",
      description: "Think Netflix, but for NFTs. Rent premium digital content by the second and access exclusive experiences instantly.",
      icon: <Play className="w-12 h-12 text-purple-500" />
    },
    {
      id: 2,
      title: "How NFT Rentals Work",
      description: "Instead of buying expensive NFTs, rent them for exactly the time you need. Perfect for gaming, events, or trying before buying.",
      icon: <Clock className="w-12 h-12 text-blue-500" />,
      interactive: true,
      action: "Try Demo Rental"
    },
    {
      id: 3,
      title: "Connect Your Wallet",
      description: "We'll help you connect your wallet safely. Don't have one? We'll show you how to get started in 2 minutes.",
      icon: <Wallet className="w-12 h-12 text-green-500" />,
      interactive: true,
      action: "Connect Wallet"
    },
    {
      id: 4,
      title: "You're Ready!",
      description: "Start exploring thousands of premium NFTs. Rent what you need, when you need it, for as long as you want.",
      icon: <Check className="w-12 h-12 text-emerald-500" />
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-black/40 backdrop-blur-lg border-gray-700">
        <CardHeader className="text-center pb-2">
          <div className="mb-4">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-gray-400 mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-8 flex justify-center">
                {steps[currentStep].icon}
              </div>

              <CardTitle className="text-3xl font-bold text-white mb-6">
                {steps[currentStep].title}
              </CardTitle>

              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {steps[currentStep].description}
              </p>

              {steps[currentStep].interactive && (
                <div className="mb-8">
                  <Button 
                    size="lg"
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => {
                      setIsInteracting(true);
                      setTimeout(() => {
                        setIsInteracting(false);
                        nextStep();
                      }, 2000);
                    }}
                    disabled={isInteracting}
                  >
                    {isInteracting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {steps[currentStep].action}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-gray-600 text-gray-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-purple-500'
                      : completedSteps.includes(index)
                      ? 'bg-green-500'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
