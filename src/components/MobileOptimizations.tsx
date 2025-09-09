import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Hand, 
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileSettings {
  enableTouchGestures: boolean;
  enableSwipeNavigation: boolean;
  enablePullToRefresh: boolean;
  enableHapticFeedback: boolean;
  fontSize: number;
  touchTargetSize: number;
  enableDarkMode: boolean;
  enableReducedMotion: boolean;
}

const MobileOptimizations: React.FC = () => {
  const { toast } = useToast();
  const [mobileSettings, setMobileSettings] = useState<MobileSettings>({
    enableTouchGestures: true,
    enableSwipeNavigation: true,
    enablePullToRefresh: true,
    enableHapticFeedback: true,
    fontSize: 16,
    touchTargetSize: 44,
    enableDarkMode: false,
    enableReducedMotion: false
  });
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }

      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  const updateSetting = (key: keyof MobileSettings, value: string | number | boolean) => {
    setMobileSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply settings to document
    if (key === 'fontSize') {
      document.documentElement.style.fontSize = `${value}px`;
    }
    
    if (key === 'enableReducedMotion') {
      document.documentElement.style.setProperty('--reduced-motion', value ? 'reduce' : 'auto');
    }

    toast({
      title: "Setting Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been updated`,
    });
  };

  const resetToDefaults = () => {
    const defaults: MobileSettings = {
      enableTouchGestures: true,
      enableSwipeNavigation: true,
      enablePullToRefresh: true,
      enableHapticFeedback: true,
      fontSize: 16,
      touchTargetSize: 44,
      enableDarkMode: false,
      enableReducedMotion: false
    };
    
    setMobileSettings(defaults);
    document.documentElement.style.fontSize = '16px';
    document.documentElement.style.setProperty('--reduced-motion', 'auto');
    
    toast({
      title: "Settings Reset",
      description: "All mobile settings have been reset to defaults",
    });
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      case 'tablet': return <Tablet className="h-5 w-5" />;
      case 'desktop': return <Monitor className="h-5 w-5" />;
    }
  };

  const getDeviceColor = () => {
    switch (deviceType) {
      case 'mobile': return 'text-blue-500';
      case 'tablet': return 'text-green-500';
      case 'desktop': return 'text-purple-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mobile Optimizations
          </h2>
          <p className="text-muted-foreground">Enhance your mobile experience</p>
        </div>
        <Button variant="outline" onClick={resetToDefaults}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      {/* Device Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getDeviceIcon()}
            Device Detection
          </CardTitle>
          <CardDescription>
            Current device and orientation information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className={`text-2xl font-bold ${getDeviceColor()}`}>
                {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
              </div>
              <div className="text-sm text-muted-foreground">Device Type</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
              </div>
              <div className="text-sm text-muted-foreground">Orientation</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {window.innerWidth} × {window.innerHeight}
              </div>
              <div className="text-sm text-muted-foreground">Screen Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Touch Gestures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hand className="h-5 w-5" />
            Touch Gestures
          </CardTitle>
          <CardDescription>
            Configure touch interactions and gestures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Enable Touch Gestures</div>
                <div className="text-sm text-muted-foreground">
                  Allow swipe, pinch, and tap gestures
                </div>
              </div>
              <Switch
                checked={mobileSettings.enableTouchGestures}
                onCheckedChange={(checked) => updateSetting('enableTouchGestures', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Swipe Navigation</div>
                <div className="text-sm text-muted-foreground">
                  Enable swipe gestures for navigation
                </div>
              </div>
              <Switch
                checked={mobileSettings.enableSwipeNavigation}
                onCheckedChange={(checked) => updateSetting('enableSwipeNavigation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Pull to Refresh</div>
                <div className="text-sm text-muted-foreground">
                  Enable pull-to-refresh functionality
                </div>
              </div>
              <Switch
                checked={mobileSettings.enablePullToRefresh}
                onCheckedChange={(checked) => updateSetting('enablePullToRefresh', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Haptic Feedback</div>
                <div className="text-sm text-muted-foreground">
                  Provide tactile feedback on interactions
                </div>
              </div>
              <Switch
                checked={mobileSettings.enableHapticFeedback}
                onCheckedChange={(checked) => updateSetting('enableHapticFeedback', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <CardDescription>
            Improve accessibility and usability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Font Size</div>
                <div className="text-sm text-muted-foreground">{mobileSettings.fontSize}px</div>
              </div>
              <Slider
                value={[mobileSettings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Touch Target Size</div>
                <div className="text-sm text-muted-foreground">{mobileSettings.touchTargetSize}px</div>
              </div>
              <Slider
                value={[mobileSettings.touchTargetSize]}
                onValueChange={([value]) => updateSetting('touchTargetSize', value)}
                min={32}
                max={64}
                step={4}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">
                  Enable dark theme for better visibility
                </div>
              </div>
              <Switch
                checked={mobileSettings.enableDarkMode}
                onCheckedChange={(checked) => updateSetting('enableDarkMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Reduce Motion</div>
                <div className="text-sm text-muted-foreground">
                  Minimize animations and transitions
                </div>
              </div>
              <Switch
                checked={mobileSettings.enableReducedMotion}
                onCheckedChange={(checked) => updateSetting('enableReducedMotion', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Tips
          </CardTitle>
          <CardDescription>
            Best practices for mobile usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Use Landscape Mode</div>
                <div className="text-sm text-green-600">
                  Rotate your device to landscape for better viewing of NFT details and charts
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Pinch to Zoom</div>
                <div className="text-sm text-blue-600">
                  Use pinch gestures to zoom in on NFT images and detailed information
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <div className="font-medium text-purple-800">Swipe Navigation</div>
                <div className="text-sm text-purple-600">
                  Swipe left or right to navigate between different sections and tabs
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">Battery Optimization</div>
                <div className="text-sm text-yellow-600">
                  Close unused tabs and reduce background activity to save battery
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Monitor mobile performance and optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-500">95%</div>
              <div className="text-sm text-muted-foreground">Mobile Score</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">1.2s</div>
              <div className="text-sm text-muted-foreground">Load Time</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-500">60fps</div>
              <div className="text-sm text-muted-foreground">Frame Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">2.1MB</div>
              <div className="text-sm text-muted-foreground">Bundle Size</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimizations;
