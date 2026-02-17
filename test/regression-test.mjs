#!/usr/bin/env node
import { apiGet, apiPost, apiDelete, encId, runTest } from './test-utils.mjs';

const DIR = import.meta.dirname;

await runTest('seq', DIR, async (ctx) => {
  // Create interaction (container)
  let s = ctx.step('Create interaction');
  let intId;
  try {
    const res = await apiPost('/api/seq/interactions', { name: 'TestInteraction' });
    intId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  // Create sequence diagram
  s = ctx.step('Create sequence diagram');
  let diagramId;
  try {
    const res = await apiPost('/api/seq/diagrams', { name: 'TestSeq', parentId: intId });
    diagramId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  // Create lifelines (parent-scoped under interactions)
  s = ctx.step('Create lifeline (Client)');
  let clientId;
  try {
    const res = await apiPost(`/api/seq/interactions/${encId(intId)}/lifelines`, { diagramId, name: 'Client', x: 100 });
    clientId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create lifeline (Server)');
  let serverId;
  try {
    const res = await apiPost(`/api/seq/interactions/${encId(intId)}/lifelines`, { diagramId, name: 'Server', x: 350 });
    serverId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create lifeline (Database)');
  let dbId;
  try {
    const res = await apiPost(`/api/seq/interactions/${encId(intId)}/lifelines`, { diagramId, name: 'Database', x: 600 });
    dbId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  // Create messages (parent-scoped under interactions)
  s = ctx.step('Create message: Client → Server (request)');
  try {
    await apiPost(`/api/seq/interactions/${encId(intId)}/messages`, { diagramId, source: clientId, target: serverId, name: 'request()', messageSort: 'synchCall', y: 150 });
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create message: Server → Database (query)');
  try {
    await apiPost(`/api/seq/interactions/${encId(intId)}/messages`, { diagramId, source: serverId, target: dbId, name: 'query()', messageSort: 'synchCall', y: 200 });
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create message: Database → Server (result)');
  try {
    await apiPost(`/api/seq/interactions/${encId(intId)}/messages`, { diagramId, source: dbId, target: serverId, name: 'result', messageSort: 'reply', y: 250 });
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create message: Server → Client (response)');
  try {
    await apiPost(`/api/seq/interactions/${encId(intId)}/messages`, { diagramId, source: serverId, target: clientId, name: 'response', messageSort: 'reply', y: 300 });
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  // Combined fragment (parent-scoped)
  s = ctx.step('Create combined fragment (alt)');
  let cfId;
  try {
    const res = await apiPost(`/api/seq/interactions/${encId(intId)}/combined-fragments`, { diagramId, name: 'error handling', interactionOperator: 'alt', x: 80, y: 180, width: 550, height: 140 });
    cfId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  await ctx.exportDiagram(diagramId, 'Export sequence image');

  // Cleanup: snapshot restore handles full cleanup
  s = ctx.step('Delete sequence diagram');
  try {
    await apiDelete(`/api/seq/diagrams/${encId(diagramId)}`);
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }
});
