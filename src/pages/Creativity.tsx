import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Palette, 
  Brush, 
  Image, 
  Sparkles, 
  Camera,
  Music,
  Video,
  FileText,
  Download,
  Share2
} from 'lucide-react';

export default function Creativity() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Creativity Hub</h1>
          <p className="text-gray-300 text-lg">
            Unleash your artistic potential with AI-powered creative tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="h-5 w-5 text-pink-400" />
                AI Art Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Create stunning digital art with AI assistance
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-pink-500/20 text-pink-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Text-to-image generation</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brush className="h-5 w-5 text-blue-400" />
                Digital Painting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Professional digital painting tools
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Advanced brush engine</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Image className="h-5 w-5 text-green-400" />
                Photo Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Edit and enhance your photos
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">AI-powered filters</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Music className="h-5 w-5 text-purple-400" />
                Music Creator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Compose and produce music
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">AI music generation</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Video className="h-5 w-5 text-red-400" />
                Video Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Create and edit videos
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-red-500/20 text-red-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Real-time editing</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-yellow-400" />
                Content Writer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                AI-powered writing assistant
              </p>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Coming Soon</Badge>
                <p className="text-sm text-gray-400">Smart content generation</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Coming Soon Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3">Creative Tools</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-400" />
                    Advanced camera controls
                  </li>
                  <li className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-400" />
                    Export in multiple formats
                  </li>
                  <li className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-purple-400" />
                    Social media integration
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-3">AI Features</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Style transfer and filters</li>
                  <li>• Automatic color correction</li>
                  <li>• Smart object removal</li>
                  <li>• Background replacement</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/upload">Start Creating</Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                <Link to="/marketplace">Browse Creations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
