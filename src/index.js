'use strict';

module.exports = {
  register() {},
  async bootstrap({ strapi }) {
    // Initial configuration seed
    try {
      const config = await strapi.documents('api::configuracion.configuracion').findFirst();
      
      if (!config) {
        await strapi.documents('api::configuracion.configuracion').create({
          data: {
            whatsapp: '5491155555555',
            mensaje_plantilla: 'Hola! Me interesa la experiencia {nombre_viaje}. ¿Está disponible?',
            instagram: 'suspicacias',
            facebook: 'suspicacias.viajes',
          },
          status: 'published',
        });
        console.log('✅ Configuración inicial creada.');
      }
    } catch (err) {
      console.error('❌ Error en seed de configuración:', err.message);
    }

    // Experiencias seed
    try {
      const experiences = await strapi.documents('api::experiencia.experiencia').findMany({
        limit: 1
      });

      if (experiences.length === 0) {
        const mockExps = [
          {
            titulo: "Noche de seducción en Buenos Aires",
            descripcion: "Una velada inolvidable para dos. Cena elegante, paseos por Puerto Madero al anochecer.",
            tipo_experiencia: "couple",
            nivel: "premium",
            precio: 450,
            duracion: "1 noche",
            itinerario: "Cena romántica y alojamiento boutique.",
            kit_incluido: "Vino, chocolates y accesorios sorpresa.",
            activo: true,
          },
          {
            titulo: "Retiro Sensual en Patagonia",
            descripcion: "Tres días de aislamiento total en una cabaña privada con vistas a los glaciares.",
            tipo_experiencia: "intima",
            nivel: "vip",
            precio: 1200,
            duracion: "3 días / 2 noches",
            itinerario: "Spa, masajes y gastronomía de autor.",
            kit_incluido: "Kit relax y aceites esenciales.",
            activo: true,
          }
        ];

        for (const exp of mockExps) {
          await strapi.documents('api::experiencia.experiencia').create({ 
            data: exp,
            status: 'published' 
          });
        }
        console.log('✅ Experiencias iniciales creadas.');
      }
    } catch (err) {
      console.error('❌ Error en seed de experiencias:', err.message);
    }

    // Auto-set public permissions
    try {
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        const permissions = [
          { action: 'api::experiencia.experiencia.find' },
          { action: 'api::experiencia.experiencia.findOne' },
          { action: 'api::configuracion.configuracion.find' },
        ];

        for (const perm of permissions) {
          const exists = await strapi.query('plugin::users-permissions.permission').findOne({
            where: { role: publicRole.id, action: perm.action },
          });

          if (!exists) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: { ...perm, role: publicRole.id },
            });
          }
        }
        console.log('✅ Permisos públicos configurados automáticamente.');
      }
    } catch (err) {
      console.error('❌ Error configurando permisos:', err.message);
    }
  },
};
