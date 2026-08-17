// import { DelivaryData } from "@/interface/DelivaryData";

// type RawEntry = Omit<DelivaryData, "images"> & {
//   imagesCount?: number;
//   imageBase?: string;
// };

// const rawData: RawEntry[] = [
//     {
//         delivaryId: 1,
//         name: "John Smith",
//         status: "pending",
//         tripData: {
//             from: "Dhaka",
//             to: "Sylhet",
//             carryWeight: 12,
//             note: "Contains mobile accessories and small gadgets",
//             price: 80,
//             date: "18 Oct, 2025",
//         },
//         imagesCount: 3,
//         imageBase: "watch",
//     },
//     {
//         delivaryId: 2,
//         name: "Sarah Johnson",
//         status: "pending",
//         tripData: {
//             from: "Chittagong",
//             to: "Dhaka",
//             carryWeight: 20,
//             note: "Men's and women's fashion apparel",
//             price: 120,
//             date: "22 Nov, 2025",
//         },
//         imagesCount: 3,
//         imageBase: "watch",
//     },
//     {
//         delivaryId: 3,
//         name: "Michael Chen",
//         status: "pending",
//         tripData: {
//             from: "Khulna",
//             to: "Rajshahi",
//             carryWeight: 8,
//             note: "Dry food and organic items",
//             price: 60,
//             date: "15 Dec, 2025",
//         },
//         imagesCount: 1,
//         imageBase: "food",
//     },
//     {
//         delivaryId: 4,
//         name: "Emily Davis",
//         status: "in-progress",
//         tripData: {
//             from: "Dhaka",
//             to: "Cox's Bazar",
//             carryWeight: 10,
//             note: "Essential medicines and first aid items",
//             price: 100,
//             date: "05 Jan, 2026",
//         },
//         imagesCount: 1,
//         imageBase: "watch",
//     },
//     {
//         delivaryId: 5,
//         name: "Robert Wilson",
//         status: "in-progress",
//         tripData: {
//             from: "Sylhet",
//             to: "Barisal",
//             carryWeight: 5,
//             note: "Gift items and personal letters",
//             price: 50,
//             date: "12 Feb, 2026",
//         },
//         imagesCount: 1,
//         imageBase: "gift",
//     },
//     {
//         delivaryId: 6,
//         name: "Maria Garcia",
//         status: "in-progress",
//         tripData: {
//             from: "Dhaka",
//             to: "Rangpur",
//             carryWeight: 18,
//             note: "Fragile decor items — handle with care",
//             price: 150,
//             date: "28 Mar, 2026",
//         },
//         imagesCount: 1,
//         imageBase: "decor",
//     },
//     {
//         delivaryId: 7,
//         name: "Amina Yusuf",
//         status: "completed",
//         tripData: {
//             from: "Chittagong",
//             to: "Sylhet",
//             carryWeight: 7,
//             note: "Small electronics and chargers",
//             price: 70,
//             date: "10 Apr, 2026",
//         },
//         imagesCount: 2,
//         imageBase: "electronics",
//     },
//     {
//         delivaryId: 8,
//         name: "David Lee",
//         status: "completed",
//         tripData: {
//             from: "Dhaka",
//             to: "Khulna",
//             carryWeight: 3,
//             note: "Books and stationery",
//             price: 30,
//             date: "22 Apr, 2026",
//         },
//         imagesCount: 1,
//         imageBase: "books",
//     },
//     {
//         delivaryId: 9,
//         name: "Fatima Ahmed",
//         status: "completed",
//         tripData: {
//             from: "Rajshahi",
//             to: "Dhaka",
//             carryWeight: 15,
//             note: "Clothing and textiles",
//             price: 95,
//             date: "05 May, 2026",
//         },
//         imagesCount: 3,
//         imageBase: "clothing",
//     },
// ];

// const makeBase = (base: string, fallbackName: string) =>
//   (base || fallbackName.split(" ")[0]).toLowerCase().replace(/[^a-z0-9]+/g, "");

// export const deliveryData: DelivaryData[] = rawData.map((r) => {
//   const base = makeBase(r.imageBase ?? "", r.name);
//   const count = Math.max(1, r.imagesCount ?? 1);
//   const images = Array.from(
//     { length: count },
//     (_, i) => `/carrier/delivaries/${base}${i + 1}.png`
//   );
//   return { ...r, images };
// });
