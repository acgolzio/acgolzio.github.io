// Utilidades compartilhadas pelas atividades da aula de PLN e Transformers (PPGFIL Unesp)
const COR={navy:'#123B6A',gold:'#A87A36',txt:'#1F2937',azul:'#EEF2F7',verm:'#C2413B',teal:'#1D9E75',cinza:'#9CA3AF',verde:'#1E7B45',creme:'#F7F1E6'};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const fmt=(v,d=2)=>{if(!isFinite(v))return v>0?'∞':'−∞';return Number(v).toFixed(d).replace('.',',').replace('-','−');};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function rng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}

// ---------- texto ----------
const STOP={
 pt:new Set('a à ao aos as às até com como da das de dela dele deles demais depois do dos e é ela elas ele eles em entre era essa esse esta este eu foi for há isso isto já la lhe lhes mais mas me mesmo meu minha muito na nas nem no nos nós num numa o os ou para pela pelas pelo pelos por qual quando que quem se sem ser seu seus só sua suas também te tem têm teu tua um uma umas uns você vocês vos'.split(' ')),
 en:new Set('a about above after again against all am an and any are as at be because been before being below between both but by can did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours out over own same she should so some such than that the their theirs them then there these they this those through to too under until up very was we were what when where which while who whom why will with you your yours'.split(' '))};
function tokenizar(t){return (t.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu)||[]);}
function cosseno(a,b){let s=0,na=0,nb=0;for(let i=0;i<a.length;i++){s+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];}return (na&&nb)?s/Math.sqrt(na*nb):0;}

// ---------- algoritmo de Porter (1980), inglês ----------
const porter=(()=>{const step2={ational:'ate',tional:'tion',enci:'ence',anci:'ance',izer:'ize',bli:'ble',alli:'al',entli:'ent',eli:'e',ousli:'ous',ization:'ize',ation:'ate',ator:'ate',alism:'al',iveness:'ive',fulness:'ful',ousness:'ous',aliti:'al',iviti:'ive',biliti:'ble',logi:'log'};
 const step3={icate:'ic',ative:'',alize:'al',iciti:'ic',ical:'ic',ful:'',ness:''};
 const c='[^aeiou]',v='[aeiouy]',C=c+'[^aeiouy]*',V=v+'[aeiou]*';
 const mgr0=new RegExp('^('+C+')?'+V+C),meq1=new RegExp('^('+C+')?'+V+C+'('+V+')?$'),mgr1=new RegExp('^('+C+')?'+V+C+V+C),s_v=new RegExp('^('+C+')?'+v);
 return function(w){if(w.length<3)return w;let stem,suffix,re,re2,re3,re4;const first=w[0];if(first==='y')w='Y'+w.slice(1);
  re=/^(.+?)(ss|i)es$/;re2=/^(.+?)([^s])s$/;if(re.test(w))w=w.replace(re,'$1$2');else if(re2.test(w))w=w.replace(re2,'$1$2');
  re=/^(.+?)eed$/;re2=/^(.+?)(ed|ing)$/;
  if(re.test(w)){const fp=re.exec(w);if(mgr0.test(fp[1]))w=w.slice(0,-1);}
  else if(re2.test(w)){const fp=re2.exec(w);stem=fp[1];if(s_v.test(stem)){w=stem;re2=/(at|bl|iz)$/;re3=new RegExp('([^aeiouylsz])\\1$');re4=new RegExp('^'+C+v+'[^aeiouwxy]$');
   if(re2.test(w))w+='e';else if(re3.test(w))w=w.slice(0,-1);else if(re4.test(w))w+='e';}}
  re=/^(.+?)y$/;if(re.test(w)){const fp=re.exec(w);if(s_v.test(fp[1]))w=fp[1]+'i';}
  re=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
  if(re.test(w)){const fp=re.exec(w);if(mgr0.test(fp[1]))w=fp[1]+step2[fp[2]];}
  re=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;if(re.test(w)){const fp=re.exec(w);if(mgr0.test(fp[1]))w=fp[1]+step3[fp[2]];}
  re=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;re2=/^(.+?)(s|t)(ion)$/;
  if(re.test(w)){const fp=re.exec(w);if(mgr1.test(fp[1]))w=fp[1];}else if(re2.test(w)){const fp=re2.exec(w);stem=fp[1]+fp[2];if(mgr1.test(stem))w=stem;}
  re=/^(.+?)e$/;if(re.test(w)){const fp=re.exec(w);stem=fp[1];re=new RegExp('^'+C+v+'[^aeiouwxy]$');if(mgr1.test(stem)||(meq1.test(stem)&&!re.test(stem)))w=stem;}
  re=/ll$/;if(re.test(w)&&mgr1.test(w))w=w.slice(0,-1);
  if(first==='y')w='y'+w.slice(1);return w;};})();

