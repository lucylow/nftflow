import React from 'react';
import { Link } from 'react-router-dom';

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
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-2 text-white mb-4">
                <div className="h-5 w-5 bg-blue-400 rounded"></div>
                <h3 className="text-xl font-semibold">iOS App</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">In Development</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Version</span>
                  <span className="text-white">1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Release</span>
                  <span className="text-white">Q2 2024</span>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg" disabled>
                  Coming Soon
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-2 text-white mb-4">
                <div className="h-5 w-5 bg-green-400 rounded"></div>
                <h3 className="text-xl font-semibold">Android App</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">In Development</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Version</span>
                  <span className="text-white">1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Release</span>
                  <span className="text-white">Q2 2024</span>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Mobile Features</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-purple-400 rounded"></div>
                  <div>
                    <h4 className="text-white font-medium">Mobile Wallet</h4>
                    <p className="text-gray-400 text-sm">Secure wallet integration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-blue-400 rounded"></div>
                  <div>
                    <h4 className="text-white font-medium">Camera Integration</h4>
                    <p className="text-gray-400 text-sm">Scan QR codes and NFTs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-green-400 rounded"></div>
                  <div>
                    <h4 className="text-white font-medium">Touch Optimized</h4>
                    <p className="text-gray-400 text-sm">Native mobile experience</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-yellow-400 rounded"></div>
                  <div>
                    <h4 className="text-white font-medium">Offline Support</h4>
                    <p className="text-gray-400 text-sm">Work without internet</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Technical Specs</h3>
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="h-5 w-5 bg-green-400 rounded"></div>
              <h3 className="text-xl font-semibold">Security</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li>• Biometric authentication</li>
              <li>• Hardware wallet support</li>
              <li>• Encrypted storage</li>
              <li>• Secure key management</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="h-5 w-5 bg-yellow-400 rounded"></div>
              <h3 className="text-xl font-semibold">Performance</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li>• Fast loading times</li>
              <li>• Smooth animations</li>
              <li>• Low battery usage</li>
              <li>• Optimized for mobile</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="h-5 w-5 bg-blue-400 rounded"></div>
              <h3 className="text-xl font-semibold">Connectivity</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li>• Multi-network support</li>
              <li>• Push notifications</li>
              <li>• Real-time updates</li>
              <li>• Cloud sync</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Get Notified</h3>
          <div className="text-center py-8">
            <div className="h-16 w-16 bg-blue-400 rounded-lg mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white mb-2">Mobile App Coming Soon</h3>
            <p className="text-gray-300 mb-6">
              Be the first to know when our mobile app launches. Get early access and exclusive features.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/profile" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                Join Waitlist
              </Link>
              <Link to="/wallet" className="border border-slate-600 text-white hover:bg-slate-700 px-6 py-3 rounded-lg transition-colors">
                Connect Wallet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}