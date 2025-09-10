import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Palette, 
  MousePointer, 
  Keyboard, 
  Smartphone,
  Eye,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TabConfigurationProps {
  onConfigurationChange?: (config: TabConfiguration) => void;
  className?: string;
}

interface TabConfiguration {
  variant: 'default' | 'pills' | 'underline';
  showIcons: boolean;
  showBadges: boolean;
  animated: boolean;
  keyboardNavigation: boolean;
  mobileOptimized: boolean;
  maxVisibleTabs: number;
  tabSize: 'sm' | 'md' | 'lg';
  theme: 'light' | 'dark' | 'auto';
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
}

const defaultConfiguration: TabConfiguration = {
  variant: 'pills',
  showIcons: true,
  showBadges: true,
  animated: true,
  keyboardNavigation: true,
  mobileOptimized: true,
  maxVisibleTabs: 6,
  tabSize: 'md',
  theme: 'auto',
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
  },
};

export function TabConfiguration({ onConfigurationChange, className }: TabConfigurationProps) {
  const [config, setConfig] = useState<TabConfiguration>(defaultConfiguration);
  const { toast } = useToast();

  const updateConfig = (updates: Partial<TabConfiguration>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigurationChange?.(newConfig);
    
    // Apply configuration to document
    applyConfiguration(newConfig);
    
    toast({
      title: "Configuration Updated",
      description: "Tab settings have been applied successfully",
    });
  };

  const applyConfiguration = (config: TabConfiguration) => {
    // Apply theme
    if (config.theme !== 'auto') {
      document.documentElement.setAttribute('data-theme', config.theme);
    }

    // Apply accessibility settings
    if (config.accessibility.reducedMotion) {
      document.documentElement.style.setProperty('--reduced-motion', 'reduce');
    } else {
      document.documentElement.style.setProperty('--reduced-motion', 'auto');
    }

    if (config.accessibility.largeText) {
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }

    if (config.accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const resetToDefaults = () => {
    setConfig(defaultConfiguration);
    onConfigurationChange?.(defaultConfiguration);
    applyConfiguration(defaultConfiguration);
    
    toast({
      title: "Configuration Reset",
      description: "All tab settings have been reset to defaults",
    });
  };

  const getTabSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'h-8 px-2 text-xs';
      case 'lg': return 'h-12 px-4 text-base';
      default: return 'h-10 px-3 text-sm';
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tab Configuration
          </CardTitle>
          <CardDescription>
            Customize your tab experience with these settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Settings */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <Palette className="h-4 w-4" />
              Visual Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant">Tab Style</Label>
                <Select
                  value={config.variant}
                  onValueChange={(value: 'default' | 'pills' | 'underline') => 
                    updateConfig({ variant: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="pills">Pills</SelectItem>
                    <SelectItem value="underline">Underline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tabSize">Tab Size</Label>
                <Select
                  value={config.tabSize}
                  onValueChange={(value: 'sm' | 'md' | 'lg') => 
                    updateConfig({ tabSize: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Icons</Label>
                  <p className="text-sm text-muted-foreground">
                    Display icons in tab labels
                  </p>
                </div>
                <Switch
                  checked={config.showIcons}
                  onCheckedChange={(checked) => updateConfig({ showIcons: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Badges</Label>
                  <p className="text-sm text-muted-foreground">
                    Display notification badges on tabs
                  </p>
                </div>
                <Switch
                  checked={config.showBadges}
                  onCheckedChange={(checked) => updateConfig({ showBadges: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <Switch
                  checked={config.animated}
                  onCheckedChange={(checked) => updateConfig({ animated: checked })}
                />
              </div>
            </div>
          </div>

          {/* Interaction Settings */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <MousePointer className="h-4 w-4" />
              Interaction Settings
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Keyboard Navigation</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable arrow key navigation between tabs
                  </p>
                </div>
                <Switch
                  checked={config.keyboardNavigation}
                  onCheckedChange={(checked) => updateConfig({ keyboardNavigation: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mobile Optimized</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize tabs for mobile devices
                  </p>
                </div>
                <Switch
                  checked={config.mobileOptimized}
                  onCheckedChange={(checked) => updateConfig({ mobileOptimized: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Visible Tabs</Label>
                <div className="px-3">
                  <Slider
                    value={[config.maxVisibleTabs]}
                    onValueChange={([value]) => updateConfig({ maxVisibleTabs: value })}
                    min={3}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>3</span>
                    <span className="font-medium">{config.maxVisibleTabs}</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <Eye className="h-4 w-4" />
              Accessibility
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>High Contrast</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={config.accessibility.highContrast}
                  onCheckedChange={(checked) => 
                    updateConfig({ 
                      accessibility: { ...config.accessibility, highContrast: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  checked={config.accessibility.reducedMotion}
                  onCheckedChange={(checked) => 
                    updateConfig({ 
                      accessibility: { ...config.accessibility, reducedMotion: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Large Text</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase text size for better readability
                  </p>
                </div>
                <Switch
                  checked={config.accessibility.largeText}
                  onCheckedChange={(checked) => 
                    updateConfig({ 
                      accessibility: { ...config.accessibility, largeText: checked }
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4" />
              Preview
            </h4>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className={getTabSizeClasses(config.tabSize)}>
                  {config.showIcons && <Settings className="h-3 w-3 mr-1" />}
                  Overview
                  {config.showBadges && <span className="ml-1 px-1 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">3</span>}
                </Badge>
                <Badge variant="secondary" className={getTabSizeClasses(config.tabSize)}>
                  {config.showIcons && <Settings className="h-3 w-3 mr-1" />}
                  Settings
                </Badge>
                <Badge variant="secondary" className={getTabSizeClasses(config.tabSize)}>
                  {config.showIcons && <Settings className="h-3 w-3 mr-1" />}
                  Profile
                  {config.showBadges && <span className="ml-1 px-1 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">1</span>}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={() => applyConfiguration(config)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
