import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Grid, Heart, Star, Activity } from 'lucide-react';

interface ProfileTabsProps {
  children?: React.ReactNode;
  defaultValue?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  children, 
  defaultValue = 'owned' 
}) => {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="owned" className="gap-2">
          <Grid className="w-4 h-4" />
          Owned
        </TabsTrigger>
        <TabsTrigger value="liked" className="gap-2">
          <Heart className="w-4 h-4" />
          Liked
        </TabsTrigger>
        <TabsTrigger value="created" className="gap-2">
          <Star className="w-4 h-4" />
          Created
        </TabsTrigger>
        <TabsTrigger value="activity" className="gap-2">
          <Activity className="w-4 h-4" />
          Activity
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="owned" className="mt-6">
        <div className="text-center text-muted-foreground py-8">
          No owned NFTs yet
        </div>
      </TabsContent>
      
      <TabsContent value="liked" className="mt-6">
        <div className="text-center text-muted-foreground py-8">
          No liked NFTs yet
        </div>
      </TabsContent>
      
      <TabsContent value="created" className="mt-6">
        <div className="text-center text-muted-foreground py-8">
          No created NFTs yet
        </div>
      </TabsContent>
      
      <TabsContent value="activity" className="mt-6">
        <div className="text-center text-muted-foreground py-8">
          No activity yet
        </div>
      </TabsContent>
      
      {children}
    </Tabs>
  );
};

export default ProfileTabs;