// ---------- radicalizador simplificado para o português (inspirado no RSLP, Orengo e Huyck, 2001) ----------
function radicalPT(w){if(w.length<4)return w;const regras=[
 [/(?:amentos?|imentos?|amento|imento)$/,''],[/(?:aç(?:ão|ões)|iç(?:ão|ões))$/,''],[/(?:mente)$/,''],[/(?:idades?)$/,''],[/(?:ismos?|istas?)$/,''],[/(?:áveis|ável|íveis|ível)$/,''],
 [/(?:zinh[oa]s?|inh[oa]s?)$/,''],[/(?:ões|ão)$/,''],[/(?:aríamos|eríamos|iríamos|ássemos|êssemos|íssemos|aremos|eremos|iremos|ariam|eriam|iriam|avam|ávamos|aram|eram|iram|ando|endo|indo|ados?|adas?|idos?|idas?|ava|ar|er|ir|ou|ei|amos|emos|imos)$/,''],
 [/(?:es|s)$/,''],[/(?:[aeo])$/,'']];
 for(let k=0;k<regras.length;k++){const [re,rep]=regras[k];const min=k===8?2:3;if(re.test(w)&&w.replace(re,rep).length>=min){w=w.replace(re,rep);if(k===8)break;}}
 return w;}
const LEMAS={pt:{amei:'amar',amo:'amar',amava:'amar',amou:'amar',é:'ser',era:'ser',foi:'ser',são:'ser',sou:'ser',está:'estar',estava:'estar',incrível:'incrível',incríveis:'incrível',produtos:'produto',melhores:'melhor',melhor:'bom',correndo:'correr',corria:'correr',gatos:'gato',gatas:'gato',visite:'visitar',visitei:'visitar',bancos:'banco',fiz:'fazer',feito:'fazer',tem:'ter',tinha:'ter',vi:'ver',viu:'ver',disse:'dizer',meninas:'menino',menina:'menino',livros:'livro'},
 en:{loved:'love',loves:'love',loving:'love',is:'be',was:'be',were:'be',are:'be',am:'be',better:'good',best:'good',running:'run',ran:'run',runs:'run',amazing:'amazing',products:'product',visited:'visit',visiting:'visit',mice:'mouse',children:'child',went:'go',gone:'go',studies:'study',studying:'study',did:'do',does:'do',had:'have',has:'have'}};
function lema(w,lang){return (LEMAS[lang]&&LEMAS[lang][w])||w;}

// ---------- vetores ----------
function vocabularioDe(docs){const V=[];const idx={};docs.forEach(d=>d.forEach(t=>{if(!(t in idx)){idx[t]=V.length;V.push(t);}}));return {V,idx};}
function tabela(cab,linhas,cls=''){return `<div class="scroll"><table class="${cls}"><tr>${cab.map(c=>`<th>${c}</th>`).join('')}</tr>${linhas.map(l=>`<tr>${l.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;}
function corCalor(v,max){const t=max?Math.max(0,Math.min(1,v/max)):0;const r=Math.round(255-(255-18)*t),g=Math.round(255-(255-59)*t),b=Math.round(255-(255-106)*t);return `background:rgb(${r},${g},${b});color:${t>0.55?'#fff':'#1F2937'}`;}
function matrizHTML(M,rot=[],col=[],d=2,max=null){const mx=max!==null?max:Math.max(...M.flat().map(Math.abs),1e-9);return `<div class="scroll"><table class="hm" style="width:auto">${col.length?`<tr><th></th>${col.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>`:''}${M.map((r,i)=>`<tr>${rot.length?`<th>${esc(rot[i])}</th>`:''}${r.map(v=>`<td style="${corCalor(Math.abs(v),mx)}">${fmt(v,d)}</td>`).join('')}</tr>`).join('')}</table></div>`;}
function softmaxLinha(r,T=1){const m=Math.max(...r.map(x=>x/T));const e=r.map(x=>Math.exp(x/T-m));const s=e.reduce((a,b)=>a+b,0);return e.map(x=>x/s);}
function matmul(A,B){return A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));}
function transp(A){return A[0].map((_,j)=>A.map(r=>r[j]));}
