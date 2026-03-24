import { parseGuideSections, parseOutlineSections, parseChecklistGroups } from '../src/lib/content/parser';

async function main() {
  console.log('--- Validating Guide Sections ---');
  const guides = await parseGuideSections();
  console.log(`Found ${guides.length} guide sections`);
  guides.forEach(g => {
    if (!g.slug || g.slug.startsWith('section-')) console.warn(`Missing mapped slug for: ${g.title}`);
  });

  console.log('\n--- Validating Outline Sections ---');
  const outlines = await parseOutlineSections();
  console.log(`Found ${outlines.length} outline sections`);
  outlines.forEach(o => {
    if (!o.sectionSlug || o.sectionSlug === 'unknown') console.warn(`Missing mapped slug for outline: ${o.title}`);
  });

  console.log('\n--- Validating Checklist Groups ---');
  const groups = await parseChecklistGroups();
  console.log(`Found ${groups.length} checklist groups`);
  let totalTasks = 0;
  groups.forEach(g => {
    totalTasks += g.items.length;
    if (g.items.length === 0) console.warn(`Group ${g.groupCode} (${g.title}) has 0 items!`);
  });
  console.log(`Total checklist items: ${totalTasks}`);

  console.log('\nValidation finished.');
}

// Execute conditionally for tsx / ts-node runner
if (require.main === module) {
  main().catch(console.error);
}
