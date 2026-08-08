

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Calendar, ArrowUpDown, Plane } from "lucide-react";
// import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
// import { SenderCard } from "../card";
// import { SendRequestDialog } from "./SendRequestDialog";
// import { travellerData } from "@/lib/travellerData";
// import { toast } from "sonner";

// // Airport data
// const airports = [
//   { city: "Dhaka", airport: "Hazrat Shahjalal" },
//   { city: "Chittagong", airport: "Shah Amanat" },
//   { city: "Sylhet", airport: "Osmani International" },
//   { city: "London", airport: "Heathrow Airport" },
//   { city: "New York", airport: "JFK Airport" },
//   { city: "Singapore", airport: "Changi Airport" },
//   { city: "Dubai", airport: "Dubai International" },
//   { city: "Tokyo", airport: "Narita International" },
//   { city: "Paris", airport: "Charles de Gaulle" },
//   { city: "Ethiopia", airport: "Addis Ababa" },
//   { city: "Eretria", airport: "Logos Abana" },
// ];

// export const FindTravellers = () => {
//   const [requestDialogOpen, setRequestDialogOpen] = useState(false);
//   const [messageDialogOpen, setMessageDialogOpen] = useState(false);
//   const [feedback, setFeedback] = useState<string>("");

//   // Search field states
//   const [fromInput, setFromInput] = useState("");
//   const [fromCity, setFromCity] = useState("");
//   const [fromAirport, setFromAirport] = useState("");
//   const [showFromDropdown, setShowFromDropdown] = useState(false);

//   const [toInput, setToInput] = useState("");
//   const [toCity, setToCity] = useState("");
//   const [toAirport, setToAirport] = useState("");
//   const [showToDropdown, setShowToDropdown] = useState(false);

//   const [date, setDate] = useState("");
//   const [filteredTravellers, setFilteredTravellers] = useState(travellerData);

//   // Filter airports based on input
//   const getFilteredAirports = (input: string) => {
//     if (!input) return airports;
//     return airports.filter(
//       (airport) =>
//         airport.city.toLowerCase().includes(input.toLowerCase()) ||
//         airport.airport.toLowerCase().includes(input.toLowerCase())
//     );
//   };

//   // Handle "From" selection
//   const handleFromSelect = (city: string, airport: string) => {
//     setFromCity(city);
//     setFromAirport(airport);
//     setFromInput(city);
//     setShowFromDropdown(false);
//   };

//   // Handle "To" selection
//   const handleToSelect = (city: string, airport: string) => {
//     setToCity(city);
//     setToAirport(airport);
//     setToInput(city);
//     setShowToDropdown(false);
//   };

//   // Swap from ↔ to
//   const handleSwap = () => {
//     const tempCity = fromCity;
//     const tempAirport = fromAirport;
//     const tempInput = fromInput;

//     setFromCity(toCity);
//     setFromAirport(toAirport);
//     setFromInput(toInput);

//     setToCity(tempCity);
//     setToAirport(tempAirport);
//     setToInput(tempInput);
//   };

//   // Simple local filter
//   const handleSearch = () => {
//     const filtered = travellerData.filter(
//       (t) =>
//         (!fromCity ||
//           t.tripData.from.toLowerCase().includes(fromCity.toLowerCase())) &&
//         (!toCity ||
//           t.tripData.to.toLowerCase().includes(toCity.toLowerCase())) &&
//         (!date ||
//           (typeof t.tripData.date === "string" &&
//             t.tripData.date.includes(date)))
//     );
//     setFilteredTravellers(filtered);
//   };

//   const handleSend = () => {
//     toast.success("Message Sent successfully!");
//     setMessageDialogOpen(false);
//     setFeedback("");
//   };

//   return (
//     <div className="flex flex-col gap-8 py-16 md:px-6 px-4">
//       <HeadingSection
//         heading="Find Travelers"
//         subheading="Browse available travelers by route & send delivery requests."
//       />

//       {/* 🔍 Search Section - Updated Design */}
//       <div className="w-full max-w-5xl border rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white p-6">
//         <div className="flex flex-col md:flex-row items-end gap-4">
//           {/* From Field */}
//           <div className="flex-1 w-full relative">
//             <Label className="text-sm font-semibold mb-2 block">From</Label>
//             <div className="relative">
//               <Input
//                 type="text"
//                 value={fromInput}
//                 onChange={(e) => {
//                   setFromInput(e.target.value);
//                   setShowFromDropdown(true);
//                 }}
//                 onFocus={() => setShowFromDropdown(true)}
//                 placeholder="Search city..."
//                 className="h-[70px] rounded-xl border-2 border-gray-300 pl-4 pr-4 text-lg font-semibold focus:border-gray-400 focus:ring-0"
//               />
//               {fromCity && (
//                 <div className="absolute bottom-3 left-4 text-xs text-gray-400">
//                   {fromAirport}
//                 </div>
//               )}

