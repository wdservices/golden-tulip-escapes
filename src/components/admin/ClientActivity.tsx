import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Award, Star, Activity } from "lucide-react";

const activityData = [
  {
    id: 1,
    type: "signup",
    name: "Alex Johnson",
    email: "alex.j@example.com",
    date: "2024-09-09T14:32:00Z",
    points: 500
  },
  {
    id: 2,
    type: "points_earned",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    date: "2024-09-09T12:15:00Z",
    points: 1000
  },
  {
    id: 3,
    type: "review",
    name: "Michael Brown",
    email: "michael.b@example.com",
    date: "2024-09-09T10:45:00Z",
    rating: 5
  },
  {
    id: 4,
    type: "points_redeemed",
    name: "Emily Davis",
    email: "emily.d@example.com",
    date: "2024-09-09T09:20:00Z",
    points: 2000,
    reward: "1 Night Free Stay"
  },
  {
    id: 5,
    type: "signup",
    name: "Robert Wilson",
    email: "robert.w@example.com",
    date: "2024-09-09T08:10:00Z",
    points: 500
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'signup':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case 'points_earned':
      return <Award className="h-4 w-4 text-blue-500" />;
    case 'points_redeemed':
      return <Award className="h-4 w-4 text-purple-500" />;
    case 'review':
      return <Star className="h-4 w-4 text-yellow-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

const getActivityDescription = (activity: any) => {
  switch (activity.type) {
    case 'signup':
      return 'signed up and earned 500 points';
    case 'points_earned':
      return `earned ${activity.points} loyalty points`;
    case 'points_redeemed':
      return `redeemed ${activity.points} points for ${activity.reward}`;
    case 'review':
      return `left a ${activity.rating}-star review`;
    default:
      return 'completed an activity';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

const ClientActivity = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Client Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityData.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {activity.name}
                    <span className="text-muted-foreground font-normal"> {getActivityDescription(activity)}</span>
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.date)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientActivity;
