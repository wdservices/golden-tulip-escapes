import { useState, useEffect } from "react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Image as ImageIcon, Plus, Trash2, Edit, Eye } from "lucide-react";
import { getProxiedUrl } from "@/utils/imageUtils";

interface AdData {
  id: string;
  title: string;
  imageUrl: string;
  text: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdsPage = () => {
  const { queryDocuments, setDocument, deleteDocument } = useDatabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ads, setAds] = useState<AdData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<AdData | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    text: "",
    isActive: false
  });

  useEffect(() => {
    fetchAds();
  }, [queryDocuments]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      console.log("Fetching ads from collection 'ads'...");
      const adsData = await queryDocuments<AdData>("ads");
      console.log("Ads data received:", adsData);
      setAds(adsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load ads.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const now = new Date().toISOString();
      const adData = {
        ...formData,
        createdAt: editingAd ? editingAd.createdAt : now,
        updatedAt: now
      };

      const adId = editingAd ? editingAd.id : `ad_${Date.now()}`;
      await setDocument("ads", adId, adData);
      
      toast({
        title: "Success",
        description: editingAd ? "Ad updated successfully." : "Ad created successfully.",
      });
      
      setFormData({ title: "", imageUrl: "", text: "", isActive: false });
      setShowForm(false);
      setEditingAd(null);
      fetchAds();
    } catch (error) {
      console.error("Error saving ad:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save ad.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    
    try {
      await deleteDocument("ads", adId);
      toast({
        title: "Success",
        description: "Ad deleted successfully.",
      });
      fetchAds();
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete ad.",
      });
    }
  };

  const handleEdit = (ad: AdData) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || "",
      imageUrl: ad.imageUrl || "",
      text: ad.text || "",
      isActive: ad.isActive
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingAd(null);
    setFormData({ title: "", imageUrl: "", text: "", isActive: false });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAd(null);
    setFormData({ title: "", imageUrl: "", text: "", isActive: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {editingAd ? "Edit Ad" : "Create New Ad"}
            </h1>
            <p className="text-muted-foreground text-white/60">
              Configure the popup ad displayed on the main landing page.
            </p>
          </div>
          <Button onClick={handleCancel} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Cancel
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left side - Form */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-white">
            <CardHeader>
              <CardTitle>Ad Configuration</CardTitle>
              <CardDescription className="text-white/60">Set the content for the popup ad.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-mode"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="active-mode" className="text-white">Enable Ad Popup</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Ad Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter ad title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-white">Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    required
                  />
                  <p className="text-xs text-white/60">
                    Provide a direct link to the image you want to display. For Google Drive, use the share link (e.g., https://drive.google.com/file/d/FILE_ID/view)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text" className="text-white">Ad Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Enter the text to display below the image..."
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                  />
                </div>

                <Button type="submit" disabled={saving} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingAd ? "Update Ad" : "Create Ad"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right side - Preview */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-white">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription className="text-white/60">How the ad will appear (approximate).</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-4 rounded-lg bg-transparent">
              <div className="relative w-full rounded-lg overflow-hidden border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-black text-white">
                {formData.title && (
                  <div className="absolute top-0 left-0 right-0 z-10 p-3 text-center bg-gradient-to-b from-black/80 to-transparent">
                    <h3 className="font-bold text-xl text-white drop-shadow-lg">{formData.title}</h3>
                  </div>
                )}
                <img 
                  src={formData.imageUrl ? getProxiedUrl(formData.imageUrl) : "https://placehold.co/600x400/1a1a1a/gold?text=Preview+Image"} 
                  alt="Ad Preview" 
                  className="w-full h-auto max-h-[400px] object-contain bg-gray-900"
                  onError={(e) => {
                    console.error("AdsPage: Preview image failed to load:", formData.imageUrl);
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                  }}
                />
                {formData.text && (
                  <div className="p-4 text-center bg-white text-black">
                    <p className="font-medium text-lg">{formData.text}</p>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Ad Management</h1>
          <p className="text-muted-foreground text-white/60">
            Manage all popup ads displayed on the main landing page.
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-yellow-500 hover:bg-yellow-600 text-black">
          <Plus className="mr-2 h-4 w-4" />
          Add New Ad
        </Button>
      </div>

      <div className="grid gap-4">
        {ads.length === 0 ? (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm text-white">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <ImageIcon className="h-12 w-12 mb-4 text-white/40" />
              <p className="text-white/60">No ads created yet.</p>
              <Button onClick={handleAddNew} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Ad
              </Button>
            </CardContent>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="bg-white/10 border-white/20 backdrop-blur-sm text-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <img
                      src={getProxiedUrl(ad.imageUrl)}
                      alt="Ad"
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/80x80/1a1a1a/gold?text=Ad";
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ad.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                        }`}>
                          {ad.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs text-white/60">
                          Created: {new Date(ad.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-white mb-1">{ad.title}</h3>
                      {ad.text && (
                        <p className="text-white/80 mb-2">{ad.text}</p>
                      )}
                      <p className="text-xs text-white/60 truncate">{ad.imageUrl}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ad)}
                      className="text-white hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ad.id)}
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdsPage;