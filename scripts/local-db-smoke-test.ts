/**
 * Local DB Smoke Test Script
 *
 * Tests local PostgreSQL connection and basic data access.
 * Run: npx tsx scripts/local-db-smoke-test.ts
 */

import { Pool, types } from "pg";

types.setTypeParser(1700, (value) => Number.parseFloat(value));
types.setTypeParser(1114, (value) => new Date(`${value}Z`).toISOString());
types.setTypeParser(1184, (value) => new Date(value).toISOString());

const DATABASE_URL = process.env.LOCAL_DATABASE_URL ?? "postgresql://postgres:Anuka2026anu@localhost:5432/ai_photo_studio_dev";

async function runSmokeTest() {
  console.log("=== Local DB Smoke Test ===\n");

  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    // Test 1: Connection
    console.log("1. Testing DB connection...");
    const client = await pool.connect();
    const result = await client.query("SELECT current_database(), current_user, version()");
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   User: ${result.rows[0].current_user}`);
    console.log(`   Status: OK`);
    client.release();

    // Test 2: Tables exist
    console.log("\n2. Checking tables...");
    const tablesResult = await pool.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `);
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`   Tables found (${tables.length}):`);
    for (const t of tables) {
      console.log(`     - ${t}`);
    }

    const requiredTables = [
      "profiles", "ai_templates", "generation_sessions",
      "uploaded_images", "generated_outputs", "orders",
      "order_items", "payments", "print_jobs", "admin_notes"
    ];
    const missingTables = requiredTables.filter(t => !tables.includes(t));
    if (missingTables.length > 0) {
      console.log(`\n   MISSING TABLES: ${missingTables.join(", ")}`);
      console.log("   Run: local-db/schema.sql");
    } else {
      console.log("   All required tables exist: OK");
    }

    // Test 3: Seed data
    console.log("\n3. Checking seed data (ai_templates)...");
    const templatesResult = await pool.query("select id, slug, title_mn from ai_templates order by created_at");
    console.log(`   Templates count: ${templatesResult.rows.length}`);
    if (templatesResult.rows.length > 0) {
      for (const t of templatesResult.rows.slice(0, 3)) {
        console.log(`     - ${t.slug}: ${t.title_mn}`);
      }
      if (templatesResult.rows.length > 3) {
        console.log(`     ... and ${templatesResult.rows.length - 3} more`);
      }
      console.log("   Seed data: OK");
    } else {
      console.log("   NO TEMPLATES FOUND - Run: local-db/seed_templates.sql");
    }

    // Test 4: Create test session
    console.log("\n4. Testing session creation...");
    const sessionResult = await pool.query(`
      insert into generation_sessions (status)
      values ('draft')
      returning id, status, created_at
    `);
    const sessionId = sessionResult.rows[0].id;
    console.log(`   Created session: ${sessionId}`);
    console.log(`   Status: ${sessionResult.rows[0].status}`);
    console.log("   Session creation: OK");

    // Test 5: Create uploaded image
    console.log("\n5. Testing uploaded image creation...");
    const imageResult = await pool.query(`
      insert into uploaded_images (session_id, file_url, file_path, image_type)
      values ($1, '/uploads/test.jpg', 'source-images/test.jpg', 'source')
      returning id, session_id, file_url
    `, [sessionId]);
    console.log(`   Created image: ${imageResult.rows[0].id}`);
    console.log(`   Linked to session: ${imageResult.rows[0].session_id}`);
    console.log("   Uploaded image creation: OK");

    // Test 6: Create generated output
    console.log("\n6. Testing generated output creation...");
    const outputResult = await pool.query(`
      insert into generated_outputs (session_id, provider, model, preview_url, watermarked_url)
      values ($1, 'mock', 'test-model', '/uploads/preview.jpg', '/uploads/preview.jpg')
      returning id, session_id, provider
    `, [sessionId]);
    console.log(`   Created output: ${outputResult.rows[0].id}`);
    console.log(`   Provider: ${outputResult.rows[0].provider}`);
    console.log("   Generated output creation: OK");

    // Test 7: Create order (checkout simulation)
    console.log("\n7. Testing order creation (checkout simulation)...");
    const outputId = outputResult.rows[0].id;

    const orderResult = await pool.query(`
      insert into orders (session_id, selected_output_id, status, payment_status, customer_name, total_price)
      values ($1, $2, 'pending_payment', 'unpaid', 'Test Customer', 15000)
      returning id, status, payment_status
    `, [sessionId, outputId]);
    const orderId = orderResult.rows[0].id;
    console.log(`   Created order: ${orderId}`);
    console.log(`   Status: ${orderResult.rows[0].status}`);

    const itemResult = await pool.query(`
      insert into order_items (order_id, item_type, title, quantity, unit_price, total_price)
      values ($1, 'digital', 'Digital Download', 1, 15000, 15000)
      returning id
    `, [orderId]);
    console.log(`   Created order item: ${itemResult.rows[0].id}`);

    const paymentResult = await pool.query(`
      insert into payments (order_id, provider, amount, currency, status)
      values ($1, 'manual', 15000, 'MNT', 'pending')
      returning id
    `, [orderId]);
    console.log(`   Created payment: ${paymentResult.rows[0].id}`);

    const printJobResult = await pool.query(`
      insert into print_jobs (order_id, status, print_size, paper_type)
      values ($1, 'print_ready', 'A4', 'premium')
      returning id
    `, [orderId]);
    console.log(`   Created print job: ${printJobResult.rows[0].id}`);
    console.log("   Order creation: OK");

    // Test 8: Read order
    console.log("\n8. Testing order read...");
    const orderDetail = await pool.query(`
      select o.*,
             json_agg(oi.*) as order_items,
             json_agg(p.*) as payments,
             json_agg(pj.*) as print_jobs
      from orders o
      left join order_items oi on oi.order_id = o.id
      left join payments p on p.order_id = o.id
      left join print_jobs pj on pj.order_id = o.id
      where o.id = $1
      group by o.id
    `, [orderId]);
    console.log(`   Read order: ${orderDetail.rows[0].id}`);
    console.log(`   Customer: ${orderDetail.rows[0].customer_name}`);
    console.log(`   Items: ${orderDetail.rows[0].order_items?.length ?? 0}`);
    console.log(`   Payments: ${orderDetail.rows[0].payments?.length ?? 0}`);
    console.log(`   Print jobs: ${orderDetail.rows[0].print_jobs?.length ?? 0}`);
    console.log("   Order read: OK");

    // Test 9: Update session status
    console.log("\n9. Testing session status update...");
    await pool.query(`
      update generation_sessions
      set status = 'template_selected', template_id = $2, updated_at = now()
      where id = $1
    `, [sessionId, templatesResult.rows[0]?.id]);
    const updatedSession = await pool.query("select status, template_id from generation_sessions where id = $1", [sessionId]);
    console.log(`   Session status: ${updatedSession.rows[0].status}`);
    console.log(`   Template linked: ${updatedSession.rows[0].template_id ? "yes" : "no"}`);
    console.log("   Session status update: OK");

    // Cleanup test data
    console.log("\n10. Cleaning up test data...");
    await pool.query("delete from print_jobs where order_id = $1", [orderId]);
    await pool.query("delete from payments where order_id = $1", [orderId]);
    await pool.query("delete from order_items where order_id = $1", [orderId]);
    await pool.query("delete from orders where id = $1", [orderId]);
    await pool.query("delete from generated_outputs where session_id = $1", [sessionId]);
    await pool.query("delete from uploaded_images where session_id = $1", [sessionId]);
    await pool.query("delete from generation_sessions where id = $1", [sessionId]);
    console.log("   Cleanup: OK");

    console.log("\n=== All Tests Passed ===");

  } catch (error) {
    console.error("\n!!! TEST FAILED !!!");
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSmokeTest();
