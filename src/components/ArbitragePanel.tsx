import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Opportunity = {
  nftContract: string;
  tokenId: string;
  sourceMarket: string;
  sourcePriceWei: string;
  targetMarket: string;
  targetPriceWei: string;
  potentialProfitWei: string;
};

export const ArbitragePanel: React.FC = () => {
  const [ops, setOps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [proposing, setProposing] = useState<string | null>(null);

  const AGENT_API_URL = import.meta.env.VITE_ARBITRAGE_AGENT_URL || "http://localhost:4011";

  const fetchOps = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${AGENT_API_URL}/opportunities`);
      setOps(res.data || []);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOps();
    const interval = setInterval(fetchOps, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const propose = async (opp: Opportunity) => {
    if (!confirm("Propose this arbitrage on-chain? This will create a proposal with a bond.")) return;
    
    setProposing(opp.tokenId);
    try {
      const res = await axios.post(`${AGENT_API_URL}/propose`, opp);
      alert("Proposed successfully! Tx: " + res.data.receipt.transactionHash);
      await fetchOps(); // Refresh
    } catch (err: any) {
      alert("Propose failed: " + (err.response?.data?.error || err.message));
    } finally {
      setProposing(null);
    }
  };

  const formatEther = (wei: string) => {
    return (parseFloat(wei) / 1e18).toFixed(4);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            AI Rental Arbitrage Agent
          </h2>
          <p className="text-slate-300">
            Autonomous detection and execution of NFT rental arbitrage opportunities
          </p>
        </div>
        <Button onClick={fetchOps} disabled={loading} variant="outline">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Refresh
        </Button>
      </div>

      {loading && ops.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        </div>
      ) : ops.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No arbitrage opportunities detected</p>
              <p className="text-slate-500 text-sm mt-2">
                The agent will automatically surface opportunities when available
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ops.map((o, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {truncateAddress(o.nftContract)} #{o.tokenId}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Cross-market arbitrage opportunity
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-700">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {formatEther(o.potentialProfitWei)} ETH profit
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Source Market</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{o.sourceMarket}</Badge>
                        <span className="text-slate-300 font-mono">
                          {formatEther(o.sourcePriceWei)} ETH
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400">Target Market</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{o.targetMarket}</Badge>
                        <span className="text-slate-300 font-mono">
                          {formatEther(o.targetPriceWei)} ETH
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <TrendingUp className="w-4 h-4" />
                      Net profit: <span className="text-green-400 font-semibold">
                        {formatEther(o.potentialProfitWei)} ETH
                      </span>
                    </div>
                    <Button
                      onClick={() => propose(o)}
                      disabled={proposing === o.tokenId}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      {proposing === o.tokenId ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Proposing...
                        </>
                      ) : (
                        <>
                          Propose On-Chain <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
