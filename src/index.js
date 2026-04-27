'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Initial configuration seed
    const configExists = await strapi.db.query('api::configuracion.configuracion').findOne();
    if (!configExists) {
      await strapi.service('api::configuracion.configuracion').createOrUpdate({
        data: {
          whatsapp: '5491155555555',
          mensaje_plantilla: 'Hola! Me interesa la experiencia {nombre_viaje}. ¿Está disponible?',
          instagram: 'suspicacias',
          facebook: 'suspicacias.viajes',
        },
      });
      console.log('✅ Configuración inicial creada.');
    }

    // Experiencias seed
    const expCount = await strapi.db.query('api::experiencia.experiencia').count();
    if (expCount === 0) {
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
          publishedAt: new Date(),
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
          publishedAt: new Date(),
        }
      ];

      for (const exp of mockExps) {
        await strapi.service('api::experiencia.experiencia').create({ data: exp });
      }
      console.log('✅ Experiencias iniciales creadas.');
    }

    // Auto-set public permissions for API access
    try {
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

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
    } catch (err) {
      console.error('❌ Error configurando permisos:', err.message);
    }
  },
};
