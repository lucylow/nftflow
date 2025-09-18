import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Camera, 
  Wallet,
  Touch,
  Wifi,
  Battery,
  Shield,
  Zap,
  Globe,
  Users
} from 'lucide-react';

export default function Mobile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Mobile App</h1>
          <p className="text-gray-300 text-lg">
            Take NFTFlow with you - mobile app coming soon
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                  iOS App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">In Development</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Version</span>
                    <span className="text-white">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Release</span>
                    <span className="text-white">Q2 2024</span>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Smartphone className="h-5 w-5 text-green-400" />
                  Android App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">In Development</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Version</span>
                    <span className="text-white">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Release</span>
                    <span className="text-white">Q2 2024</span>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Mobile Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-purple-400" />
                    <div>
                      <h4 className="text-white font-medium">Mobile Wallet</h4>
                      <p className="text-gray-400 text-sm">Secure wallet integration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="text-white font-medium">Camera Integration</h4>
                      <p className="text-gray-400 text-sm">Scan QR codes and NFTs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Touch className="h-5 w-5 text-green-400" />
                    <div>
                      <h4 className="text-white font-medium">Touch Optimized</h4>
                      <p className="text-gray-400 text-sm">Native mobile experience</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-yellow-400" />
                    <div>
                      <h4 className="text-white font-medium">Offline Support</h4>
                      <p className="text-gray-400 text-sm">Work without internet</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Technical Specs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Platform</span>
                    <span className="text-white">React Native</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Size</span>
                    <span className="text-white">~50MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Min iOS</span>
                    <span className="text-white">iOS 14+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Min Android</span>
                    <span className="text-white">Android 8+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-green-400" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>• Biometric authentication</li>
                <li>• Hardware wallet support</li>
                <li>• Encrypted storage</li>
                <li>• Secure key management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>• Fast loading times</li>
                <li>• Smooth animations</li>
                <li>• Low battery usage</li>
                <li>• Optimized for mobile</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5 text-blue-400" />
                Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>• Multi-network support</li>
                <li>• Push notifications</li>
                <li>• Real-time updates</li>
                <li>• Cloud sync</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Get Notified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Smartphone className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Mobile App Coming Soon</h3>
              <p className="text-gray-300 mb-6">
                Be the first to know when our mobile app launches. Get early access and exclusive features.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/profile">Join Waitlist</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  <Link to="/wallet">Connect Wallet</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}