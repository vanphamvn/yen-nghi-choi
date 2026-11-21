// VN-F04 #222 · Three linked Day 1 illustrated incident scripts.
// The 30-day catalog still describes future days as planned.
// Illustrated visual novel: backgrounds, painted characters, dialogue and direct story choices.
const coffee="/lab/assets/sprites/collections/assets/coffee-tea/";
const mascot="/assets/cuc-yen/sprites/";
const room="/lab/assets/room-backdrop.jpg";

const baseScene=(location,description,backgroundPosition,pose,props,subject)=>({
  location,
  shots:{
    establishing:{
      backdrop:room,description:"Toàn cảnh: "+description,
      alt:"Khung cảnh quán Yên: "+description,
      actors:[{id:"cuc-yen",pose,alt:"Cục Yên đang quan sát ở "+location}],
      props:props.map(([id,state])=>({id,state,alt:subject+" · "+state})),
      camera:{scale:1,position:backgroundPosition}
    },
    interactive:{
      backdrop:room,description:"Tình huống cận cảnh: "+subject,
      alt:"Góc cận minh họa "+subject+" và nhân vật đang suy nghĩ",
      actors:[{id:"cuc-yen",pose:"investigating",alt:"Cục Yên cúi quan sát vật chứng"}],
      props:props.map(([id])=>({id,state:"in-focus",alt:subject+" nằm trong điểm nhìn của nhân vật"})),
      camera:{scale:1.16,position:backgroundPosition}
    },
    resolution:{
      backdrop:room,description:"Kết quả: vật dụng và nhân vật đổi trạng thái sau lựa chọn",
      alt:"Cảnh quán sau xử lý "+subject+", nhân vật và đồ vật phản ứng theo quyết định",
      actors:[{id:"cuc-yen",pose:"reacting",alt:"Cục Yên phản ứng với cách xử lý"}],
      props:props.map(([id])=>({id,state:"changed",alt:subject+" sau lựa chọn"})),
      camera:{scale:1.04,position:backgroundPosition}
    }
  }
});
const reaction=(speaker,line,to,prop)=>({
 speaker,line,visualChanges:[
  {layer:"actor",id:"cuc-yen",to},
  {layer:"prop",id:prop,to}
 ]
});
const recover=(label,reason,effects,flags,to,prop)=>({
 label,reason,effects,flags,resolvesHazard:true,reaction:reaction("Cục Yên","Đã có người quay lại xử lý chỗ nguy hiểm. Làm chậm lại một chút cũng được.",to,prop)
});

