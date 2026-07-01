import { QueryInterface, QueryTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tenants: any[] = await queryInterface.sequelize.query(
      'SELECT id FROM "Tenants"',
      { type: QueryTypes.SELECT }
    );

    const missingTenants = await queryInterface.sequelize.query(
      `
      SELECT t.id
      FROM "Tenants" t
      LEFT JOIN "Settings" s
        ON s."tenantId" = t.id
       AND s."key" = 'sessionIdleTimeoutMinutes'
      WHERE s.id IS NULL
      ORDER BY t.id
      `,
      { type: QueryTypes.SELECT }
    );

    if (!missingTenants.length) return;

    const maxIdRows: any[] = await queryInterface.sequelize.query(
      'SELECT COALESCE(MAX(id), 0) AS "maxId" FROM "Settings"',
      { type: QueryTypes.SELECT }
    );

    const maxId = Number(maxIdRows?.[0]?.maxId || 0);

    const bulk = (missingTenants as any[]).map((tenant: any, index: number) => ({
      id: maxId + index + 1,
      key: "sessionIdleTimeoutMinutes",
      value: "5",
      tenantId: tenant.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert("Settings", bulk);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("Settings", {
      key: "sessionIdleTimeoutMinutes"
    });
  }
};
