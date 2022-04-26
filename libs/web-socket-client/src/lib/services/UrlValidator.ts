export default function (url: string) : boolean {
 if(!url){
   throw 'A url is required';
 }

 if(url.startsWith('http://') || url.startsWith('https://')){
   return true;
 }

 throw 'A url must start with http:// or https://';
}
