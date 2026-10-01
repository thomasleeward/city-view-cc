import {createHash,timingSafeEqual} from 'node:crypto';
export function validBearer(header:string|null,secret:string|undefined){
 if(!secret||secret.length<40||!header?.startsWith('Bearer '))return false;
 return timingSafeEqual(createHash('sha256').update(header.slice(7)).digest(),createHash('sha256').update(secret).digest());
}
