import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BranchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branches Management</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
            Add Branch
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Branches management page is under construction. This is a placeholder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
