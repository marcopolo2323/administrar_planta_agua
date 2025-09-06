import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generar boleta/factura en PDF
export const generateInvoice = async (invoiceData) => {
  const {
    vouchers,
    total,
    paymentMethod,
    clientName,
    clientEmail,
    invoiceNumber,
    date
  } = invoiceData;

  // Crear elemento HTML temporal para la boleta
  const invoiceElement = document.createElement('div');
  invoiceElement.style.cssText = `
    width: 800px;
    padding: 40px;
    background: white;
    font-family: Arial, sans-serif;
    color: #333;
  `;

  invoiceElement.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 28px;">AGUA PURA</h1>
      <p style="margin: 5px 0; color: #666;">Sistema de Gestión de Agua</p>
      <p style="margin: 5px 0; color: #666;">Boleta de Venta #${invoiceNumber}</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="color: #2563eb; margin-bottom: 15px;">Información del Cliente</h2>
      <p><strong>Cliente:</strong> ${clientName}</p>
      <p><strong>Email:</strong> ${clientEmail}</p>
      <p><strong>Fecha:</strong> ${date}</p>
      <p><strong>Método de Pago:</strong> ${getPaymentMethodText(paymentMethod)}</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="color: #2563eb; margin-bottom: 15px;">Detalle de Vales</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Vale #</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Producto</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Cantidad</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;">Precio Unit.</th>
            <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${vouchers.map(voucher => `
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 12px;">#${voucher.id}</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px;">${voucher.product?.name || 'N/A'}</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">${voucher.quantity}</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;">S/ ${parseFloat(voucher.unitPrice || 0).toFixed(2)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: right;">S/ ${parseFloat(voucher.totalAmount || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="text-align: right; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
      <div style="font-size: 18px; font-weight: bold; color: #2563eb;">
        TOTAL: S/ ${total.toFixed(2)}
      </div>
    </div>

    <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
      <p>¡Gracias por tu compra!</p>
      <p>Este documento es tu comprobante de pago.</p>
      <p>Para consultas: contacto@aguapura.com</p>
    </div>
  `;

  // Agregar al DOM temporalmente
  document.body.appendChild(invoiceElement);

  try {
    // Generar PDF
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Descargar PDF
    pdf.save(`boleta_${invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`);

  } finally {
    // Limpiar elemento temporal
    document.body.removeChild(invoiceElement);
  }
};

// Obtener texto del método de pago
const getPaymentMethodText = (method) => {
  switch (method) {
    case 'card': return 'Tarjeta de Crédito/Débito';
    case 'yape': return 'Yape';
    case 'cash': return 'Efectivo';
    default: return 'No especificado';
  }
};

// Generar número de boleta único
export const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `BP${year}${month}${day}${random}`;
};
