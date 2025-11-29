import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Plus, Zap } from 'lucide-react';

interface DemoControlPanelProps {
  isRunning: boolean;
  speed: number;
  activeRentalsCount: number;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onAddRental: () => void;
  onSpeedChange: (speed: number) => void;
}

export function DemoControlPanel({
  isRunning,
  speed,
  activeRentalsCount,
  onStart,
  onStop,
  onReset,
  onAddRental,
  onSpeedChange,
}: DemoControlPanelProps) {
  const speedLabels = ['0.25x', '0.5x', '1x', '2x', '4x'];
  const speedValues = [0.25, 0.5, 1, 2, 4];
  const speedIndex = speedValues.indexOf(speed);

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Stream Controls
        </h3>
        <Badge variant={isRunning ? 'default' : 'secondary'}>
          {isRunning ? 'LIVE' : 'PAUSED'}
        </Badge>
      </div>

      <div className="flex gap-2">
        {!isRunning ? (
          <Button onClick={onStart} className="flex-1" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        ) : (
          <Button onClick={onStop} variant="secondary" className="flex-1" size="sm">
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}
        <Button onClick={onReset} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <Button onClick={onAddRental} variant="outline" className="w-full" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Rental ({activeRentalsCount} active)
      </Button>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Speed</span>
          <span className="font-mono text-foreground">{speedLabels[speedIndex] || '1x'}</span>
        </div>
        <Slider
          value={[speedIndex >= 0 ? speedIndex : 2]}
          onValueChange={([idx]) => onSpeedChange(speedValues[idx])}
          max={4}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
        <strong>Demo Mode:</strong> Simulated Somnia Data Streams. 
        Events are generated locally for demonstration.
      </div>
    </div>
  );
}
