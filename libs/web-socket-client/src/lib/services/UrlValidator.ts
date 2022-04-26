export default function (url: string) : boolean {
 if(!url){
   return false;
 }

 if(url.startsWith('http://') || url.startsWith('https://')){
   return true;
 }

 return false;
}
