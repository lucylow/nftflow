import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Shield,
  Zap,
  Star,
  Calendar,
  Timer,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Rental() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Rental Management</h1>
          <p className="text-gray-300 text-lg">
            Manage your NFT rentals with precision and ease
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-blue-400" />
                Active Rentals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">12</div>
                <p className="text-gray-400 text-sm">Currently rented</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-green-400" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">2,450</div>
                <p className="text-gray-400 text-sm">STT earned</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-purple-400" />
                Renters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">89</div>
                <p className="text-gray-400 text-sm">Unique renters</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">2.5h</div>
                <p className="text-gray-400 text-sm">Per rental</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Cool NFT #123</h4>
                      <p className="text-gray-400 text-sm">0x1234...5678</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">45 STT</div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">Active</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Art Piece #456</h4>
                      <p className="text-gray-400 text-sm">0x9876...5432</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">120 STT</div>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Completed</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Gaming NFT #789</h4>
                      <p className="text-gray-400 text-sm">0x5555...7777</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">78 STT</div>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Rental Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Success Rate</span>
                  <span className="text-green-400 font-medium">98.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Avg Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">4.8</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Rentals</span>
                  <span className="text-white font-medium">234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">This Month</span>
                  <span className="text-white font-medium">45</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Timer className="h-5 w-5 text-blue-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Rental
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  End Rental
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-green-400" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>• Smart contract protection</li>
                <li>• Automatic escrow</li>
                <li>• Dispute resolution</li>
                <li>• Insurance coverage</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>• Auto-renewal options</li>
                <li>• Price optimization</li>
                <li>• Availability management</li>
                <li>• Payment processing</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Rental Management Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Advanced Rental Management</h3>
              <p className="text-gray-300 mb-6">
                Take control of your NFT rentals with our comprehensive management tools.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link to="/create">List Your NFT</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  <Link to="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
