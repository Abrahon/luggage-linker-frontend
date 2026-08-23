import jsPDF from "jspdf";

export interface ModernInvoiceData {
  id: string;
  tracking_number: string;
  package_title: string;
  package_image?: string;
  trip_title?: string;

  sender_name: string;
  sender_email: string;
  sender_profile_picture?: string;

  traveler_name?: string;
  traveler_email: string;

  route: {
    from_country: string;
    from_city: string;
    to_country: string;
    to_city: string;
  };

  status: string;
  payment_status: string;
  escrow_status: string;

  agreed_reward: string | number;
  currency: string;
  agreed_weight_kg: string | number;

  created_at: string;
  updated_at?: string;

  platform_fee?: string | number;
  vat_tax?: string | number;
  total_paid?: string | number;
}

// ============================================================
// HELPERS
// ============================================================

const toNumber = (
  value: string | number | undefined
): number => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : value;
  }

  const parsed = parseFloat(value || "0");

  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatMoney = (
  value: string | number | undefined,
  currency: string
): string => {
  const amount = toNumber(value);

  const symbol =
    currency === "USD"
      ? "$"
      : currency;

  return `${symbol} ${amount.toFixed(2)}`;
};

const formatDate = (
  value?: string
): string => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};

const formatStatus = (
  value?: string
): string => {
  if (!value) return "N/A";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const truncate = (
  value: string | undefined,
  maxLength: number
): string => {
  if (!value) return "";

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.substring(
    0,
    maxLength - 3
  )}...`;
};

// ============================================================
// GENERATE INVOICE
// ============================================================

export const generateInvoicePdfDoc = (
  data: ModernInvoiceData
): jsPDF => {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  // ============================================================
  // PAGE
  // ============================================================

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const margin = 13;

  const contentWidth =
    pageWidth - margin * 2;

  // ============================================================
  // COLORS
  // ============================================================

  const primary = [79, 70, 229];

  const primaryDark = [55, 48, 163];

  const dark = [15, 23, 42];

  const text = [51, 65, 85];

  const muted = [100, 116, 139];

  const border = [226, 232, 240];

  const background = [248, 250, 252];

  const white = [255, 255, 255];

  const success = [16, 185, 129];

  const successBg = [236, 253, 245];

  // ============================================================
  // HELPERS
  // ============================================================

  const setTextColor = (
    color: number[]
  ) => {
    doc.setTextColor(
      color[0],
      color[1],
      color[2]
    );
  };

  const setFillColor = (
    color: number[]
  ) => {
    doc.setFillColor(
      color[0],
      color[1],
      color[2]
    );
  };

  const setDrawColor = (
    color: number[]
  ) => {
    doc.setDrawColor(
      color[0],
      color[1],
      color[2]
    );
  };

  const drawLabel = (
    label: string,
    x: number,
    y: number
  ) => {
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(6.8);

    setTextColor(muted);

    doc.text(
      label.toUpperCase(),
      x,
      y
    );
  };

  const drawDivider = (
    y: number
  ) => {
    setDrawColor(border);

    doc.setLineWidth(0.25);

    doc.line(
      margin,
      y,
      pageWidth - margin,
      y
    );
  };

  const drawCard = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill = white
  ) => {
    setFillColor(fill);

    setDrawColor(border);

    doc.setLineWidth(0.25);

    doc.roundedRect(
      x,
      y,
      width,
      height,
      2.5,
      2.5,
      "FD"
    );
  };

  // ============================================================
  // FINANCIAL DATA
  // ============================================================

  const reward = toNumber(
    data.agreed_reward
  );

  const weight = toNumber(
    data.agreed_weight_kg
  );

  // Reward per KG
  const pricePerKg =
    weight > 0
      ? reward / weight
      : 0;

  const platformFee =
    data.platform_fee !== undefined
      ? toNumber(data.platform_fee)
      : reward * 0.1;

  const vatTax =
    data.vat_tax !== undefined
      ? toNumber(data.vat_tax)
      : reward * 0.05;

  const calculatedTotal =
    reward +
    platformFee +
    vatTax;

  const totalPaid =
    data.total_paid !== undefined
      ? toNumber(data.total_paid)
      : calculatedTotal;

  // ============================================================
  // HEADER
  // ============================================================

  const headerY = 10;

  const headerH = 43;

  setFillColor(primary);

  doc.roundedRect(
    margin,
    headerY,
    contentWidth,
    headerH,
    4,
    4,
    "F"
  );

  const centerX =
    pageWidth / 2;

  // ------------------------------------------------------------
  // BRAND
  // ------------------------------------------------------------

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(18);

  setTextColor(white);

  doc.text(
    "LUGGAGELINKER",
    centerX,
    headerY + 12,
    {
      align: "center",
    }
  );

  // ------------------------------------------------------------
  // INVOICE TITLE
  // ------------------------------------------------------------

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  setTextColor([
    224,
    231,
    255,
  ]);

  doc.text(
    "Official Delivery Invoice",
    centerX,
    headerY + 20,
    {
      align: "center",
    }
  );

  // ------------------------------------------------------------
  // DESCRIPTION
  // ------------------------------------------------------------

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(7.5);

  setTextColor([
    199,
    210,
    254,
  ]);

  doc.text(
    "Peer-to-Peer Logistics & Parcel Delivery Network",
    centerX,
    headerY + 27,
    {
      align: "center",
    }
  );

  // ============================================================
  // INVOICE BADGE
  // ============================================================

  setFillColor(white);

  doc.roundedRect(
    pageWidth - margin - 39,
    headerY + 5,
    31,
    8,
    4,
    4,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(6.5);

  setTextColor(primaryDark);

  doc.text(
    "INVOICE",
    pageWidth - margin - 23.5,
    headerY + 10.3,
    {
      align: "center",
    }
  );

  // ------------------------------------------------------------
  // PAYMENT STATUS BADGE
  // ------------------------------------------------------------

  setFillColor(successBg);

  doc.roundedRect(
    pageWidth - margin - 39,
    headerY + 30,
    31,
    7,
    3.5,
    3.5,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(5.8);

  setTextColor(success);

  doc.text(
    formatStatus(
      data.payment_status
    ).toUpperCase(),
    pageWidth - margin - 23.5,
    headerY + 34.6,
    {
      align: "center",
    }
  );

  // ============================================================
  // META INFORMATION
  // ============================================================

  let y = 60;

  const metaWidth =
    contentWidth / 3;

  const meta1 = margin;

  const meta2 =
    margin + metaWidth;

  const meta3 =
    margin +
    metaWidth * 2;

  // First row

  drawLabel(
    "Invoice Number",
    meta1,
    y
  );

  drawLabel(
    "Issue Date",
    meta2,
    y
  );

  drawLabel(
    "Tracking Number",
    meta3,
    y
  );

  y += 5;

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8.5);

  setTextColor(dark);

  doc.text(
    `INV-${data.tracking_number.replace(
      /^LL-/,
      ""
    )}`,
    meta1,
    y
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    formatDate(data.created_at),
    meta2,
    y
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    truncate(
      data.tracking_number,
      22
    ),
    meta3,
    y
  );

  // Second row

  y += 7;

  drawLabel(
    "Transaction ID",
    meta1,
    y
  );

  drawLabel(
    "Booking Status",
    meta2,
    y
  );

  drawLabel(
    "Escrow Status",
    meta3,
    y
  );

  y += 5;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  setTextColor(text);

  doc.text(
    truncate(data.id, 22),
    meta1,
    y
  );

  doc.text(
    formatStatus(data.status),
    meta2,
    y
  );

  doc.text(
    formatStatus(
      data.escrow_status
    ),
    meta3,
    y
  );

  y += 6;

  drawDivider(y);

  // ============================================================
  // SENDER / TRAVELER
  // ============================================================

  y += 6;

  const cardGap = 5;

  const participantWidth =
    (contentWidth - cardGap) / 2;

  const participantHeight = 34;

  // ------------------------------------------------------------
  // SENDER
  // ------------------------------------------------------------

  drawCard(
    margin,
    y,
    participantWidth,
    participantHeight,
    background
  );

  drawLabel(
    "Sender",
    margin + 6,
    y + 7
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9.5);

  setTextColor(dark);

  doc.text(
    truncate(
      data.sender_name,
      28
    ),
    margin + 6,
    y + 15
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(7.2);

  setTextColor(muted);

  doc.text(
    truncate(
      data.sender_email,
      36
    ),
    margin + 6,
    y + 21
  );

  doc.text(
    `${data.route.from_city}, ${data.route.from_country}`,
    margin + 6,
    y + 28
  );

  // ------------------------------------------------------------
  // TRAVELER
  // ------------------------------------------------------------

  const travelerX =
    margin +
    participantWidth +
    cardGap;

  drawCard(
    travelerX,
    y,
    participantWidth,
    participantHeight,
    background
  );

  drawLabel(
    "Traveler",
    travelerX + 6,
    y + 7
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9.5);

  setTextColor(dark);

  doc.text(
    truncate(
      data.traveler_name ||
        data.trip_title ||
        "Verified Traveler",
      28
    ),
    travelerX + 6,
    y + 15
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(7.2);

  setTextColor(muted);

  doc.text(
    truncate(
      data.traveler_email,
      36
    ),
    travelerX + 6,
    y + 21
  );

  doc.text(
    `${data.route.to_city}, ${data.route.to_country}`,
    travelerX + 6,
    y + 28
  );

  // ============================================================
  // ROUTE
  // ============================================================

  y += 41;

  drawLabel(
    "Shipment Route",
    margin,
    y
  );

  y += 4;

  const routeHeight = 22;

  drawCard(
    margin,
    y,
    contentWidth,
    routeHeight
  );

  // ------------------------------------------------------------
  // ORIGIN
  // ------------------------------------------------------------

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  setTextColor(dark);

  doc.text(
    `${data.route.from_city}, ${data.route.from_country}`,
    margin + 7,
    y + 9
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(6.5);

  setTextColor(muted);

  doc.text(
    "ORIGIN",
    margin + 7,
    y + 15
  );

  // ------------------------------------------------------------
  // ARROW
  // ------------------------------------------------------------

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(12);

  setTextColor(primary);

  doc.text(
    "→",
    centerX,
    y + 11,
    {
      align: "center",
    }
  );

  // ------------------------------------------------------------
  // DESTINATION
  // ------------------------------------------------------------

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  setTextColor(dark);

  doc.text(
    `${data.route.to_city}, ${data.route.to_country}`,
    pageWidth - margin - 7,
    y + 9,
    {
      align: "right",
    }
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(6.5);

  setTextColor(muted);

  doc.text(
    "DESTINATION",
    pageWidth - margin - 7,
    y + 15,
    {
      align: "right",
    }
  );

  // ============================================================
  // SHIPMENT DETAILS
  // ============================================================

  y += 31;

  drawLabel(
    "Shipment Details",
    margin,
    y
  );

  y += 4;

  const shipmentHeight = 25;

  drawCard(
    margin,
    y,
    contentWidth,
    shipmentHeight
  );

  // Four columns

  const shipmentCol1 =
    margin + 7;

  const shipmentCol2 =
    margin + 70;

  const shipmentCol3 =
    margin + 108;

  const shipmentCol4 =
    margin + 146;

  // ------------------------------------------------------------
  // PACKAGE
  // ------------------------------------------------------------

  drawLabel(
    "Package",
    shipmentCol1,
    y + 7
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8.5);

  setTextColor(dark);

  doc.text(
    truncate(
      data.package_title,
      23
    ),
    shipmentCol1,
    y + 16
  );

  // ------------------------------------------------------------
  // WEIGHT
  // ------------------------------------------------------------

  drawLabel(
    "Weight",
    shipmentCol2,
    y + 7
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8.5);

  setTextColor(dark);

  doc.text(
    `${weight.toFixed(2)} kg`,
    shipmentCol2,
    y + 16
  );

  // ------------------------------------------------------------
  // RATE / KG
  // ------------------------------------------------------------

  drawLabel(
    "Rate / KG",
    shipmentCol3,
    y + 7
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8.5);

  setTextColor(primary);

  doc.text(
    formatMoney(
      pricePerKg,
      data.currency
    ),
    shipmentCol3,
    y + 16
  );

  // ------------------------------------------------------------
  // DELIVERY STATUS
  // ------------------------------------------------------------

  drawLabel(
    "Delivery Status",
    shipmentCol4,
    y + 7
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(7.5);

  setTextColor(success);

  doc.text(
    truncate(
      formatStatus(data.status),
      14
    ),
    shipmentCol4,
    y + 16
  );

  // ============================================================
  // PAYMENT SUMMARY
  // ============================================================

  y += 31;

  drawLabel(
    "Payment Summary",
    margin,
    y
  );

  y += 4;

  const paymentRowHeight = 9;

  const renderPaymentRow = (
    label: string,
    amount: number,
    rowY: number,
    bold = false
  ) => {
    setFillColor(
      bold
        ? [241, 245, 249]
        : background
    );

    doc.roundedRect(
      margin,
      rowY,
      contentWidth,
      paymentRowHeight,
      1.8,
      1.8,
      "F"
    );

    doc.setFont(
      "helvetica",
      bold
        ? "bold"
        : "normal"
    );

    doc.setFontSize(
      bold ? 8.5 : 8
    );

    setTextColor(
      bold
        ? dark
        : text
    );

    doc.text(
      label,
      margin + 6,
      rowY + 6
    );

    doc.text(
      formatMoney(
        amount,
        data.currency
      ),
      pageWidth - margin - 6,
      rowY + 6,
      {
        align: "right",
      }
    );
  };

  // Reward

  renderPaymentRow(
    "Agreed Delivery Reward",
    reward,
    y
  );

  y += 10;

  // Platform fee

  renderPaymentRow(
    "Platform Service Fee",
    platformFee,
    y
  );

  y += 10;

  // Tax

  renderPaymentRow(
    "Tax & Handling",
    vatTax,
    y
  );

  // ============================================================
  // TOTAL + PAYMENT INFORMATION
  // ============================================================

  y += 13;

  const totalWidth = 78;

  const totalHeight = 24;

  const totalX =
    pageWidth -
    margin -
    totalWidth;

  // ------------------------------------------------------------
  // TOTAL CARD
  // ------------------------------------------------------------

  setFillColor(primary);

  doc.roundedRect(
    totalX,
    y,
    totalWidth,
    totalHeight,
    3,
    3,
    "F"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(6.5);

  setTextColor([
    224,
    231,
    255,
  ]);

  doc.text(
    "TOTAL PAID",
    totalX + 6,
    y + 8
  );

  doc.setFontSize(13);

  setTextColor(white);

  doc.text(
    formatMoney(
      totalPaid,
      data.currency
    ),
    totalX + totalWidth - 6,
    y + 17,
    {
      align: "right",
    }
  );

  // ------------------------------------------------------------
  // PAYMENT INFORMATION
  // ------------------------------------------------------------

  const infoX = margin;

  const infoWidth =
    contentWidth -
    totalWidth -
    5;

  drawCard(
    infoX,
    y,
    infoWidth,
    totalHeight,
    successBg
  );

  drawLabel(
    "Payment Information",
    infoX + 6,
    y + 7
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(7.5);

  setTextColor(success);

  doc.text(
    `Payment: ${formatStatus(
      data.payment_status
    )}`,
    infoX + 6,
    y + 16
  );

  doc.text(
    `Escrow: ${formatStatus(
      data.escrow_status
    )}`,
    infoX + 57,
    y + 16
  );

  // ============================================================
  // FOOTER
  // ============================================================

  const footerY: number =
    pageHeight - 12;

  drawDivider(
    footerY - 8
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(6.8);

  setTextColor(muted);

  doc.text(
    "Thank you for using LuggageLinker.",
    pageWidth / 2,
    footerY - 1,
    {
      align: "center",
    }
  );

  doc.text(
    "support@luggagelinker.com",
    pageWidth / 2,
    footerY + 4,
    {
      align: "center",
    }
  );

  // ============================================================
  // RETURN PDF
  // ============================================================

  return doc;
};