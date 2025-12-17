import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Calendar, Bed, Users, CreditCard, Building2, Megaphone, Settings } from "lucide-react";

const DocumentationPage = () => {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Admin Documentation</h2>
          <p className="text-muted-foreground">
            Technical workflow and user guide for the Golden Tulip Admin Dashboard.
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 h-full pr-4">
        <div className="space-y-6 pb-10">
          
          {/* Introduction */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-yellow-400" />
                Overview
              </CardTitle>
              <CardDescription className="text-gray-300">
                Welcome to the Golden Tulip Admin Dashboard. This platform allows you to manage all aspects of the hotel's operations, including bookings, rooms, clients, payments, and marketing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="leading-7">
                The dashboard is divided into several modules, each accessible from the sidebar. Below you will find detailed instructions on how to use each section.
              </p>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full space-y-4">
            
            {/* Bookings */}
            <AccordionItem value="bookings" className="border border-white/20 rounded-lg bg-white/5 px-4">
              <AccordionTrigger className="text-white hover:text-yellow-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span>Bookings Management</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 space-y-2">
                <p>The Bookings module is the central hub for reservation management.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>View Bookings:</strong> See a list of all current, past, and upcoming bookings.</li>
                  <li><strong>Create Booking:</strong> Manually create a reservation for a client (walk-in or phone).</li>
                  <li><strong>Status Updates:</strong> Change booking status (Confirmed, Checked In, Checked Out, Cancelled).</li>
                  <li><strong>Filtering:</strong> Filter bookings by date, status, or branch.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Rooms */}
            <AccordionItem value="rooms" className="border border-white/20 rounded-lg bg-white/5 px-4">
              <AccordionTrigger className="text-white hover:text-yellow-300">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-green-400" />
                  <span>Rooms Management</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 space-y-2">
                <p>Manage your room inventory and details.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Add/Edit Rooms:</strong> Create new room types or update existing ones (price, amenities, description).</li>
                  <li><strong>Availability:</strong> Check which rooms are available or occupied.</li>
                  <li><strong>Images:</strong> Upload and manage photos for each room type.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Clients */}
            <AccordionItem value="clients" className="border border-white/20 rounded-lg bg-white/5 px-4">
              <AccordionTrigger className="text-white hover:text-yellow-300">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <span>Client Database</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 space-y-2">
                <p>Access and manage customer information.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Client Profiles:</strong> View booking history and personal details.</li>
                  <li><strong>User Management:</strong> Manage system users and their roles (Admin vs. Regular User).</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Payments */}
            <AccordionItem value="payments" className="border border-white/20 rounded-lg bg-white/5 px-4">
              <AccordionTrigger className="text-white hover:text-yellow-300">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-yellow-400" />
                  <span>Payments & Finance</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 space-y-2">
                <p>Track financial transactions and payment statuses.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Transaction Logs:</strong> View all payments (Paystack, Transfer, Cash).</li>
                  <li><strong>Verification:</strong> Verify payments manually if needed.</li>
                  <li><strong>Refunds:</strong> Process or record refunds (if applicable).</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Branches */}
            <AccordionItem value="branches" className="border border-white/20 rounded-lg bg-white/5 px-4">
              <AccordionTrigger className="text-white hover:text-yellow-300">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-400" />
                  <span>Branch Management</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 space-y-2">
                <p>Manage multiple hotel branches if applicable.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Branch Details:</strong> Update address, contact info, and specific settings for each branch.</li>
                  <li><strong>Switching Branches:</strong> Use the top bar selector to switch views between branches.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Ads/Marketing */}
            <AccordionItem value="ads" className="border border-white/20 rounded-lg bg-white/5 px-4">
              <AccordionTrigger className="text-white hover:text-yellow-300">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-red-400" />
                  <span>Ads & Promotions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 space-y-2">
                <p>Control the promotional overlays seen by users.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Create Ads:</strong> Upload images and set titles/descriptions for popups.</li>
                  <li><strong>Active Status:</strong> Toggle which ads are currently live on the site.</li>
                  <li><strong>Scheduling:</strong> (Future feature) Schedule ads for specific dates.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

             {/* Settings */}
             <AccordionItem value="settings" className="border border-white/20 rounded-lg bg-white/5 px-4">
              <AccordionTrigger className="text-white hover:text-yellow-300">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <span>System Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 space-y-2">
                <p>Configure global system preferences.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>General Settings:</strong> Site name, default currency, etc.</li>
                  <li><strong>Notification Settings:</strong> Configure email or SMS alerts.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DocumentationPage;
