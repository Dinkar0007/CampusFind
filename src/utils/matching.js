function same(a,b) {
  return a && b && a.toLowerCase().trim() === b.toLowerCase().trim();
}
function contains(a,b) {
  if (!a || !b) return false;
  return a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase());
}
function wordSimilarity(a,b) {
  const wa=new Set((a||"").toLowerCase().split(/\W+/).filter(Boolean));
  const wb=new Set((b||"").toLowerCase().split(/\W+/).filter(Boolean));
  if(!wa.size || !wb.size) return 0;
  let common=0;
  wa.forEach(w=>{if(wb.has(w)) common++;});
  return common/Math.max(wa.size,wb.size);
}
function dateClose(a,b) {
  if(!a || !b) return false;
  const diff=Math.abs(new Date(a)-new Date(b))/(1000*60*60*24);
  return diff<=3;
}

export function calculateMatch(lost,found) {
  let score=0;
  const factors=[];
  if(same(lost.category,found.category)){score+=20;factors.push({label:"Category: Match",ok:true});}
  else factors.push({label:"Category: Different",ok:false});
  if(same(lost.colour,found.colour)){score+=15;factors.push({label:"Colour: Match",ok:true});}
  else factors.push({label:"Colour: Different",ok:false});
  if(lost.brand && found.brand && same(lost.brand,found.brand)){score+=10;factors.push({label:"Brand: Match",ok:true});}
  else if(!lost.brand || !found.brand) factors.push({label:"Brand: Not enough data",ok:false});
  else factors.push({label:"Brand: Different",ok:false});
  if(contains(lost.name,found.name)){score+=20;factors.push({label:"Item name: Strong",ok:true});}
  else factors.push({label:"Item name: Different",ok:false});
  const desc=wordSimilarity(lost.description,found.description);
  if(desc>=0.35){score+=15;factors.push({label:"Description: High similarity",ok:true});}
  else if(desc>=0.15){score+=8;factors.push({label:"Description: Some similarity",ok:true});}
  else factors.push({label:"Description: Low similarity",ok:false});
  if(same(lost.location,found.location)){score+=15;factors.push({label:"Location: Strong Match",ok:true});}
  else if(contains(lost.location,found.location)){score+=8;factors.push({label:"Location: Nearby",ok:true});}
  else factors.push({label:"Location: Different",ok:false});
  if(dateClose(lost.date,found.date)){score+=5;factors.push({label:"Date: Close",ok:true});}
  else factors.push({label:"Date: Not close",ok:false});
  return {score:Math.min(100,Math.round(score)),factors};
}