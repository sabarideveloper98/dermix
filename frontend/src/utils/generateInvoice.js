import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = async (order, user, logoUrl) => {
    const doc = new jsPDF();

    // --- Fonts & Styles ---
    doc.setFont("helvetica");

    // --- Header ---
    // Company Logo/Name
    try {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = "/src/assets/images/logo/derfix_logo.png";
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const base64Img = canvas.toDataURL("image/png");
        
        // 14 is X, 15 is Y, 45 is width, 18 is height
        doc.addImage(base64Img, 'PNG', 14, 15, 45, 18);
    } catch (e) {
        console.error("Failed to load logo", e);
    }

    // INVOICE Text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.setFont("helvetica", "normal");
    doc.text("INVOICE", 195, 25, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice# ${order.orderNumber || order._id.slice(-6).toUpperCase()}`, 195, 32, { align: "right" });

    doc.setFontSize(9);
    doc.text("Balance Due", 195, 42, { align: "right" });
    doc.setFontSize(12);
    // If Paid, balance due is 0
    const balanceDue = order.paymentStatus === 'Paid' ? "0.00" : order.totalPrice.toFixed(2);
    doc.text(`Rs. ${balanceDue}`, 195, 48, { align: "right" });

    // --- Company Details ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Dermix", 14, 45);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("123 Skin Care Ave, Beauty Park,\nChennai, Tamil Nadu 600001", 14, 50);

    // --- Bill To ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Bill To", 14, 65);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const customerName = order.userId?.name || user?.name || 'Customer';
    doc.text(customerName, 14, 70);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const addr = order.addressId || {};
    const addrLines = [];
    if (addr.street1) addrLines.push(addr.street1);
    if (addr.street2) addrLines.push(addr.street2);
    if (addr.district) addrLines.push(`${addr.district}, ${addr.state || ''} - ${addr.pincode || ''}`);
    doc.text(addrLines.join("\n"), 14, 75);

    doc.setTextColor(0, 0, 0);
    doc.text(`Place Of Supply: ${addr.state || 'N/A'}`, 14, 95);

    // --- Invoice Meta Data (Right Side) ---
    const metaX1 = 135;
    const metaX2 = 195;
    const metaY = 65;
    const lineSpacing = 6;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Invoice Date :", metaX1, metaY, { align: "right" });
    doc.text("Payment Status :", metaX1, metaY + lineSpacing, { align: "right" });
    doc.text("Delivery Status :", metaX1, metaY + lineSpacing * 2, { align: "right" });
    doc.text("Transaction ID :", metaX1, metaY + lineSpacing * 3, { align: "right" });

    doc.setTextColor(0, 0, 0);
    doc.text(new Date(order.createdAt).toLocaleDateString(), metaX2, metaY, { align: "right" });
    doc.text(order.paymentStatus || 'N/A', metaX2, metaY + lineSpacing, { align: "right" });
    doc.text(order.deliveryStatus || 'N/A', metaX2, metaY + lineSpacing * 2, { align: "right" });
    doc.text(order.transactionId || 'N/A', metaX2, metaY + lineSpacing * 3, { align: "right" });

    // --- Table ---
    const tableColumn = ["#", "Item & Description", "Qty", "Rate", "Amount"];
    const tableRows = [];

    let subTotal = 0;

    order.products.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subTotal += itemTotal;
        const productData = [
            index + 1,
            `${item.productId?.name || "Product"}\nSize: ${item.size || "Standard"}`,
            item.quantity,
            item.price.toFixed(2),
            itemTotal.toFixed(2)
        ];
        tableRows.push(productData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 105,
        theme: 'plain',
        headStyles: {
            fillColor: [121, 1, 173],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            textColor: [50, 50, 50],
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            1: { halign: 'left', cellWidth: 80 },
            2: { halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right' }
        },
        didParseCell: function (data) {
            if (data.section === 'head') {
                if (data.column.index === 1) data.cell.styles.halign = 'left';
                if (data.column.index === 3 || data.column.index === 4) data.cell.styles.halign = 'right';
            }
        }
    });

    // --- Totals Section ---
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text("Sub Total", 150, finalY, { align: "right" });
    doc.text("Shipping", 150, finalY + 7, { align: "right" });

    doc.setTextColor(0, 0, 0);
    doc.text(subTotal.toFixed(2), 195, finalY, { align: "right" });
    const shipping = order.totalPrice - subTotal; // Assuming diff is shipping/taxes
    doc.text(shipping > 0 ? shipping.toFixed(2) : "0.00", 195, finalY + 7, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total", 150, finalY + 16, { align: "right" });
    doc.text(order.totalPrice.toFixed(2), 195, finalY + 16, { align: "right" });

    // Grey box for balance due
    doc.setFillColor(245, 245, 245);
    doc.rect(120, finalY + 22, 80, 10, 'F');
    doc.text("Balance Due", 150, finalY + 28, { align: "right" });
    doc.text(balanceDue, 195, finalY + 28, { align: "right" });

    // --- Footer Notes ---
    doc.setFontSize(10);
    doc.text("Notes", 14, finalY + 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Thanks for your business.", 14, finalY + 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Terms & Conditions", 14, finalY + 30);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("All sales are final. Please retain this invoice for your records.", 14, finalY + 36);

    doc.save(`Invoice_${order.orderNumber || order._id}.pdf`);
};
