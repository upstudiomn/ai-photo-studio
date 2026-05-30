import { aiTemplates } from "@/lib/templates";
import type { StudioOrder } from "@/types/studio";

const previewOne =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80";
const previewTwo =
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80";
const previewThree =
  "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&w=900&q=80";

export const mockOrders: StudioOrder[] = [
  {
    id: "ord_1001_family",
    customerName: "Enkhjin B.",
    customerPhone: "9911-2233",
    customerEmail: "enkhjin@example.mn",
    customerNote: "Please restore my mother's old photo so it is ready for A3 print.",
    templateId: aiTemplates[0].id,
    status: "preview_ready",
    paymentStatus: "pending",
    printOption: "a3-satin",
    printSize: "A3",
    deliveryAddress: "Ulaanbaatar, Sukhbaatar District, 1st khoroo",
    totalPriceMnt: 69000,
    createdAt: "2026-05-29T04:15:00.000Z",
    uploadedImages: [
      {
        id: "img_source_1",
        fileUrl: previewTwo,
        fileName: "old-family-photo.jpg",
        imageType: "source",
      },
    ],
    generatedOutputs: [
      {
        id: "out_restore_1",
        previewUrl: previewOne,
        watermarkedUrl: previewOne,
        isSelected: true,
      },
      {
        id: "out_restore_2",
        previewUrl: previewThree,
        watermarkedUrl: previewThree,
        isSelected: false,
      },
    ],
    selectedOutputId: "out_restore_1",
  },
  {
    id: "ord_1002_product",
    customerName: "Nara Handmade",
    customerPhone: "8800-1212",
    customerEmail: "sales@nara.mn",
    customerNote: "Need a clean premium background for an Instagram shop.",
    templateId: aiTemplates[4].id,
    status: "ai_processing",
    paymentStatus: "unpaid",
    printOption: "digital",
    totalPriceMnt: 25000,
    createdAt: "2026-05-29T05:20:00.000Z",
    uploadedImages: [
      {
        id: "img_source_2",
        fileUrl:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
        fileName: "product-watch.jpg",
        imageType: "source",
      },
    ],
    generatedOutputs: [],
  },
  {
    id: "ord_1003_portrait",
    customerName: "Ariun D.",
    customerPhone: "9900-7788",
    customerEmail: "ariun@example.mn",
    customerNote: "Clean studio portrait for CV and LinkedIn use.",
    templateId: aiTemplates[3].id,
    status: "waiting_approval",
    paymentStatus: "paid",
    printOption: "digital",
    totalPriceMnt: 29000,
    createdAt: "2026-05-29T06:05:00.000Z",
    uploadedImages: [
      {
        id: "img_source_3",
        fileUrl:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
        fileName: "portrait-reference.jpg",
        imageType: "source",
      },
    ],
    generatedOutputs: [
      {
        id: "out_portrait_1",
        previewUrl:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80",
        watermarkedUrl:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80",
        isSelected: false,
      },
    ],
  },
];

export function getOrderById(id: string) {
  return mockOrders.find((order) => order.id === id);
}

export const mockStats = {
  ordersToday: 12,
  previewsReady: 6,
  paidOrders: 4,
  printQueue: 3,
};
