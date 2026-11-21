// Choice-based, in-session progression for Một Tháng Không Yên.
// XP represents a playful game loop, not a real-world performance assessment.
// It is derived from the campaign's immutable history: no storage and no replay farming.
export const RANKS = Object.freeze([
  {level:1, from:0, title:"Tập đứng quầy"},
  {level:2, from:20, title:"Quầy đã vào nhịp"},
  {level:3, from:60, title:"Gỡ rối gọn ghẽ"},
  {level:4, from:150, title:"Có người giữ quầy"},
  {level:5, from:310, title:"Giữ Yên giờ đông"},
  {level:6, from:560, title:"Vững tay xoay ca"},
  {level:7, from:900, title:"Trái tim quán Yên"}
]);
export const REWARD_BY_RISK = Object.freeze({safe:12,caution:6,hazard:2});
export const RECOVERY_BONUS = 4;

export function rewardFor(record){
  if(!record || !Object.hasOwn(REWARD_BY_RISK,record.risk))
    throw new Error("Unknown campaign decision risk");
  return REWARD_BY_RISK[record.risk]+(record.recovered?RECOVERY_BONUS:0);
}
export function shopProgress(history=[]){
  if(!Array.isArray(history))throw new Error("Campaign history must be a list");
  const xp=history.reduce((total,record)=>total+rewardFor(record),0);
  const rank=RANKS.findLast(item=>xp>=item.from)||RANKS[0];
  const next=RANKS.find(item=>item.from>xp)||null;
  const earned=xp-rank.from;
  const threshold=next?next.from-rank.from:0;
  return {
    xp,level:rank.level,title:rank.title,
    nextLevel:next?.level??null,nextTitle:next?.title??null,
    earned,threshold,remaining:next?next.from-xp:0,
    percent:next?Math.max(0,Math.min(100,Math.round(earned/threshold*100))):100,
    latest:history.length?rewardFor(history.at(-1)):0,
    justLeveled:history.length>0&&
      RANKS.filter(item=>item.level>1).some(item=>xp>=item.from&&xp-rewardFor(history.at(-1))<item.from)
  };
}