export const DAY01=[
 {
  id:"D01-01",time:"08:10",slot:"Sáng",title:"Hàng khách đầu tiên",
  intro:"Sáng khai trương. Khách đã đứng đợi, nhưng phiếu in ra theo thứ tự lộn xộn.",
  speaker:"Người cùng ca",
  cue:"Khách đang đợi mà phiếu order lại lộn thứ tự. Mình xử lý sao đây?",
  transition:"Khách đang nhìn đồng hồ, còn quầy vẫn phải giữ thứ tự. Bạn quyết định thế nào?",
  sceneTheme:"morning",weather:"Nắng đầu ngày",
  scene:baseScene("Quầy nhận đơn","khách xếp hàng và dải phiếu order trên quầy","48% 48%","working",[["tickets","unordered"],["tray","waiting"]],"phiếu nhận đồ uống"),
  assets:[
   {id:"prop-machine",src:coffee+"v2-espresso-machine.webp",x:13,y:70,width:21,alt:"Máy pha cà phê đặt bên trái quầy"},
   {id:"prop-tray",src:coffee+"v2-serving-tray.webp",x:84,y:75,width:18,alt:"Khay phục vụ bên phải"},
   {id:"actor",src:mascot+"barista.webp",x:73,y:28,width:21,alt:"Cục Yên đang pha chế"}
  ],
  question:"Khách đến trước đang sốt ruột. Bạn xử lý thế nào?",
  choices:[
   {id:"explain",label:"Xếp phiếu, báo thời gian chờ rồi phục vụ theo lượt.",reason:"Khách được biết thời gian chờ, hàng nhận nước rõ thứ tự.",risk:"safe",effects:{safety:1,trust:9,flow:7,budget:-1},flags:{queueSorted:true,queueExplained:true},reaction:reaction("Khách đầu hàng","“Cảm ơn quán. Vậy mình biết đợi khoảng nào rồi.”","relieved","announced")},
   {id:"silent",label:"Xếp lại phiếu rồi pha nước, không báo khách.",reason:"Đúng lượt, nhưng khách không rõ mình phải đợi bao lâu.",risk:"caution",effects:{safety:0,trust:-4,flow:3,budget:0},flags:{queueSorted:true,queueExplained:false},reaction:reaction("Một khách phía sau","“Quán ơi, không biết đến lượt em chưa?”","uncertain","waiting")},
   {id:"priority",label:"Ưu tiên người quen dù họ đến sau.",reason:"Khách đến trước cảm thấy mình bị đối xử bất công.",risk:"caution",effects:{safety:0,trust:-11,flow:-3,budget:1},flags:{queueSorted:false,queueExplained:false,queueSkipped:true},reaction:reaction("Khách đứng đầu","“Ủa, mình đến trước mà sao người sau được lấy nước trước?”","concerned","skipped")}
  ],
  day02:"Thứ tự nhận đơn sẽ quyết định quán xử lý hàng chờ ra sao trong những hôm mưa hoặc đông khách."
 },
 {
  id:"D01-02",time:"15:40",slot:"Chiều",title:"Vũng nước cạnh quầy",
  intro:"Chiều. Một bình nước đổ sát lối đi. Khách đang bưng nước đi ngang khu vực ấy.",
  speaker:"Người cùng ca",cue:"Nước đổ ngay lối đi! Khách đang tới. Mình làm gì trước?",
  transition:"Sàn đang ướt và có khách đi ngang. Bạn sẽ làm gì?",
  sceneTheme:"afternoon",weather:"Chiều có khách",
  scene:baseScene("Lối đi trước quầy","bình đổ, nền sàn ướt và một lối đi cần cảnh báo","47% 83%","alarmed",[["spill","wet"],["warning","away"]],"lối đi có nước đổ"),
  assets:[
   {id:"prop-pitcher",src:coffee+"v2-milk-pitcher.webp",x:21,y:60,width:16,alt:"Bình inox nghiêng cạnh quầy"},
   {id:"prop-glass",src:coffee+"v2-glass-tea.webp",x:82,y:42,width:11,alt:"Ly trà của khách ở khu vực gần đó"},
   {id:"actor",src:mascot+"surprised.webp",x:70,y:24,width:23,alt:"Cục Yên giật mình khi thấy nước đổ"}
  ],
  question:"Một khách đang đến gần vũng nước. Bạn xử lý thế nào?",
  choices:[
   {id:"clean",label:"Chặn lối, đặt biển, lau và kiểm tra sàn trước khi mở lại.",reason:"Lối trơn đã được ngăn và lau, khách đi an toàn.",risk:"safe",effects:{safety:18,trust:8,flow:-4,budget:-1},flags:{spillContained:true,spillResolved:true},reaction:reaction("Khách gần quầy","“Được rồi, em đi vòng bên này. Cảm ơn quán đã nhắc.”","reassured","dry")},
   {id:"later",label:"Đặt biển, hướng khách đi vòng; lau khi bớt đông.",reason:"Có biển, nhưng sàn vẫn trơn và cần xử lý sớm.",risk:"caution",effects:{safety:1,trust:-2,flow:2,budget:0},flags:{spillContained:true,spillResolved:false},reaction:reaction("Khách gần cửa","“Em thấy biển rồi. Nhưng chỗ đó vẫn còn ướt nha.”","uncertain","wet-blocked")},
   {id:"open",label:"Bỏ qua sàn ướt để tiếp tục phục vụ.",reason:"Sàn trơn không được cảnh báo; nguy cơ trượt ngã còn đó.",risk:"hazard",effects:{safety:-20,trust:-12,flow:5,budget:1},flags:{spillContained:false,spillResolved:false},reaction:reaction("Một khách đang đi","“Chỗ này trơn quá! Mọi người đừng đi qua đây.”","alarmed","unsafe"),
      recovery:recover("Đóng lối, đặt lại biển, gọi hỗ trợ và lau kiểm tra sàn","Khôi phục biện pháp an toàn trước khi tiếp tục nhận khách.",{safety:16,trust:6,flow:-6},{spillContained:true,spillResolved:true},"reassured","dry")}
  ],
  day02:"Nếu hôm nay sàn chưa được xử lý triệt để, Ngày 2 sẽ cần kiểm tra lại lối đi khi trời mưa."
 },
 {
  id:"D01-03",time:"20:10",slot:"Tối",title:"Hóa đơn khai trương",
  intro:"Tối. Một khách nhận hóa đơn, nhìn số tiền rồi quay lại hỏi về ly trà.",
  speaker:"Khách mua nước",cue:"Trà này trên menu là 25 nghìn mà? Sao hóa đơn lại ghi 35 nghìn?",
  transition:"Khách đang cầm biên lai và chờ lời giải thích. Bạn quyết định thế nào?",
  sceneTheme:"evening",weather:"Đèn quán đã lên",
  scene:baseScene("Quầy thu ngân","màn thu ngân, biên lai và ly trà của khách lúc tối","56% 49%","focused",[["receipt","mismatch"],["register","review"]],"hóa đơn đang tính sai"),
  assets:[
   {id:"prop-menu",src:coffee+"v2-menu-card.webp",x:15,y:50,width:17,alt:"Menu minh họa được đặt cạnh máy tính tiền"},
   {id:"prop-glass",src:coffee+"v2-glass-tea.webp",x:84,y:66,width:14,alt:"Ly trà vừa mua của khách"},
   {id:"actor",src:mascot+"clerk.webp",x:72,y:24,width:23,alt:"Cục Yên ở quầy thu ngân"}
  ],
  question:"Menu ghi 25.000đ, hóa đơn ghi 35.000đ. Bạn làm gì?",
  choices:[
   {id:"refund",label:"Xin lỗi, sửa hóa đơn và hoàn 10.000đ.",reason:"Khách được hoàn tiền; quán sửa đúng dòng tính sai.",risk:"safe",effects:{safety:0,trust:12,flow:-2,budget:-1},flags:{billCorrected:true,customerReassured:true},reaction:reaction("Khách mua nước","“Dạ, cảm ơn quán đã kiểm tra và sửa ngay.”","relieved","refunded")},
   {id:"later",label:"Hẹn kiểm tra sau, chưa hoàn số tiền tính dư.",reason:"Khách còn chờ khoản hoàn tiền chưa được xử lý.",risk:"caution",effects:{safety:0,trust:-5,flow:2,budget:0},flags:{billCorrected:false,customerReassured:false},reaction:reaction("Khách mua nước","“Nếu đúng là tính dư, khi nào quán hoàn giúp em?”","uncertain","pending")},
   {id:"ignore",label:"Nói giá trên máy là đúng, không điều chỉnh.",reason:"Khách mất niềm tin; lỗi tính tiền chưa được sửa.",risk:"caution",effects:{safety:0,trust:-16,flow:3,budget:3},flags:{billCorrected:false,customerReassured:false},reaction:reaction("Khách mua nước","“Vậy thôi, chắc lần sau mình không ghé nữa.”","concerned","wrong")}
  ],
  day02:"Nếu hóa đơn chưa được sửa, quán có nguy cơ lặp lại cách tính sai vào ca tiếp theo."
 }
];
export const DAY01_BY_ID=Object.fromEntries(DAY01.map(s=>[s.id,s]));
export const DAY01_SCRIPTS=Object.fromEntries(DAY01.map(s=>[
 s.id, {
  id:s.id,mode:"visual-novel",scene:s.scene,interactions:[],choices:s.choices,callbacks:[]
 }
]));
export const DAY01_ART_REFS=Object.freeze({
  "D01-01":[coffee+"v2-espresso-machine.webp",coffee+"v2-serving-tray.webp",mascot+"barista.webp"],
  "D01-02":[coffee+"v2-milk-pitcher.webp",coffee+"v2-glass-tea.webp",mascot+"surprised.webp"],
  "D01-03":[coffee+"v2-menu-card.webp",coffee+"v2-glass-tea.webp",mascot+"clerk.webp"]
});
export function day01Debrief(flags){
 const summary=[];
 summary.push(flags.queueExplained ? "Hàng chờ có thứ tự, khách được báo thời gian đợi."
  : flags.queueSorted ? "Phiếu đã sắp nhưng khách chưa biết bao giờ đến lượt." : "Thứ tự phục vụ bị phá vỡ, cần điều phối lại.");
 summary.push(flags.spillResolved ? "Lối đi đã được xử lý, khách có thể đi an toàn."
  : "Sàn trơn chưa được khắc phục, cần xử lý trước ca mới.");
 summary.push(flags.billCorrected ? "Biên lai đã sửa, khách được hoàn lại 10.000đ."
  : "Sai lệch trên hóa đơn vẫn cần giải quyết trong ca sau.");
 return summary;
}
