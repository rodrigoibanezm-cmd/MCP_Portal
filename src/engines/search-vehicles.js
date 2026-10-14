import { meliGet } from "../services/meli.js";
import { resolveVehicleCategory } from "./resolve-vehicle-category.js";

const norm = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tokens = (s) => norm(s).split(" ").filter(Boolean);
const attr = (x, ids) => x.attributes?.find(a => ids.includes(a.id))?.value_name ?? null;
const numeric = (x) => { const n = Number(String(x ?? "").replace(/[^\d]/g,"")); return n > 0 ? n : null; };
function normalize(item) {
  return {id:item.id,title:item.title,brand:attr(item,["BRAND"]),model:attr(item,["MODEL"]),
    version:attr(item,["TRIM","VERSION"]),year:numeric(attr(item,["VEHICLE_YEAR","YEAR"])),
    km:numeric(attr(item,["KILOMETERS","MILEAGE"])),price:item.price,currency:item.currency_id,url:item.permalink};
}
function comparable(v,c) {
  const t = tokens([v.brand,v.model,v.version,v.title].filter(Boolean).join(" "));
  const year = v.year ?? numeric(v.title?.match(/\b(?:19|20)\d{2}\b/)?.[0]);
  if (c.year && year !== c.year) return false;
  if (!tokens(c.brand).every(w=>t.includes(w))) return false;
  if (!tokens(c.model).every(w=>t.includes(w))) return false;
  if (c.version && !tokens(c.version).every(w=>t.includes(w))) return false;
  return true;
}
function median(values) {
  const s = [...values].sort((a,b)=>a-b), m = Math.floor(s.length/2);
  return s.length%2 ? s[m] : (s[m-1]+s[m])/2;
}
export async function searchVehicles(c={}) {
  const category=await resolveVehicleCategory(), q=[c.brand,c.model,c.year].filter(Boolean).join(" ");
  const seen=new Map(); let queryTotal=null,complete=false;
  for(let page=0;page<(c.max_pages??3);page++){
    const data=await meliGet("/sites/MLC/search",{category,q,limit:50,offset:page*50});
    queryTotal=data.paging?.total??queryTotal;
    const results=data.results??[];
    for(const x of results)if(x.id)seen.set(x.id,normalize(x));
    if(results.length<50 || (queryTotal!=null && (page+1)*50>=queryTotal)){complete=true;break;}
  }
  const exact=[...seen.values()].filter(v=>comparable(v,c));
  const nearby=exact.filter(v=>c.km==null||(v.km!=null&&Math.abs(v.km-c.km)<=Math.max(2500,c.km*.2)));
  const prices=nearby.filter(v=>v.currency==="CLP"&&Number.isFinite(v.price)&&v.price>0);
  const a=prices.map(v=>v.price);
  return {source:"Mercado Libre Chile",query:q,query_ads_total:queryTotal,
    query_total_is_comparable:false,ads_scanned:seen.size,scan_complete:complete,
    matching_version_year:exact.length,matching_km:nearby.length,priced_comparables:a.length,
    median_price_clp:a.length>=3?Math.round(median(a)):null,insufficient_sample:a.length<3,
    ads:prices.slice(0,c.limit??20),matching_ads:exact.slice(0,c.limit??20)};
}
