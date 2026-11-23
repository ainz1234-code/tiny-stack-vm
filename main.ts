import{mkdirSync as M,readdirSync as D,readFileSync as F,writeFileSync as W}from'fs'
// S[op]-48: imm bytes<<3 | pops<<1 | net push; below 0 = no such opcode
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output',S='09Q23456        444444424442444 444             @BB@0           24              2212',
X=(p,q)=>{let n=p.length,s=new Int32Array(256),R=[],m=new Int32Array(256),o=new Uint8Array(65536),l=0,i=0,j=0,c=0,t=0,x,a,b,k,y,z,E=v=>[o.slice(0,l),v]
for(;;){if(t++>999999)return E(10);if(c<0||c>=n)return E(9);x=p[c];k=(S.charCodeAt(x)|0)-48;if(k<0)return E(5);z=c+1+(k>>3);if(z>n)return E(9)
if(j<(k>>1&3))return E(2);if(j+(k&1)>256)return E(3);b=s[j-1];a=s[j-2];if(x>18&x<23&&!b)return E(4);y=z+((p[c+1]|p[c+2]<<8)<<16>>16)
switch(x){case 0:return E(0)
case 1:s[j++]=p[c+1]<<24>>24;break
case 2:s[j++]=p[c+1]|p[c+2]<<8|p[c+3]<<16|p[c+4]<<24;break
case 3:j--;break
case 4:s[j++]=b;break
case 5:s[j-1]=a;s[j-2]=b;break
case 6:s[j++]=a;break
case 7:y=s[j-3];s[j-3]=a;s[j-2]=b;s[j-1]=y;break
case 16:s[--j-1]=a+b;break
case 17:s[--j-1]=a-b;break
case 18:s[--j-1]=Math.imul(a,b);break
case 19:s[--j-1]=a/b;break
case 20:s[--j-1]=a%b;break
case 21:s[--j-1]=(a>>>0)/(b>>>0);break
case 22:s[--j-1]=(a>>>0)%(b>>>0);break
case 23:s[j-1]=-b;break
case 24:s[--j-1]=a&b;break
case 25:s[--j-1]=a|b;break
case 26:s[--j-1]=a^b;break
case 27:s[j-1]=~b;break
case 28:s[--j-1]=a<<b;break
case 29:s[--j-1]=a>>b;break
case 30:s[--j-1]=a>>>b;break
case 32:s[--j-1]=a==b;break
case 33:s[--j-1]=a<b;break
case 34:s[--j-1]=a>>>0<b>>>0;break
case 49:case 50:if(--j,!b==(x<50)){c=y;continue}break
case 48:c=y;continue
case 51:if(R.length>63)return E(7);R.push(z);c=p[c+1]|p[c+2]<<8;continue
case 52:if(!R.length)return E(8);c=R.pop();continue
case 64:if(b>>>0>255)return E(6);s[j-1]=m[b];break
case 65:if(b>>>0>255)return E(6);m[b]=a;j-=2;break
case 80:y=''+b;if(l+y.length>65536)return E(11);for(k of y)o[l++]=k.charCodeAt();j--;break
case 81:if(l>65535)return E(11);o[l++]=b;j--;break
case 82:s[j++]=i<q.length?q[i++]:-1;break
case 83:return E(b&255)}c=z}}
for(const d of D(I)){let[o,e]=X(F(`${I}/${d}/program.bin`),F(`${I}/${d}/input.bin`)),f=O+'/'+d;M(f,{recursive:!0});W(f+'/stdout.bin',o);W(f+'/exit.txt',e+'')}
