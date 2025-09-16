import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  DollarSign, 
  Clock, 
  User, 
  TrendingUp,
  Plus,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeb3 } from "@/contexts/Web3Context";
import { useToast } from "@/hooks/use-toast";

// Mock implementation for demonstration
const usePaymentStream = () => {
  return {
    createStream: async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    withdrawFromStream: async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    cancelStream: async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    getStream: async () => ({}),
    getStreamBalance: async () => "0",
    isStreamActive: async () => false,
    getSenderStreams: async () => [],
    getRecipientStreams: async () => [],
    isLoading: false
  };
};

const PaymentStreamManagement = () => {
  const { isConnected, account } = useWeb3();
  const { 
    createStream,
    withdrawFromStream,
    cancelStream,
    getStream,
    getStreamBalance,
    isStreamActive,
    getSenderStreams,
    getRecipientStreams,
    isLoading
  } = usePaymentStream();
  const { toast } = useToast();

  const [senderStreams, setSenderStreams] = useState<string[]>([]);
  const [recipientStreams, setRecipientStreams] = useState<string[]>([]);
  const [streamDetails, setStreamDetails] = useState<{
    id: string;
    sender: string;
    recipient: string;
    deposit: string;
    ratePerSecond: string;
    startTime: string;
    stopTime: string;
    remainingBalance: string;
    active: boolean;
  }[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    recipient: "",
    startTime: "",
    stopTime: "",
    depositAmount: ""
  });

  // Mock stream data for demonstration
  const mockStreams = [
    {
      id: "stream-1",
      sender: account || "0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59",
      recipient: "0x1234567890123456789012345678901234567890",
      deposit: "2.5",
      ratePerSecond: "0.0001",
      startTime: (Date.now() - 3600000).toString(), // 1 hour ago
      stopTime: (Date.now() + 86400000).toString(), // 24 hours from start
      remainingBalance: "1.8",
      active: true
    },
    {
      id: "stream-2",
      sender: "0x9876543210987654321098765432109876543210",
      recipient: account || "0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59",
      deposit: "1.0",
      ratePerSecond: "0.00005",
      startTime: (Date.now() - 7200000).toString(), // 2 hours ago
      stopTime: (Date.now() + 43200000).toString(), // 12 hours from start
      remainingBalance: "0.7",
      active: true
    }
  ];

  // Load streams
  const loadStreams = async () => {
    if (!isConnected) return;
    
    setIsRefreshing(true);
    try {
      // Mock implementation - filter streams based on account
      const sentStreams = mockStreams.filter(stream => stream.sender.toLowerCase() === account?.toLowerCase());
      const receivedStreams = mockStreams.filter(stream => stream.recipient.toLowerCase() === account?.toLowerCase());
      
      setSenderStreams(sentStreams.map(s => s.id));
      setRecipientStreams(receivedStreams.map(s => s.id));
      setStreamDetails(mockStreams);
      
    } catch (error) {
      console.error('Failed to load streams:', error);
      toast({
        title: "Failed to Load Streams",
        description: "Could not load payment streams",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Create a new stream
  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      await createStream();
      
      setCreateFormData({
        recipient: "",
        startTime: "",
        stopTime: "",
        depositAmount: ""
      });
      
      toast({
        title: "Stream Created",
        description: "Payment stream created successfully (Mock)",
      });
      
      await loadStreams(); // Refresh the list
    } catch (error) {
      console.error("Failed to create stream:", error);
      toast({
        title: "Failed to Create Stream",
        description: "Could not create payment stream",
        variant: "destructive",
      });
    }
  };

  // Withdraw from stream
  const handleWithdraw = async (streamId: string, amount?: string) => {
    try {
      await withdrawFromStream();
      toast({
        title: "Withdrawal Successful",
        description: "Funds withdrawn from stream (Mock)",
      });
      await loadStreams(); // Refresh the list
    } catch (error) {
      console.error("Failed to withdraw from stream:", error);
      toast({
        title: "Withdrawal Failed",
        description: "Could not withdraw from stream",
        variant: "destructive",
      });
    }
  };

  // Cancel stream
  const handleCancel = async (streamId: string) => {
    try {
      await cancelStream();
      toast({
        title: "Stream Cancelled",
        description: "Payment stream cancelled (Mock)",
      });
      await loadStreams(); // Refresh the list
    } catch (error) {
      console.error("Failed to cancel stream:", error);
      toast({
        title: "Cancellation Failed",
        description: "Could not cancel stream",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadStreams();
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6 text-center">
          <p className="text-slate-400">Please connect your wallet to manage payment streams</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Payment Stream Management</h2>
        <Button 
          onClick={loadStreams} 
          variant="outline" 
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="create" className="data-[state=active]:bg-purple-600">Create Stream</TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-purple-600">Sent Streams</TabsTrigger>
          <TabsTrigger value="received" className="data-[state=active]:bg-purple-600">Received Streams</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="w-5 h-5" />
                Create Payment Stream
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStream} className="space-y-4">
                <div>
                  <Label htmlFor="recipient" className="text-white">Recipient Address</Label>
                  <Input
                    id="recipient"
                    value={createFormData.recipient}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="0x..."
                    required
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="depositAmount" className="text-white">Deposit Amount (STT)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    step="0.001"
                    value={createFormData.depositAmount}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                    placeholder="1.0"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="stopTime" className="text-white">Duration (hours)</Label>
                  <Input
                    id="stopTime"
                    type="number"
                    value={createFormData.stopTime}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, stopTime: e.target.value }))}
                    placeholder="24"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700">
                  {isLoading ? "Creating..." : "Create Stream"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <div className="space-y-4">
            {senderStreams.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <p className="text-slate-400">No streams sent yet</p>
                </CardContent>
              </Card>
            ) : (
              streamDetails
                .filter(stream => senderStreams.includes(stream.id))
                .map((stream) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white">Stream #{stream.id.slice(0, 8)}...</h3>
                            <p className="text-sm text-slate-400">
                              To: {stream.recipient.slice(0, 6)}...{stream.recipient.slice(-4)}
                            </p>
                          </div>
                          <Badge variant={stream.active ? "default" : "secondary"} className={stream.active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}>
                            {stream.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-400">Total Deposit</p>
                            <p className="font-semibold text-white">{stream.deposit} STT</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Remaining</p>
                            <p className="font-semibold text-white">{stream.remainingBalance} STT</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">Progress</span>
                            <span className="text-white">{parseFloat(stream.deposit) > 0 ? ((parseFloat(stream.deposit) - parseFloat(stream.remainingBalance)) / parseFloat(stream.deposit) * 100).toFixed(1) : 0}%</span>
                          </div>
                          <Progress 
                            value={parseFloat(stream.deposit) > 0 ? ((parseFloat(stream.deposit) - parseFloat(stream.remainingBalance)) / parseFloat(stream.deposit) * 100) : 0} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(stream.id)}
                            disabled={!stream.active}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <div className="space-y-4">
            {recipientStreams.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <p className="text-slate-400">No streams received yet</p>
                </CardContent>
              </Card>
            ) : (
              streamDetails
                .filter(stream => recipientStreams.includes(stream.id))
                .map((stream) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-white">Stream #{stream.id.slice(0, 8)}...</h3>
                            <p className="text-sm text-slate-400">
                              From: {stream.sender.slice(0, 6)}...{stream.sender.slice(-4)}
                            </p>
                          </div>
                          <Badge variant={stream.active ? "default" : "secondary"} className={stream.active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}>
                            {stream.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-400">Total Deposit</p>
                            <p className="font-semibold text-white">{stream.deposit} STT</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Available</p>
                            <p className="font-semibold text-white">{stream.remainingBalance} STT</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">Progress</span>
                            <span className="text-white">{parseFloat(stream.deposit) > 0 ? ((parseFloat(stream.deposit) - parseFloat(stream.remainingBalance)) / parseFloat(stream.deposit) * 100).toFixed(1) : 0}%</span>
                          </div>
                          <Progress 
                            value={parseFloat(stream.deposit) > 0 ? ((parseFloat(stream.deposit) - parseFloat(stream.remainingBalance)) / parseFloat(stream.deposit) * 100) : 0} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleWithdraw(stream.id)}
                            disabled={!stream.active || parseFloat(stream.remainingBalance) === 0}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Withdraw All
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentStreamManagement;
