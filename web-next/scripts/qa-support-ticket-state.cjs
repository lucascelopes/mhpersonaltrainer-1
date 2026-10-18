const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const source=path.resolve(__dirname,'../lib/supportTicketState.ts');
const code=ts.transpileModule(fs.readFileSync(source,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const fixture={exports:{}};
vm.runInThisContext(`(function(exports){${code}\n})`,{filename:source})(fixture.exports);
const {normalizeSupportPriority,resolveSupportStatus,SUPPORT_PRIORITY_LABELS,SUPPORT_STATUS_LABELS}=fixture.exports;
const priorityCases=[['Crítica','critica'],[' CRÍTICA ','critica'],['critica','critica'],['Média','media'],['Alta','alta'],['Baixa','baixa'],[undefined,'baixa']];
const statusCases=[
 [{status:'aberto',resposta:'Previous reply'},'aberto'],
 [{status:'em andamento',resposta:'Work continues'},'em_andamento'],
 [{status:'em_andamento'},'em_andamento'],
 [{status:'respondido',resposta:''},'respondido'],
 [{status:'Resolvido'},'resolvido'],
 [{status:'fechado'},'resolvido'],
 [{resposta:'Legacy team reply'},'respondido'],
 [{resposta:'   '},'aberto'],
];
for(const [input,expected] of priorityCases)assert.equal(normalizeSupportPriority(input),expected);
for(const [input,expected] of statusCases)assert.equal(resolveSupportStatus(input),expected);
assert.equal(SUPPORT_PRIORITY_LABELS.critica,'Crítica');
assert.equal(SUPPORT_STATUS_LABELS.em_andamento,'Em andamento');
console.log(`Passed ${priorityCases.length+statusCases.length+2} support ticket state cases.`);
