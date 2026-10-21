const L=require('../lib.cjs'),G=require('../gen.cjs'),H=require('./hybrid.cjs');
const bits=(s,n)=>[...Array(n).keys()].map(j=>((s>>j)&1?'1':'0')).join('');
H['T-Lai'].forEach((lv,i)=>{ const g=G.buildGenerator(lv,'M',1000+i); console.log('B'+(i+1), g.mode);
 for (const f of Object.keys(g.perForm)) { const pf=g.perForm[f]; pf.rows.forEach((r,t)=>console.log('   ',f,(pf.weights[t]*100).toFixed(0)+'%',r.sigs.map(s=>bits(s,f.length)).join(','))); } });
