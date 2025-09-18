import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, ImageIcon, DollarSign, Clock, Info, AlertCircle, Wand2, Sparkles, Loader2, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useWeb3 } from "@/contexts/Web3Context-minimal";
import { useNFTManagement } from "@/hooks/useNFTManagement";
import { useToast } from "@/hooks/use-toast";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

const Upload = () => {
  const { isConnected, account } = useWeb3();
  const { mintNFT, isLoading: isMinting } = useNFTManagement();
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState<string>("");

  // Form data for NFT creation
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    collection: "",
    attributes: [] as Array<{trait_type: string, value: string}>
  });

  // AI Generation form data
  const [aiFormData, setAiFormData] = useState({
    prompt: "",
    style: "realistic",
    quality: "high",
    aspectRatio: "1:1"
  });

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Clean up previous file URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedImage(url);
    
    toast({
      title: "File Uploaded",
      description: `${file.name} has been uploaded successfully`,
    });
  }, [toast, previewUrl]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Simulate AI image generation (replace with actual API call)
  const generateImage = async () => {
    if (!aiFormData.prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for the image you want to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a placeholder image URL (replace with actual AI service)
      const mockImageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: mockImageUrl,
        prompt: aiFormData.prompt,
        timestamp: Date.now()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setSelectedImage(mockImageUrl);
      setGenerationProgress(100);
      
      toast({
        title: "Image Generated!",
        description: "Your AI-generated image is ready",
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      clearInterval(progressInterval);
    }
  };

  // Copy prompt to clipboard
  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(prompt);
    setTimeout(() => setCopiedPrompt(""), 2000);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
  };

  // Remove generated image
  const removeGeneratedImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage === generatedImages.find(img => img.id === id)?.url) {
      setSelectedImage("");
    }
  };

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle NFT minting
  const handleMintNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint an NFT",
        variant: "destructive",
      });
      return;
    }

    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload or generate an image first",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your NFT",
        variant: "destructive",
      });
      return;
    }

    try {
      await mintNFT(
        formData.name,
        formData.description,
        selectedImage,
        JSON.stringify(formData.attributes)
      );

      toast({
        title: "NFT Minted!",
        description: "Your NFT has been successfully minted",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        collection: "",
        attributes: []
      });
      setSelectedImage("");
      setUploadedFile(null);
      setPreviewUrl("");
      setGeneratedImages([]);

    } catch (error) {
      console.error("Failed to mint NFT:", error);
      toast({
        title: "Minting Failed",
        description: "Failed to mint NFT. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Create & Upload NFT
          </h1>
          <p className="text-gray-300 text-lg">
            Upload your own image or generate one with AI, then mint it as an NFT
          </p>
        </motion.div>

        {!isConnected && (
          <Alert className="mb-8 bg-slate-800 border-slate-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-gray-300">
              Please connect your wallet to create and mint NFTs.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upload" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger 
              value="upload" 
              variant="pills"
              icon={<UploadIcon className="w-4 h-4" />}
            >
              Upload Image
            </TabsTrigger>
            <TabsTrigger 
              value="generate" 
              variant="pills"
              icon={<Wand2 className="w-4 h-4" />}
            >
              AI Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <UploadIcon className="w-5 h-5 text-purple-400" />
                    Upload Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? "border-purple-500 bg-purple-500/10" 
                        : "border-purple-500/30 hover:border-purple-500/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2 text-white">Drop your image here</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      or click to browse files
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleFileInputClick}
                      disabled={!isConnected}
                      className="hover:bg-purple-500/10 hover:border-purple-500/50 transition-colors border-slate-600 text-white"
                    >
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Supports JPG, PNG, GIF, WebP up to 10MB
                    </p>
                  </div>

                  {uploadedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-sm font-medium text-white">{uploadedFile.name}</span>
                          <Badge variant="secondary">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedFile(null);
                            setPreviewUrl("");
                            setSelectedImage("");
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Preview Section */}
              <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Generation Form */}
              <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Wand2 className="w-5 h-5 text-pink-400" />
                    AI Image Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="prompt" className="text-white">Describe your image</Label>
                    <Textarea
                      id="prompt"
                      placeholder="A majestic dragon flying over a crystal mountain at sunset, digital art style..."
                      value={aiFormData.prompt}
                      onChange={(e) => setAiFormData({...aiFormData, prompt: e.target.value})}
                      rows={4}
                      disabled={!isConnected}
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="style" className="text-white">Style</Label>
                      <select
                        id="style"
                        value={aiFormData.style}
                        onChange={(e) => setAiFormData({...aiFormData, style: e.target.value})}
                        className="w-full p-2 border rounded-md bg-slate-700 border-slate-600 text-white"
                        disabled={!isConnected}
                      >
                        <option value="realistic">Realistic</option>
                        <option value="artistic">Artistic</option>
                        <option value="cartoon">Cartoon</option>
                        <option value="anime">Anime</option>
                        <option value="abstract">Abstract</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="quality" className="text-white">Quality</Label>
                      <select
                        id="quality"
                        value={aiFormData.quality}
                        onChange={(e) => setAiFormData({...aiFormData, quality: e.target.value})}
                        className="w-full p-2 border rounded-md bg-slate-700 border-slate-600 text-white"
                        disabled={!isConnected}
                      >
                        <option value="standard">Standard</option>
                        <option value="high">High</option>
                        <option value="ultra">Ultra</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="aspectRatio" className="text-white">Aspect Ratio</Label>
                    <select
                      id="aspectRatio"
                      value={aiFormData.aspectRatio}
                      onChange={(e) => setAiFormData({...aiFormData, aspectRatio: e.target.value})}
                      className="w-full p-2 border rounded-md bg-slate-700 border-slate-600 text-white"
                      disabled={!isConnected}
                    >
                      <option value="1:1">Square (1:1)</option>
                      <option value="16:9">Landscape (16:9)</option>
                      <option value="9:16">Portrait (9:16)</option>
                      <option value="4:3">Standard (4:3)</option>
                    </select>
                  </div>

                  <Button 
                    onClick={generateImage}
                    disabled={!isConnected || isGenerating || !aiFormData.prompt.trim()}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">Generating image...</span>
                        <span className="text-white">{Math.round(generationProgress)}%</span>
                      </div>
                      <Progress value={generationProgress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Generated Images Gallery */}
              <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Generated Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    {generatedImages.length === 0 ? (
                      <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No images generated yet</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {generatedImages.map((image) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                              selectedImage === image.url ? 'ring-2 ring-purple-500' : ''
                            }`}
                            onClick={() => setSelectedImage(image.url)}
                          >
                            <img 
                              src={image.url} 
                              alt="Generated" 
                              className="w-full aspect-square object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyPrompt(image.prompt);
                                }}
                              >
                                {copiedPrompt === image.prompt ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGeneratedImage(image.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-xs text-white truncate">{image.prompt}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* NFT Creation Form */}
        {(selectedImage || uploadedFile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Info className="w-5 h-5 text-purple-400" />
                  NFT Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-white">NFT Name *</Label>
                    <Input
                      id="name"
                      placeholder="My Awesome NFT"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isConnected}
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="collection" className="text-white">Collection</Label>
                    <Input
                      id="collection"
                      placeholder="My Collection"
                      value={formData.collection}
                      onChange={(e) => setFormData({...formData, collection: e.target.value})}
                      disabled={!isConnected}
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your NFT..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    disabled={!isConnected}
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-600">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                    disabled={!isConnected}
                    onClick={() => {
                      toast({
                        title: "Save as Draft",
                        description: "Draft saving feature coming soon!",
                      });
                    }}
                  >
                    Save as Draft
                  </Button>
                  <Button 
                    onClick={handleMintNFT}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                    disabled={!isConnected || isMinting || !formData.name.trim()}
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Minting NFT...
                      </>
                    ) : (
                      "Mint NFT"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Upload;
