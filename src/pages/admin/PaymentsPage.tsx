import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, CreditCard, DollarSign, Building, Loader2, CheckCircle, XCircle, Plus, Banknote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";
import { formatCurrency } from "@/utils/currencyUtils";
import { usePayments } from "@/hooks/usePayments";
import { exportToCsv } from "@/lib/utils";

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
  
  // Get auth context for branch filtering
  const { activeBranchId } = useAuth();
  
  // Use the usePayments hook for branch-filtered payments
  const { payments, isLoading, error } = usePayments();
  
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

  // Export payments to CSV
  const handleExport = () => {
    try {
      if (!payments || payments.length === 0) {
        console.warn('No payments data to export');
        return;
      }
      
      const exportData = payments.map(payment => ({
        'Transaction ID': payment.transactionId,
        'Guest Name': payment.guestName,
        'Guest Email': payment.customerEmail,
        'Amount': formatCurrency(payment.amount),
        'Currency': payment.currency,
        'Date': new Date(payment.date),
        'Status': payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
        'Method': formatMethod(payment.method),
        'Channel': payment.channel,
        'Paystack Transaction ID': payment.paystackTransactionId || 'N/A',
        'Gateway Response': payment.gatewayResponse || 'N/A',
        'Fees': formatCurrency(payment.fees),
        'Receipt URL': payment.receiptUrl || 'N/A'
      }));
      
      exportToCsv(exportData, `payments_export_${new Date().toISOString().split('T')[0]}`);
      console.log('✅ Payments export completed successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // Show error state if there was an error fetching data
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-400">Error loading payment data</h2>
          <p className="text-white/70">{error.message}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/5 border-white/20 text-white hover:bg-yellow-400/10 hover:text-yellow-300 hover:border-yellow-400/30"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-yellow-400 text-blue-900 border-yellow-400 hover:bg-yellow-300">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{formatCurrency(paymentStats.totalRevenue)}</div>
            <p className="text-xs text-white/70">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Payments</CardTitle>
            <Loader2 className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{paymentStats.pendingPayments}</div>
            <p className="text-xs text-white/70">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Successful Transactions</CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{paymentStats.successfulTransactions}</div>
            <p className="text-xs text-white/70">In the last 30 days</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Failed Transactions</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{paymentStats.failedTransactions}</div>
            <p className="text-xs text-white/70">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-white/5 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>
        <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-yellow-400/10 hover:text-yellow-300 hover:border-yellow-400/30">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Payments Table */}
      <div className="rounded-md border border-white/20 bg-white/5">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5 border-white/20">
              <TableHead className="text-white">Transaction ID</TableHead>
              <TableHead className="text-white">Guest</TableHead>
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-white/5 border-white/20">
                <TableCell className="font-medium text-white">{payment.transactionId}</TableCell>
                <TableCell>
                  <div className="text-white">{payment.guestName}</div>
                  <div className="text-sm text-white/70">{payment.customerEmail}</div>
                </TableCell>
                <TableCell className="text-white">{formatCurrency(payment.amount)}</TableCell>
                <TableCell className="text-white">
                  {new Date(payment.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusVariant(payment.status)}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-white">
                    {getMethodIcon(payment.method)}
                    {formatMethod(payment.method)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentsPage;
