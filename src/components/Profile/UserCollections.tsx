import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Folder, Image } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  floorPrice?: string;
  volume?: string;
  coverImage?: string;
}

interface UserCollectionsProps {
  address?: string;
  collections?: Collection[];
}

export const UserCollections: React.FC<UserCollectionsProps> = ({ 
  collections = [] 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Collections</h3>
        <Badge variant="secondary">{collections.length} collections</Badge>
      </div>
      
      {collections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No collections created yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                {collection.coverImage ? (
                  <img 
                    src={collection.coverImage} 
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {collection.itemCount} items
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base truncate">{collection.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {collection.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                <div className="flex justify-between text-sm">
                  {collection.floorPrice && (
                    <div>
                      <span className="text-muted-foreground">Floor: </span>
                      <span className="font-medium">{collection.floorPrice}</span>
                    </div>
                  )}
                  {collection.volume && (
                    <div>
                      <span className="text-muted-foreground">Volume: </span>
                      <span className="font-medium">{collection.volume}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCollections;