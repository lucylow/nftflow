import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, ImageIcon, DollarSign, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const Create = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pricePerHour: "",
    image: null,
    collection: "",
    attributes: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating NFT listing:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            List Your NFT for Rent
          </h1>
          <p className="text-muted-foreground text-lg">
            Earn passive income by renting out your valuable NFTs to other users
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">NFT Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Cosmic Wizard #1234"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="collection">Collection</Label>
                    <Input
                      id="collection"
                      placeholder="e.g. Cosmic Wizards"
                      value={formData.collection}
                      onChange={(e) => setFormData({...formData, collection: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your NFT and what makes it special..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-success" />
                    Rental Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price">Price per Hour (STT)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.5"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Recommended: 0.1 - 2.0 STT per hour
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">1 Hour</div>
                      <div className="font-semibold text-success">
                        {formData.pricePerHour || "0"} STT
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">1 Day</div>
                      <div className="font-semibold text-success">
                        {(parseFloat(formData.pricePerHour || "0") * 24).toFixed(2)} STT
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">1 Week</div>
                      <div className="font-semibold text-success">
                        {(parseFloat(formData.pricePerHour || "0") * 24 * 7).toFixed(2)} STT
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-6">
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-accent" />
                    NFT Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Upload NFT Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop or click to upload
                    </p>
                    <Button variant="outline" className="mb-2">
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Supports JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">
                      {formData.name || "NFT Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.collection || "Collection"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        <Clock className="w-3 h-3 mr-1" />
                        {formData.pricePerHour || "0"} STT/hour
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <Button type="button" variant="outline" className="flex-1">
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              List NFT for Rent
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;