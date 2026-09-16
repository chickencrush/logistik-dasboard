(function(root){
  const number=v=>Number.isFinite(Number(v))?Number(v):0;
  const sum=(a,k)=>a.reduce((s,x)=>s+number(x[k]),0);
  function filterOrders(data,month,query){return (data.orders||[]).filter(x=>(month==='all'||x.month===month)&&String(x.outlet).toLowerCase().includes(query.trim().toLowerCase()));}
  function group(a,key){return a.reduce((o,x)=>{const k=typeof key==='function'?key(x):x[key];(o[k]||(o[k]=[])).push(x);return o;},{});}
  function outlets(a){const g=group(a,x=>String(x.outlet).trim());return Object.entries(g).map(([outlet,rows])=>({outlet,orders:rows.length,invoice:sum(rows,'invoice'),paid:sum(rows,'paid'),balance:sum(rows,'invoice')-sum(rows,'paid')})).sort((a,b)=>b.invoice-a.invoice);}
  function monthly(a){return Object.entries(group(a,'month')).sort(([a],[b])=>a.localeCompare(b)).map(([month,rows])=>({month,invoice:sum(rows,'invoice'),paid:sum(rows,'paid')}));}
  function kpi(a){const invoice=sum(a,'invoice'),paid=sum(a,'paid');return {invoice,paid,balance:invoice-paid,orders:a.length,outlets:outlets(a).length,rate:invoice?paid/invoice*100:0};}
  const Core={number,sum,group,outlets,monthly,kpi,filterOrders};root.CC=Core;if(typeof module!=='undefined')module.exports=Core;
})(typeof window==='undefined'?globalThis:window);
