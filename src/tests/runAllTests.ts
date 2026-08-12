import { runAuditTestSuite } from './securityAndAudit';
import { runPreventiveMotorTests } from './preventiveMotor.test';

console.log('====================================================');
console.log('  AUTORECORD V2.0 - RUNNING SUITE DE PRUEBAS COMPLETA ');
console.log('====================================================\n');

console.log('--- 1. AUDITORÍA DE SEGURIDAD, AISLAMIENTO Y REGLAS ---');
const auditResults = runAuditTestSuite();
let auditPassed = 0;
auditResults.forEach((t) => {
  if (t.passed) auditPassed++;
  const status = t.passed ? '🟢 PASS' : '🔴 FAIL';
  console.log(`[${status}] ${t.id}: ${t.name}`);
});
console.log(`Auditoría de Seguridad: ${auditPassed}/${auditResults.length} pasados.\n`);

console.log('--- 2. PRUEBAS FUNCIONALES DEL MOTOR PREVENTIVO Y URGENCIAS ---');
const motorResults = runPreventiveMotorTests();
let motorPassed = 0;
motorResults.forEach((r, idx) => {
  if (r.passed) motorPassed++;
  const status = r.passed ? '🟢 PASS' : '🔴 FAIL';
  console.log(`[${status}] #${idx + 1} - ${r.testName}`);
  console.log(`       Esperado: ${r.expected}`);
  console.log(`       Obtenido: ${r.actual}`);
});
console.log(`\nMotor Preventivo: ${motorPassed}/${motorResults.length} pasados.`);

console.log('\n====================================================');
if (auditPassed === auditResults.length && motorPassed === motorResults.length) {
  console.log(' RESULTADO GENERAL: 🟢 TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
} else {
  console.log(' RESULTADO GENERAL: 🔴 ALGUNAS PRUEBAS FALLARON');
}
console.log('====================================================');
