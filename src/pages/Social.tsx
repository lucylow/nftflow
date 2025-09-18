import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Camera,
  Video,
  Music,
  Image,
  TrendingUp,
  Award,
  Star,
  Globe
} from 'lucide-react';

export default function Social() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Social Hub</h1>
          <p className="text-gray-300 text-lg">
            Connect with creators, share your NFTs, and build your community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-blue-400" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Join NFT creator communities and discussions
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Forums and groups</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageCircle className="h-5 w-5 text-green-400" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Real-time messaging and collaboration
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Direct messages</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Share2 className="h-5 w-5 text-purple-400" />
                Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Share your creations and achievements
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Social media integration</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="h-5 w-5 text-red-400" />
                Reactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Like, comment, and react to content
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-red-500/20 text-red-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Emoji reactions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
                Trending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Discover trending NFTs and creators
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Algorithmic feeds</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5 text-orange-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Earn badges and recognition
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Gamification system</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Content Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Image className="h-5 w-5 text-blue-400" />
                  <div>
                    <h4 className="text-white font-medium">Image Posts</h4>
                    <p className="text-gray-400 text-sm">Share your NFT artwork</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-red-400" />
                  <div>
                    <h4 className="text-white font-medium">Video Content</h4>
                    <p className="text-gray-400 text-sm">Showcase your creations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium">Audio NFTs</h4>
                    <p className="text-gray-400 text-sm">Share music and sounds</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Social Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <div>
                    <h4 className="text-white font-medium">Follow System</h4>
                    <p className="text-gray-400 text-sm">Follow your favorite creators</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-green-400" />
                  <div>
                    <h4 className="text-white font-medium">Global Reach</h4>
                    <p className="text-gray-400 text-sm">Connect worldwide</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-pink-400" />
                  <div>
                    <h4 className="text-white font-medium">Live Streaming</h4>
                    <p className="text-gray-400 text-sm">Stream your creative process</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Social Features Coming Soon</h3>
              <p className="text-gray-300 mb-6">
                We're building a comprehensive social platform for NFT creators and collectors.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link to="/profile">Create Profile</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  <Link to="/marketplace">Explore NFTs</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}