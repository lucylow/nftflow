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
import { usePaymentStream } from "@/hooks/usePaymentStream";
import { useToast } from "@/hooks/use-toast";

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
  const [streamDetails, setStreamDetails] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    recipient: "",
    startTime: "",
    stopTime: "",
    depositAmount: ""
  });

  // Load streams
  const loadStreams = async () => {
    if (!isConnected) return;
    
    setIsRefreshing(true);
    try {
      const [sender, recipient] = await Promise.all([
        getSenderStreams(),
        getRecipientStreams()
      ]);
      
      setSenderStreams(sender);
      setRecipientStreams(recipient);
      
      // Load details for all streams
      const allStreams = [...sender, ...recipient];
      const details = await Promise.all(
        allStreams.map(async (streamId) => {
          try {
            const [stream, balance, active] = await Promise.all([
              getStream(streamId),
              getStreamBalance(streamId),
              isStreamActive(streamId)
            ]);
            return { streamId, ...stream, balance, active };
          } catch (error) {
            console.error(`Failed to load stream ${streamId}:`, error);
            return null;
          }
        })
      );
      
      setStreamDetails(details.filter(Boolean));
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
      const startTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const stopTime = startTime + (parseInt(createFormData.stopTime) * 3600); // Convert hours to seconds
      
      await createStream(
        createFormData.recipient,
        startTime,
        stopTime,
        createFormData.depositAmount
      );
      
      setCreateFormData({
        recipient: "",
        startTime: "",
        stopTime: "",
        depositAmount: ""
      });
      
      await loadStreams(); // Refresh the list
    } catch (error) {
      console.error("Failed to create stream:", error);
    }
  };

  // Withdraw from stream
  const handleWithdraw = async (streamId: string, amount?: string) => {
    try {
      await withdrawFromStream(streamId, amount);
      await loadStreams(); // Refresh the list
    } catch (error) {
      console.error("Failed to withdraw from stream:", error);
    }
  };

  // Cancel stream
  const handleCancel = async (streamId: string) => {
    try {
      await cancelStream(streamId);
      await loadStreams(); // Refresh the list
    } catch (error) {
      console.error("Failed to cancel stream:", error);
    }
  };

  useEffect(() => {
    loadStreams();
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet to manage payment streams</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Stream Management</h2>
        <Button onClick={loadStreams} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Stream</TabsTrigger>
          <TabsTrigger value="sent">Sent Streams</TabsTrigger>
          <TabsTrigger value="received">Received Streams</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Payment Stream
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStream} className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    value={createFormData.recipient}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="depositAmount">Deposit Amount (ETH)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    step="0.001"
                    value={createFormData.depositAmount}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                    placeholder="1.0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stopTime">Duration (hours)</Label>
                  <Input
                    id="stopTime"
                    type="number"
                    value={createFormData.stopTime}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, stopTime: e.target.value }))}
                    placeholder="24"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Creating..." : "Create Stream"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <div className="space-y-4">
            {senderStreams.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No streams sent yet</p>
                </CardContent>
              </Card>
            ) : (
              streamDetails
                .filter(stream => senderStreams.includes(stream.streamId))
                .map((stream) => (
                  <motion.div
                    key={stream.streamId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">Stream #{stream.streamId.slice(0, 8)}...</h3>
                            <p className="text-sm text-muted-foreground">
                              To: {stream.recipient.slice(0, 6)}...{stream.recipient.slice(-4)}
                            </p>
                          </div>
                          <Badge variant={stream.active ? "default" : "secondary"}>
                            {stream.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Deposit</p>
                            <p className="font-semibold">{stream.deposit} ETH</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Remaining</p>
                            <p className="font-semibold">{stream.balance} ETH</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{parseFloat(stream.deposit) > 0 ? ((parseFloat(stream.deposit) - parseFloat(stream.balance)) / parseFloat(stream.deposit) * 100).toFixed(1) : 0}%</span>
                          </div>
                          <Progress 
                            value={parseFloat(stream.deposit) > 0 ? ((parseFloat(stream.deposit) - parseFloat(stream.balance)) / parseFloat(stream.deposit) * 100) : 0} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(stream.streamId)}
                            disabled={!stream.active}
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
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No streams received yet</p>
                </CardContent>
              </Card>
            ) : (
              streamDetails
                .filter(stream => recipientStreams.includes(stream.streamId))
                .map((stream) => (
                  <motion.div
                    key={stream.streamId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">Stream #{stream.streamId.slice(0, 8)}...</h3>
                            <p className="text-sm text-muted-foreground">
                              From: {stream.sender.slice(0, 6)}...{stream.sender.slice(-4)}
                            </p>
                          </div>
                          <Badge variant={stream.active ? "default" : "secondary"}>
                            {stream.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Deposit</p>
                            <p className="font-semibold">{stream.deposit} ETH</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Available</p>
                            <p className="font-semibold">{stream.balance} ETH</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{parseFloat(stream.deposit) > 0 ? ((parseFloat(stream.deposit) - parseFloat(stream.balance)) / parseFloat(stream.deposit) * 100).toFixed(1) : 0}%</span>
                          </div>
                          <Progress 
                            value={parseFloat(stream.deposit) > 0 ? ((parseFloat(stream.deposit) - parseFloat(stream.balance)) / parseFloat(stream.deposit) * 100) : 0} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleWithdraw(stream.streamId)}
                            disabled={!stream.active || parseFloat(stream.balance) === 0}
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
