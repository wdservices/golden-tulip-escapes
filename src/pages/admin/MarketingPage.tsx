import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Marketing Tools</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
            Create Campaign
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Marketing Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Marketing tools page is under construction. This is a placeholder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
