// Utilidades compartilhadas pelas atividades da aula de 24/11 (PPGFIL Unesp)
const COR={navy:'#123B6A',gold:'#A87A36',txt:'#1F2937',azul:'#EEF2F7',verm:'#C2413B',teal:'#1D9E75',cinza:'#9CA3AF',verde:'#1E7B45'};
const $=s=>document.querySelector(s);
const fmt=(v,d=2)=>Number(v).toFixed(d).replace('.',',').replace('-','−');

// Amplia um dígito 8x8 para NxN (interpolação bilinear) com margem
function ampliar(d8,N=28,pad=4){
  const out=new Float32Array(N*N),S=N-2*pad;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const gx=(x+0.5)*8/S-0.5,gy=(y+0.5)*8/S-0.5;
    const x0=Math.max(0,Math.min(7,Math.floor(gx))),y0=Math.max(0,Math.min(7,Math.floor(gy)));
    const x1=Math.min(7,x0+1),y1=Math.min(7,y0+1),fx=Math.min(1,Math.max(0,gx-x0)),fy=Math.min(1,Math.max(0,gy-y0));
    const v=d8[y0*8+x0]*(1-fx)*(1-fy)+d8[y0*8+x1]*fx*(1-fy)+d8[y1*8+x0]*(1-fx)*fy+d8[y1*8+x1]*fx*fy;
    out[(y+pad)*N+x+pad]=v;
  }
  return out;
}
// Reduz NxN para 8x8 por média de área (para comparar com o conjunto de dados)
function reduzir8(img,N=28,pad=4){
  const S=N-2*pad,o=new Float32Array(64);
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
    let s=0,c=0;
    for(let yy=Math.floor(y*S/8);yy<Math.floor((y+1)*S/8);yy++)for(let xx=Math.floor(x*S/8);xx<Math.floor((x+1)*S/8);xx++){s+=img[(yy+pad)*N+xx+pad];c++;}
    o[y*8+x]=c?s/c:0;
  }
  return o;
}
function dist2(a,b){let s=0;for(let i=0;i<a.length;i++){const d=a[i]-b[i];s+=d*d;}return s;}
function deslocar(img,N,dx,dy){const o=new Float32Array(N*N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sx=x-dx,sy=y-dy;if(sx>=0&&sx<N&&sy>=0&&sy<N)o[y*N+x]=img[sy*N+sx];}return o;}

// Desenha uma imagem em tons de cinza (valores 0..1, 1 = tinta) num canvas
function pintar(cv,img,N,M=N,opts={}){
  const ctx=cv.getContext('2d'),w=cv.width,h=cv.height,cw=w/M,ch=h/N;
  ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
  let mx=opts.max||1,mn=opts.min||0;
  if(opts.auto){mx=-1e9;mn=1e9;for(const v of img){mx=Math.max(mx,v);mn=Math.min(mn,v);}if(mx===mn)mx=mn+1;}
  for(let y=0;y<N;y++)for(let x=0;x<M;x++){
    let v=(img[y*M+x]-mn)/(mx-mn);v=Math.max(0,Math.min(1,v));
    if(opts.div){const t=img[y*M+x]/Math.max(Math.abs(mx),Math.abs(mn));const r=t>0?[194,65,59]:[18,59,106];const a=Math.abs(t);ctx.fillStyle=`rgb(${255-(255-r[0])*a},${255-(255-r[1])*a},${255-(255-r[2])*a})`;}
    else{const g=Math.round(255*(1-v));ctx.fillStyle=`rgb(${g},${g},${g})`;}
    ctx.fillRect(Math.floor(x*cw),Math.floor(y*ch),Math.ceil(cw),Math.ceil(ch));
  }
  if(opts.grade){ctx.strokeStyle='rgba(0,0,0,.08)';ctx.lineWidth=1;for(let i=1;i<M;i++){ctx.beginPath();ctx.moveTo(i*cw,0);ctx.lineTo(i*cw,h);ctx.stroke();}for(let i=1;i<N;i++){ctx.beginPath();ctx.moveTo(0,i*ch);ctx.lineTo(w,i*ch);ctx.stroke();}}
}

// Grade de desenho NxN com mouse ou dedo
function GradeDesenho(cv,N=28,aoMudar=()=>{}){
  const self={img:new Float32Array(N*N),N};
  let desenhando=false;
  function pos(e){const r=cv.getBoundingClientRect();const p=e.touches?e.touches[0]:e;return[(p.clientX-r.left)/r.width*N,(p.clientY-r.top)/r.height*N];}
  function tinta(x,y){
    for(let yy=Math.floor(y-2);yy<=Math.ceil(y+2);yy++)for(let xx=Math.floor(x-2);xx<=Math.ceil(x+2);xx++){
      if(xx<0||yy<0||xx>=N||yy>=N)continue;const d=Math.hypot(xx+0.5-x,yy+0.5-y);const v=Math.max(0,1-d/1.9);
      self.img[yy*N+xx]=Math.min(1,self.img[yy*N+xx]+v*0.9);
    }
  }
  function ev(e){if(!desenhando)return;e.preventDefault();const[x,y]=pos(e);tinta(x,y);self.desenhar();aoMudar();}
  cv.addEventListener('pointerdown',e=>{desenhando=true;cv.setPointerCapture(e.pointerId);ev(e);});
  cv.addEventListener('pointermove',ev);
  cv.addEventListener('pointerup',()=>{desenhando=false;});
  cv.addEventListener('pointercancel',()=>{desenhando=false;});
  self.desenhar=()=>pintar(cv,self.img,N,N,{grade:true});
  self.limpar=()=>{self.img.fill(0);self.desenhar();aoMudar();};
  self.definir=a=>{self.img=Float32Array.from(a);self.desenhar();aoMudar();};
  self.desenhar();
  return self;
}

// Classificador 1-NN sobre os dígitos 8x8 (exclui o índice "excluir")
let _D8=null;
function todos8(){if(!_D8){_D8=[];for(let i=0;i<DIGITOS_LAB.length;i++)_D8.push(digito8(i));}return _D8;}
function vizinhoMaisProximo(v64,excluir=-1){
  let best=1e9,bi=-1;const D=todos8();
  for(let i=0;i<D.length;i++){if(i===excluir)continue;const s=dist2(v64,D[i]);if(s<best){best=s;bi=i;}}
  return {i:bi,rot:rotulo(bi),d:Math.sqrt(best)};
}
