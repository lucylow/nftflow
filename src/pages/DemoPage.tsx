import { DemoControlPanel } from '@/demo/components/DemoControlPanel';
import { DemoEventFeed } from '@/demo/components/DemoEventFeed';
import { DemoRentalGrid } from '@/demo/components/DemoRentalGrid';
import { DemoPricingPanel } from '@/demo/components/DemoPricingPanel';
import { useSomniaSimulation } from '@/demo/useSomniaMock';
import { SCHEMA_IDS } from '@/demo/sampleSchemas';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, Code, ExternalLink } from 'lucide-react';

const ELEVATOR_PITCH = "NFTFlow — a Netflix-style NFT rental marketplace that uses Somnia Data Streams to publish real-time rental lifecycle events (rental_started, per-second rental_tick, pricing_suggestion) so frontends and AI agents react instantly with sub-second UX.";

const WHAT_IT_DOES = "NFTFlow enables NFT owners to rent out assets in time-limited micro-rentals. When a rental starts, structured events are published to Somnia Data Streams. Frontend subscribers receive these events in real-time to update UI instantly, show per-second streaming payments, and surface AI pricing suggestions — all without polling.";

export default function DemoPage() {
  const {
    isRunning,
    speed,
    setSpeed,
    activeRentals,
    startSimulation,
    stopSimulation,
    resetSimulation,
    addRental,
    removeRental,
  } = useSomniaSimulation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  NFTFlow — Somnia Data Streams Demo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time NFT Rental Marketplace
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Database className="w-3 h-3 mr-1" />
                Mock Mode
              </Badge>
              <Badge variant="secondary">
                <Code className="w-3 h-3 mr-1" />
                Demo
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Elevator Pitch */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-4 border border-primary/20">
          <p className="text-sm text-foreground font-medium">{ELEVATOR_PITCH}</p>
          <p className="text-xs text-muted-foreground mt-2">{WHAT_IT_DOES}</p>
        </div>
      </div>

      {/* Schema IDs Info */}
      <div className="container mx-auto px-4 py-3">
        <div className="bg-muted/30 rounded-lg p-3 border border-border">
          <div className="text-xs text-muted-foreground mb-2">
            <strong>Schema IDs (Simulated):</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SCHEMA_IDS).map(([name, id]) => (
              <div key={name} className="flex items-center gap-1 bg-background rounded px-2 py-1">
                <span className="text-[10px] text-muted-foreground">{name}:</span>
                <code className="text-[10px] font-mono text-foreground">{id.slice(0, 12)}...</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Controls */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <DemoControlPanel
              isRunning={isRunning}
              speed={speed}
              activeRentalsCount={activeRentals.size}
              onStart={startSimulation}
              onStop={stopSimulation}
              onReset={resetSimulation}
              onAddRental={addRental}
              onSpeedChange={setSpeed}
            />
            
            {/* Instructions */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-foreground text-sm">How to Use</h4>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Click <strong>Start</strong> to begin the simulation</li>
                <li>Click <strong>Add Rental</strong> to create streaming rentals</li>
                <li>Watch real-time ticks, pricing suggestions, and agent actions</li>
                <li>Adjust <strong>Speed</strong> to control tick rate</li>
                <li>Expand events in the feed to see raw data</li>
              </ol>
              <div className="text-[10px] text-muted-foreground bg-muted/50 rounded p-2 mt-2">
                <strong>Note:</strong> This demo simulates Somnia Data Streams locally. 
                To connect to real Somnia, replace mock imports with the Somnia SDK.
              </div>
            </div>
          </div>

          {/* Middle Column - Rentals */}
          <div className="col-span-12 lg:col-span-5">
            <div className="h-[600px]">
              <DemoRentalGrid onRemoveRental={removeRental} />
            </div>
          </div>

          {/* Right Column - Events & Pricing */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="h-[350px]">
              <DemoEventFeed />
            </div>
            <DemoPricingPanel />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card/50 mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>NFTFlow × Somnia Data Streams Integration Demo</span>
            <span>Switch to real SDK: Replace <code>mockSomnia</code> with <code>sdk.streams</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
