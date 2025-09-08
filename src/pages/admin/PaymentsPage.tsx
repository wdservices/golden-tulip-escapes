import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments & Invoices</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
            Record Payment
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Payments management page is under construction. This is a placeholder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
