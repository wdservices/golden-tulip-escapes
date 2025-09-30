import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, CreditCard, DollarSign, Building, Loader2, CheckCircle, XCircle, Plus, Banknote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatCurrency } from "@/utils/currencyUtils";


type PaymentStatus = 'successful' | 'pending' | 'failed' | 'refunded';
type PaymentMethod = 'paystack' | 'credit_card' | 'bank_transfer' | 'cash';

interface Payment {
  id: string;
  bookingId: string;
  guestName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  date: string;
  status: PaymentStatus;
  method: PaymentMethod;
  channel: string;
  paystackTransactionId?: number;
  transactionId: string;
  gatewayResponse?: string;
  fees: number;
  receiptUrl?: string;
}

export const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get auth context for branch filtering
  const { activeBranchId } = useAuth();
  
  // Fetch current branch name
  useEffect(() => {
    const fetchBranchName = async () => {
      if (activeBranchId) {
        try {
          const branches = await getBranches();
          const branch = branches.find(b => b.id === activeBranchId);
          if (branch) {
            setCurrentBranchName(branch.name);
          }
        } catch (error) {
          console.error("Error fetching branch name:", error);
        }
      }
    };
    
    fetchBranchName();
  }, [activeBranchId]);
  
  // Fetch real payment data from Firestore
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const paymentsRef = collection(db, 'payments');
        const q = query(paymentsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const paymentsData: Payment[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Convert Firestore Timestamp to ISO string
          const getDateString = (timestamp: any) => {
            if (timestamp && typeof timestamp.toDate === 'function') {
              return timestamp.toDate().toISOString();
            }
            return new Date().toISOString();
          };
          
          const payment: Payment = {
            id: doc.id,
            bookingId: data.bookingId || '',
            guestName: data.customerName || 'Unknown Guest',
            customerEmail: data.customerEmail || '',
            amount: data.amount || 0,
            currency: data.currency || 'NGN',
            date: getDateString(data.createdAt || data.paidAt),
            status: data.status || 'pending',
            method: data.paymentMethod || 'paystack',
            channel: data.channel || 'card',
            paystackTransactionId: data.paystackTransactionId,
            transactionId: data.transactionId || '',
            gatewayResponse: data.gatewayResponse || '',
            fees: data.fees || 0,
          };
          
          paymentsData.push(payment);
        });
        
        setPayments(paymentsData);
        console.log(`Loaded ${paymentsData.length} payments from Firestore`);
        
      } catch (error) {
        console.error('Error fetching payments:', error);
        setError('Failed to load payment data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayments();
  }, []);

  // Calculate payment statistics from real data
  const paymentStats = {
    totalRevenue: payments
      .filter(p => p.status === 'successful')
      .reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    successfulTransactions: payments.filter(p => p.status === 'successful').length,
    failedTransactions: payments.filter(p => p.status === 'failed').length,
  };

  const getStatusVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'successful':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'refunded':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-white border-gray-500/20';
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'paystack':
        return <CreditCard className="h-4 w-4 mr-2" />;
      case 'credit_card':
        return <CreditCard className="h-4 w-4 mr-2" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4 mr-2" />;
      case 'cash':
        return <DollarSign className="h-4 w-4 mr-2" />;
      default:
        return <DollarSign className="h-4 w-4 mr-2" />;
    }
  };

  const formatMethod = (method: PaymentMethod) => {
    return method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-yellow-400">
            {currentBranchName && (
              <span className="flex items-center">
                <span className="mr-2">{currentBranchName}</span>
                <span className="mx-2">-</span>
              </span>
            )}
            Payments
          </h2>
          {currentBranchName && (
            <div className="flex items-center text-sm text-white/70 mb-1">
              <Building className="h-4 w-4 mr-1 text-yellow-400" />
              <span>{currentBranchName}</span>
            </div>
          )}
          <p className="text-white/70">
            Manage all payment transactions and financial records
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-yellow-400/10 hover:text-yellow-300 hover:border-yellow-400/30">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-yellow-400 text-blue-900 border-yellow-400 hover:bg-yellow-300">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>
      
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <CardTitle className="text-lg text-yellow-400">Payment History</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  type="search"
                  placeholder="Search payments..."
                  className="w-full pl-8 sm:w-[250px] bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-yellow-400/10 hover:text-yellow-300 hover:border-yellow-400/30">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
                <p className="text-white/70">Loading payments...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-400 mb-2">Error loading payments</p>
                <p className="text-white/70">{error}</p>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-white/50" />
                <p className="text-white/70">No payments found</p>
                <p className="text-white/50 text-sm">Payments will appear here when customers complete transactions</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Transaction ID</TableHead>
                  <TableHead className="text-white">Booking</TableHead>
                  <TableHead className="text-white">Guest</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Method</TableHead>
                  <TableHead className="text-white">Channel</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Fees</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.filter(payment => 
                  payment.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-white">
                      <div className="text-sm">
                        {payment.transactionId.substring(0, 12)}...
                      </div>
                      {payment.paystackTransactionId && (
                        <div className="text-xs text-white/50">
                          ID: {payment.paystackTransactionId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="text-sm">{payment.bookingId.substring(0, 12)}...</div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="text-sm">{payment.guestName}</div>
                      <div className="text-xs text-white/50">{payment.customerEmail}</div>
                    </TableCell>
                    <TableCell className="text-white">
                      {new Date(payment.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center">
                        {getMethodIcon(payment.method)}
                        <span>{formatMethod(payment.method)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white capitalize">
                      {payment.channel}
                    </TableCell>
                    <TableCell className="text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell className="text-white">
                      {formatCurrency(payment.fees, payment.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusVariant(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="mr-2 text-white hover:text-yellow-400">View</Button>
                    {payment.receiptUrl && (
                      <Button variant="ghost" size="sm" asChild className="text-white hover:text-yellow-400">
                        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                          Receipt
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
               </TableBody>
             </Table>
           )}
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Revenue</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {isLoading ? '...' : formatCurrency(paymentStats.totalRevenue, 'NGN')}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {isLoading ? '...' : paymentStats.pendingPayments}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-400/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Successful Transactions</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {isLoading ? '...' : paymentStats.successfulTransactions}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-400/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Failed Transactions</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {isLoading ? '...' : paymentStats.failedTransactions}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-400/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsPage;
