import{mkdirSync as M,readdirSync as D,readFileSync as F,writeFileSync as W}from'fs'
let{MAKEFUN_INPUT_DIR:I='/input',MAKEFUN_OUTPUT_DIR:O='/output'}=process.env,S='09Q23456        444444424442444 444             @BB@0           24              2212'
for(let d of D(I)){let P=I+`/${d}/`,p=F(P+'program.bin'),q=F(P+'input.bin'),n=p.length,s=new Int32Array(512),R=[],o=[],i=0,j=0,c=0,t=0,e=-1,x,a,b,k,u,z
for(;e<0;)if((e=t++>=1e6?10:c<0|c>=n?9:(k=(S.charCodeAt(x=p[c])|0)-48)<0?5:(z=c-~(k>>3))>n?9:j<(k>>1&3)?2:j+(k&1)>256?3:(b=s[j-1],a=s[j-2],u=p[c+1]|p[c+2]<<8,!b&x>18&x<23)?4:-1)<0)if(c=z,x>15&x<35)s[j-=k>>1&3]=[a+b,a-b,Math.imul(a,b),a/b,a%b,(a>>>0)/(b>>>0),(a>>>0)%(b>>>0),-b,a&b,a|b,a^b,~b,a<<b,a>>b,a>>>b,0,a==b,a<b,a>>>0<b>>>0][x-16],j++;else switch(x){case 0:e=0;break
case 1:s[j++]=u<<24>>24;break
case 2:s[j++]=u|p[c-2]<<16|p[c-1]<<24;break
case 3:j--;break
case 4:s[j++]=b;break
case 5:s[j-1]=a;s[j-2]=b;break
case 6:s[j++]=a;break
case 7:s[j-1]=s[j-3];s[j-3]=a;s[j-2]=b;break
case 49:b=!b
case 50:j--;if(!b)break
case 48:c+=u<<16>>16;break
case 51:R.length>63?e=7:(R.push(c),c=u);break
case 52:R.length?c=R.pop():e=8;break
case 64:b>>>0>255?e=6:s[j-1]=s[b+256];break
case 65:j-=2;b>>>0>255?e=6:s[b+256]=a;break
case 80:j--;k=Buffer.from(''+b);o.length+k.length>65536?e=11:o.push(...k);break
case 81:j--;o.length>65535?e=11:o.push(b&255);break
case 82:s[j++]=q[i++]??-1;break
case 83:e=b&255}
d=O+'/'+d;M(d,{recursive:!0});W(d+'/stdout.bin',Buffer.from(o));W(d+'/exit.txt',''+e)}
