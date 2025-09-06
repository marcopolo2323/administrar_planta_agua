const { User, Voucher } = require('../models');

// Enviar notificación de pago pendiente
exports.sendPaymentReminder = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Obtener cliente
    const client = await User.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Obtener vales pendientes del cliente
    const pendingVouchers = await Voucher.findAll({
      where: {
        clientId: clientId,
        status: 'delivered'
      },
      include: [
        { model: User, as: 'deliveryPerson', attributes: ['username', 'email'] },
        { model: require('../models').Product, as: 'product', attributes: ['name'] }
      ]
    });

    const totalPending = pendingVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);

    if (pendingVouchers.length === 0) {
      return res.json({
        success: true,
        message: 'No hay vales pendientes para este cliente'
      });
    }

    // Simular envío de email (en producción usaría un servicio como SendGrid, Nodemailer, etc.)
    const emailData = {
      to: client.email,
      subject: 'Recordatorio de Pago - Agua Pura',
      html: generatePaymentReminderEmail(client, pendingVouchers, totalPending)
    };

    console.log('📧 Email de recordatorio enviado:', emailData);

    res.json({
      success: true,
      message: 'Notificación enviada correctamente',
      data: {
        client: client.username,
        email: client.email,
        pendingVouchers: pendingVouchers.length,
        totalAmount: totalPending
      }
    });

  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Enviar notificación de fin de mes a todos los clientes
exports.sendMonthlyReminders = async (req, res) => {
  try {
    // Obtener todos los clientes con vales pendientes
    const clientsWithPendingVouchers = await User.findAll({
      where: { role: 'cliente' },
      include: [
        {
          model: Voucher,
          as: 'clientVouchers',
          where: { status: 'delivered' },
          required: true
        }
      ]
    });

    const results = [];

    for (const client of clientsWithPendingVouchers) {
      const pendingVouchers = await Voucher.findAll({
        where: {
          clientId: client.id,
          status: 'delivered'
        }
      });

      const totalPending = pendingVouchers.reduce((sum, v) => sum + parseFloat(v.totalAmount || 0), 0);

      // Simular envío de email
      const emailData = {
        to: client.email,
        subject: '¡Es fin de mes! - Recordatorio de Pago - Agua Pura',
        html: generateMonthlyReminderEmail(client, pendingVouchers, totalPending)
      };

      console.log('📧 Email de fin de mes enviado:', emailData);

      results.push({
        client: client.username,
        email: client.email,
        pendingVouchers: pendingVouchers.length,
        totalAmount: totalPending
      });
    }

    res.json({
      success: true,
      message: `Notificaciones enviadas a ${results.length} clientes`,
      data: results
    });

  } catch (error) {
    console.error('Error al enviar notificaciones mensuales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Generar HTML para email de recordatorio de pago
const generatePaymentReminderEmail = (client, vouchers, totalAmount) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recordatorio de Pago - Agua Pura</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8fafc; }
        .voucher-item { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb; }
        .total { background: #2563eb; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💧 AGUA PURA</h1>
          <p>Recordatorio de Pago</p>
        </div>
        
        <div class="content">
          <h2>Hola ${client.username},</h2>
          <p>Tienes <strong>${vouchers.length} vales</strong> pendientes de pago por un total de <strong>S/ ${totalAmount.toFixed(2)}</strong>.</p>
          
          <h3>Detalle de Vales Pendientes:</h3>
          ${vouchers.map(voucher => `
            <div class="voucher-item">
              <strong>Vale #${voucher.id}</strong> - ${voucher.product?.name || 'N/A'}<br>
              Cantidad: ${voucher.quantity} | Monto: S/ ${parseFloat(voucher.totalAmount || 0).toFixed(2)}
            </div>
          `).join('')}
          
          <div class="total">
            TOTAL A PAGAR: S/ ${totalAmount.toFixed(2)}
          </div>
          
          <p>Puedes realizar tu pago a través de:</p>
          <ul>
            <li>💳 Tarjeta de crédito/débito en tu cuenta</li>
            <li>📱 Yape</li>
            <li>💰 Efectivo con tu repartidor</li>
          </ul>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/client-dashboard/payments" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
              Pagar Ahora
            </a>
          </p>
        </div>
        
        <div class="footer">
          <p>Este es un recordatorio automático del sistema Agua Pura.</p>
          <p>Para consultas: contacto@aguapura.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generar HTML para email de fin de mes
const generateMonthlyReminderEmail = (client, vouchers, totalAmount) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>¡Es fin de mes! - Agua Pura</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #fef2f2; }
        .alert { background: #fef3cd; border: 1px solid #fde68a; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .total { background: #dc2626; color: white; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 ¡ES FIN DE MES!</h1>
          <p>Recordatorio de Pago - Agua Pura</p>
        </div>
        
        <div class="content">
          <div class="alert">
            <strong>⚠️ Atención:</strong> Es fin de mes y tienes vales pendientes de pago.
          </div>
          
          <h2>Hola ${client.username},</h2>
          <p>Tienes <strong>${vouchers.length} vales</strong> pendientes de pago por un total de <strong>S/ ${totalAmount.toFixed(2)}</strong>.</p>
          
          <div class="total">
            TOTAL A PAGAR: S/ ${totalAmount.toFixed(2)}
          </div>
          
          <p><strong>Es momento de coordinar el pago con tu repartidor:</strong></p>
          <ul>
            <li>💰 Efectivo</li>
            <li>📱 Yape</li>
            <li>💳 Tarjeta</li>
          </ul>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/client-dashboard/payments" 
               style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Ver Mis Pagos
            </a>
          </p>
        </div>
        
        <div class="footer">
          <p>Este es un recordatorio automático del sistema Agua Pura.</p>
          <p>Para consultas: contacto@aguapura.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};