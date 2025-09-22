const { sequelize, TermsAndConditions, User } = require('../models');

const seedTermsAndConditions = async () => {
  try {
    console.log('🌱 Iniciando seed de términos y condiciones...');

    // Buscar un usuario admin para asignar como creador
    const adminUser = await User.findOne({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      console.log('❌ No se encontró usuario admin. Creando términos sin creador...');
    }

    // Verificar si ya existen términos
    const existingTerms = await TermsAndConditions.findOne();
    if (existingTerms) {
      console.log('✅ Ya existen términos y condiciones en la base de datos');
      return;
    }

    // Crear términos y condiciones iniciales
    const termsContent = `
TÉRMINOS Y CONDICIONES - PLANTA DE AGUA AQUAYARA

1. INFORMACIÓN GENERAL
La presente empresa "Planta de Agua Aquayara" (en adelante "la Empresa") se dedica a la producción, distribución y comercialización de agua purificada y productos relacionados.

2. PRODUCTOS Y SERVICIOS
- Bidón de agua purificada de 20 litros
- Paquete de botellas de agua de 650ml
- Servicios de entrega a domicilio
- Suscripciones mensuales
- Sistema de vales y crédito

3. MODALIDADES DE PAGO
3.1 Contraentrega: Pago al momento de la entrega
3.2 Vales: Sistema de crédito con vales de productos
3.3 Suscripciones: Planes mensuales con descuentos

4. ENTREGAS Y REPARTOS
- Las entregas se realizan en horarios de lunes a sábado de 8:00 AM a 6:00 PM
- El cliente debe estar presente o designar a una persona autorizada
- En caso de ausencia, se coordinará nueva entrega
- Las entregas están sujetas a disponibilidad de repartidores

5. SUSCRIPCIONES
- Los planes de suscripción tienen vigencia mensual
- Los descuentos aplican solo para productos incluidos en el plan
- La suscripción se renueva automáticamente cada mes
- El cliente puede cancelar su suscripción con 48 horas de anticipación

6. VALES Y CRÉDITO
- Los vales tienen una vigencia de 30 días desde su emisión
- Los vales no son reembolsables en efectivo
- Los vales vencidos no pueden ser utilizados
- El sistema de vales está sujeto a aprobación crediticia

7. CALIDAD Y GARANTÍA
- Garantizamos la calidad de nuestros productos
- En caso de productos defectuosos, se realizará el cambio inmediato
- No nos hacemos responsables por daños causados por mal uso del producto

8. PRIVACIDAD Y DATOS PERSONALES
- Respetamos la privacidad de nuestros clientes
- Los datos personales se utilizan únicamente para fines comerciales
- No compartimos información personal con terceros sin autorización

9. MODIFICACIONES
- La Empresa se reserva el derecho de modificar estos términos
- Los cambios serán notificados con 15 días de anticipación
- El uso continuado del servicio implica aceptación de los nuevos términos

10. CONTACTO
Para consultas, reclamos o sugerencias:
- Teléfono: [Número de contacto]
- Email: [Email de contacto]
- Dirección: [Dirección de la empresa]

Fecha de vigencia: ${new Date().toLocaleDateString('es-PE')}
Versión: 1.0
`;

    const terms = await TermsAndConditions.create({
      version: '1.0',
      title: 'Términos y Condiciones - Planta de Agua Aquayara',
      content: termsContent,
      isActive: true,
      effectiveDate: new Date(),
      createdBy: adminUser ? adminUser.id : 1,
      lastModifiedBy: adminUser ? adminUser.id : 1
    });

    console.log('✅ Términos y condiciones creados exitosamente');
    console.log(`📄 ID: ${terms.id}`);
    console.log(`📅 Versión: ${terms.version}`);
    console.log(`📅 Fecha de vigencia: ${terms.effectiveDate.toLocaleDateString('es-PE')}`);

  } catch (error) {
    console.error('❌ Error creando términos y condiciones:', error);
    throw error;
  }
};

module.exports = seedTermsAndConditions;
