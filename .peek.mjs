import pg from 'pg';
const c = new pg.Client(process.env.DATABASE_URL);
await c.connect();
for (const t of ['now', 'uses']) {
  const { rows } = await c.query(`select * from ${t} order by sort_order`);
  console.log(`\n${t}:`);
  for (const r of rows) console.log('  ', r.line ?? `${r.label} · ${r.value}`);
}
const { rows: a } = await c.query('select now_updated from about limit 1');
console.log('\nnowUpdated:', a[0]?.now_updated);
const { rows: s } = await c.query("select subject from contact limit 1");
console.log('subject   :', s[0]?.subject);
await c.end();