//               {/* Dropdown */}
//               {showFromDropdown && (
//                 <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
//                   {getFilteredAirports(fromInput).map((airport) => (
//                     <div
//                       key={airport.city}
//                       onClick={() =>
//                         handleFromSelect(airport.city, airport.airport)
//                       }
//                       className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
//                     >
//                       <div className="flex items-center gap-3">
//                         <Plane className="w-4 h-4 text-gray-400" />
//                         <div>
//                           <div className="font-semibold text-sm">
//                             {airport.city}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {airport.airport}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Swap Button */}
//           <div className="flex items-center justify-center mb-2">
//             <Button
//               type="button"
//               variant="ghost"
//               size="icon"
//               className="rounded-full h-10 w-10 border-2 border-gray-300 hover:bg-gray-100"
//               onClick={handleSwap}
//             >
//               <ArrowUpDown className="w-5 h-5 text-gray-600" />
//             </Button>
//           </div>

//           {/* To Field */}
//           <div className="flex-1 w-full relative">
//             <Label className="text-sm font-semibold mb-2 block">To</Label>
//             <div className="relative">
//               <Input
//                 type="text"
//                 value={toInput}
//                 onChange={(e) => {
//                   setToInput(e.target.value);
//                   setShowToDropdown(true);
//                 }}
//                 onFocus={() => setShowToDropdown(true)}
//                 placeholder="Search city..."
//                 className="h-[70px] rounded-xl border-2 border-gray-300 pl-4 pr-4 text-lg font-semibold focus:border-gray-400 focus:ring-0"
//               />
//               {toCity && (
//                 <div className="absolute bottom-3 left-4 text-xs text-gray-400">
//                   {toAirport}
//                 </div>
//               )}

//               {/* Dropdown */}
//               {showToDropdown && (
//                 <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
//                   {getFilteredAirports(toInput).map((airport) => (
//                     <div
//                       key={airport.city}
//                       onClick={() =>
//                         handleToSelect(airport.city, airport.airport)
//                       }
//                       className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
//                     >
//                       <div className="flex items-center gap-3">
//                         <Plane className="w-4 h-4 text-gray-400" />
//                         <div>
//                           <div className="font-semibold text-sm">
//                             {airport.city}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {airport.airport}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Date Field */}
//           <div className="flex-1 w-full">
//             <Label className="text-sm font-semibold mb-2 block">
//               Departure date
//             </Label>
//             <div className="relative">
//               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//               <Input
//                 type="date"
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//                 className="h-[70px] rounded-xl border-2 border-gray-300 pl-12 pr-4 text-sm focus:border-gray-400 focus:ring-0"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Search Button */}
//         <div className="flex justify-center mt-6">
//           <Button
//             className="font-semibold px-16 py-6 text-lg bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
//             onClick={handleSearch}
//           >
//             Search
//           </Button>
//         </div>
//       </div>

//       {/* ✈️ Results */}
//       <div>
//         <HeadingSection heading="Results" />
//         <div className="grid md:grid-cols-3 gap-4 md:gap-6 my-3">
//           {filteredTravellers.map(
//             ({
//               senderId,
//               name,
//               senderProfileStatus,
//               senderRating,
//               tripData,
//             }) => (
//               <div
//                 className="border rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col gap-3 p-4"
//                 key={senderId}
//               >
//                 <SenderCard
//                   name={name}
//                   status={senderProfileStatus || ""}
//                   rating={senderRating}
//                   from={tripData.from}
//                   to={tripData.to}
//                   date={typeof tripData.date === "string" ? tripData.date : ""}
//                   price={tripData.price || 0}
//                   note={tripData.note}
//                   weight={tripData.carryWeight}
//                 />

//                 {/* Message Dialog */}
//                 <Dialog
//                   open={messageDialogOpen}
//                   onOpenChange={setMessageDialogOpen}
//                 >
//                   <DialogTrigger asChild>
//                     <Button
//                       variant={"outline_black"}
//                       className="font-semibold text-center"
//                     >
//                       Send Message
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="font-montserrat">
//                     <DialogHeader className="font-bold text-xl">
//                       Send Message
//                     </DialogHeader>
//                     <div className="flex flex-col gap-1">
//                       <Label className="text-lg font-semibold">
//                         Write your experience
//                       </Label>
//                       <Textarea
//                         id="Message"
//                         value={feedback}
//                         onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
//                           setFeedback(e.target.value)
//                         }
//                         placeholder="Type a message..."
//                         className="resize-none min-h-[100px]"
//                       />
//                       <div className="flex justify-end">
//                         <Button onClick={handleSend}>Send</Button>
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>

//                 {/* Request Dialog */}
//                 <Dialog
//                   open={requestDialogOpen}
//                   onOpenChange={setRequestDialogOpen}
//                 >
//                   <DialogTrigger asChild>
//                     <Button className="font-semibold text-center">
//                       Send Request
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent>
//                     <DialogHeader>Send Request</DialogHeader>
//                     <SendRequestDialog
//                       date={
//                         typeof tripData.date === "string" ? tripData.date : ""
//                       }
//                       from={tripData.from}
//                       to={tripData.to}
//                       luggageSpace={tripData.carryWeight || 0}
//                       price={tripData.price || 0}
//                       transportType={tripData.transportType || ""}
//                       returnDate={
//                         typeof tripData.returnDate === "string"
//                           ? tripData.returnDate
//                           : ""
//                       }
//                       setOpen={setRequestDialogOpen}
//                       open={requestDialogOpen}
//                     />
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
