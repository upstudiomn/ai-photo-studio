import type { PrintOption } from "@/types/studio";

export const printOptions: PrintOption[] = [
  {
    id: "digital",
    label: "Digital file",
    description: "Watermark-free final image after payment or admin approval.",
    priceMnt: 15000,
  },
  {
    id: "a4-matte",
    label: "A4 print",
    description: "21 x 29.7 cm premium matte photo paper, pickup or delivery.",
    priceMnt: 39000,
    size: "A4",
    paper: "matte",
  },
  {
    id: "a3-satin",
    label: "A3 print",
    description: "29.7 x 42 cm premium poster, ideal for gifts and wall art.",
    priceMnt: 69000,
    size: "A3",
    paper: "satin",
  },
];
