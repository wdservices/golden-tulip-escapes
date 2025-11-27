import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare } from "lucide-react";
import { collection, getDocs, orderBy, query, limit, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

type FeedbackItem = {
  id: string;
  type: "suggestion" | "complaint" | string;
  message: string;
  userId?: string;
  userEmail?: string;
  status?: "new" | "in-progress" | "resolved" | string;
  createdAt?: any;
};

const statusColor = (s?: string) => {
  switch (s) {
    case "new":
      return "bg-yellow-400/20 text-yellow-300";
    case "in-progress":
      return "bg-[hsl(var(--royal-blue)/0.2)] text-[hsl(var(--royal-blue))]";
    case "resolved":
      return "bg-green-400/20 text-green-300";
    default:
      return "bg-white/10 text-white/70";
  }
};

const typeColor = (t?: string) => {
  switch (t) {
    case "suggestion":
      return "bg-purple-400/20 text-purple-300";
    case "complaint":
      return "bg-red-400/20 text-red-300";
    default:
      return "bg-white/10 text-white/70";
  }
};

export default function FeedbackPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, "feedback"), limit(200));
      try {
        q = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(200));
      } catch (_) {
        // Fallback without order when index/field missing
      }
      const snap = await getDocs(q);
      const rows: FeedbackItem[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      setItems(rows);
    } catch (err: any) {
      console.error("Failed to load feedback:", err);
      toast({ title: "Error", description: "Unable to load feedback", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const statusOk = statusFilter === "all" || (i.status || "new") === statusFilter;
      const typeOk = typeFilter === "all" || (i.type || "").toLowerCase() === typeFilter;
      const term = search.trim().toLowerCase();
      const searchOk = !term || (i.message?.toLowerCase().includes(term) || i.userEmail?.toLowerCase().includes(term));
      return statusOk && typeOk && searchOk;
    });
  }, [items, statusFilter, typeFilter, search]);

  const updateStatus = async (id: string, status: "new" | "in-progress" | "resolved") => {
    try {
      setUpdatingId(id);
      await updateDoc(doc(db, "feedback", id), { status, updatedAt: serverTimestamp() });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      toast({ title: "Updated", description: `Marked as ${status}` });
    } catch (err) {
      console.error("Failed to update status:", err);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5 text-yellow-400" />
            User Feedback
          </CardTitle>
          <CardDescription className="text-white/60">
            Review, filter, and manage feedback submitted from user dashboards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by message or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-white"
            />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className="w-44 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-white/20 text-white border-white/20 hover:bg-white/30" onClick={fetchFeedback}>
              Refresh
            </Button>
          </div>

          <div className="relative w-full overflow-auto">
            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white/70">Type</TableHead>
                  <TableHead className="text-white/70">Message</TableHead>
                  <TableHead className="text-white/70">User</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="flex items-center justify-center gap-2 text-white/70">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading feedback...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-white/70">No feedback found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <Badge className={typeColor(f.type)}>{(f.type || "").toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xl whitespace-pre-wrap break-words">{f.message}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-white/90">{f.userEmail || "unknown"}</div>
                          <div className="text-white/50">{f.userId || "—"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor(f.status)}>{(f.status || "new").toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" className="bg-[hsl(var(--royal-blue))] text-white hover:bg-[hsl(var(--royal-blue-dark))]" disabled={updatingId === f.id} onClick={() => updateStatus(f.id, "in-progress")}>{updatingId === f.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}In Progress</Button>
                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" disabled={updatingId === f.id} onClick={() => updateStatus(f.id, "resolved")}>{updatingId === f.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}Resolve</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
