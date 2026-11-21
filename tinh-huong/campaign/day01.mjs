// VN-F04 #222 · Three linked Day 1 illustrated incident scripts.
// The 30-day catalog still describes future days as planned.
// All visual layers are existing Yên painted assets + observable in-scene mechanics.
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
      backdrop:room,description:"Cận cảnh: người chơi đang kiểm tra "+subject,
      alt:"Góc cận cho phép chạm trực tiếp lên "+subject,
      actors:[{id:"cuc-yen",pose:"investigating",alt:"Cục Yên cúi quan sát vật chứng"}],
      props:props.map(([id])=>({id,state:"selected",alt:subject+" đang được kiểm tra"})),
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
  id:"D01-01",mechanicId:"arrange",time:"08:10",slot:"Sáng",title:"Hàng khách đầu tiên",
  intro:"Sáng khai trương. Khách đã đứng đợi, nhưng phiếu in ra theo thứ tự lộn xộn.",
  speaker:"Người cùng ca",
  cue:"Em đã nhận ba đơn này. Nhờ anh xếp lại phiếu trước khi em bắt đầu pha nhé.",
  transition:"Dãy phiếu đã được sắp xếp. Vậy còn khách đang nhìn đồng hồ?",
  sceneTheme:"morning",weather:"Nắng đầu ngày",
  scene:baseScene("Quầy nhận đơn","khách xếp hàng và dải phiếu order trên quầy","48% 48%","working",[["tickets","unordered"],["tray","waiting"]],"phiếu nhận đồ uống"),
  assets:[
   {id:"prop-machine",src:coffee+"v2-espresso-machine.webp",x:13,y:70,width:21,alt:"Máy pha cà phê đặt bên trái quầy"},
   {id:"prop-tray",src:coffee+"v2-serving-tray.webp",x:84,y:75,width:18,alt:"Khay phục vụ bên phải"},
   {id:"actor",src:mascot+"barista.webp",x:73,y:28,width:21,alt:"Cục Yên đang pha chế"}
  ],
  actionId:"sort-tickets",
  action:{id:"sort-tickets",type:"arrange",targetId:"tickets",prompt:"Sắp phiếu theo đúng lượt",keyboardAlternative:"Chọn hai phiếu bằng Tab và Enter để đổi chỗ",visualChange:{layer:"prop",id:"tickets",to:"sorted"}},
  question:"Khách vẫn đang chờ. Bạn giao tiếp thế nào?",
  choices:[
   {id:"explain",label:"Báo thứ tự và thời gian chờ dự kiến, rồi xử lý theo lượt.",reason:"Sắp xếp đúng là chưa đủ; khách cần biết mình được phục vụ thế nào.",risk:"safe",effects:{safety:1,trust:9,flow:7,budget:-1},flags:{queueSorted:true,queueExplained:true},reaction:reaction("Khách đầu hàng","“Cảm ơn quán. Vậy mình biết đợi khoảng nào rồi.”","relieved","announced")},
   {id:"silent",label:"Âm thầm làm theo phiếu đã xếp, chưa báo gì với khách.",reason:"Thứ tự được giữ, nhưng người chờ không có thông tin về tiến độ.",risk:"caution",effects:{safety:0,trust:-4,flow:3,budget:0},flags:{queueSorted:true,queueExplained:false},reaction:reaction("Một khách phía sau","“Quán ơi, không biết đến lượt em chưa?”","uncertain","waiting")},
   {id:"priority",label:"Ưu tiên một người quen dù người khác đến trước.",reason:"Một khách vui, những khách còn lại thấy nguyên tắc bị thay đổi.",risk:"caution",effects:{safety:0,trust:-11,flow:-3,budget:1},flags:{queueSorted:true,queueExplained:false,queueSkipped:true},reaction:reaction("Khách đứng đầu","“Ủa, mình đến trước mà sao người sau được lấy nước trước?”","concerned","skipped")}
  ],
  day02:"Thứ tự nhận đơn sẽ quyết định quán xử lý hàng chờ ra sao trong những hôm mưa hoặc đông khách."
 },
 {
  id:"D01-02",mechanicId:"isolate",time:"15:40",slot:"Chiều",title:"Vũng nước cạnh quầy",
  intro:"Chiều. Một bình nước đổ sát lối đi. Khách đang bưng nước đi ngang khu vực ấy.",
  speaker:"Người cùng ca",cue:"Nước đổ ra đường khách đi rồi! Mình nên làm gì trước?",
  transition:"Biển cảnh báo đã ở đúng vị trí. Lối đi cần được xử lý tiếp thế nào?",
  sceneTheme:"afternoon",weather:"Chiều có khách",
  scene:baseScene("Lối đi trước quầy","bình đổ, nền sàn ướt và một lối đi cần cảnh báo","47% 83%","alarmed",[["spill","wet"],["warning","away"]],"lối đi có nước đổ"),
  assets:[
   {id:"prop-pitcher",src:coffee+"v2-milk-pitcher.webp",x:21,y:60,width:16,alt:"Bình inox nghiêng cạnh quầy"},
   {id:"prop-glass",src:coffee+"v2-glass-tea.webp",x:82,y:42,width:11,alt:"Ly trà của khách ở khu vực gần đó"},
   {id:"actor",src:mascot+"surprised.webp",x:70,y:24,width:23,alt:"Cục Yên giật mình khi thấy nước đổ"}
  ],
  actionId:"mark-spill",
  action:{id:"mark-spill",type:"isolate",targetId:"spill",prompt:"Đặt cảnh báo vào đúng vùng ướt",keyboardAlternative:"Chọn biển cảnh báo, rồi chọn vùng sàn trơn bằng phím Enter",visualChange:{layer:"prop",id:"warning",to:"deployed"}},
  question:"Sau khi khoanh vùng, bạn xử lý tiếp ra sao?",
  choices:[
   {id:"clean",label:"Tạm dừng luồng khách, nhờ người hỗ trợ, lau khô và kiểm tra trước khi mở lại.",reason:"Nguy cơ được cô lập rồi loại bỏ, đồng thời khách được hướng dẫn đi lối khác.",risk:"safe",effects:{safety:18,trust:8,flow:-4,budget:-1},flags:{spillContained:true,spillResolved:true},reaction:reaction("Khách gần quầy","“Được rồi, em đi vòng bên này. Cảm ơn quán đã nhắc.”","reassured","dry")},
   {id:"later",label:"Giữ biển cảnh báo, chờ hết đơn đang dồn rồi mới lau.",reason:"Có cảnh báo nhưng sàn vẫn trơn. Quán cần duy trì việc ngăn lối và xử lý sớm.",risk:"caution",effects:{safety:1,trust:-2,flow:2,budget:0},flags:{spillContained:true,spillResolved:false},reaction:reaction("Khách gần cửa","“Em thấy biển rồi. Nhưng chỗ đó vẫn còn ướt nha.”","uncertain","wet-blocked")},
   {id:"open",label:"Dời biển qua một bên, cho khách đi như bình thường để kịp bán.",reason:"Cảnh báo bị gỡ khi nguy cơ vẫn tồn tại. Tốc độ không bù được rủi ro trượt ngã.",risk:"hazard",effects:{safety:-20,trust:-12,flow:5,budget:1},flags:{spillContained:false,spillResolved:false},reaction:reaction("Một khách đang đi","“Chỗ này trơn quá! Mọi người đừng đi qua đây.”","alarmed","unsafe"),
      recovery:recover("Đóng lối, đặt lại biển, gọi hỗ trợ và lau kiểm tra sàn","Khôi phục biện pháp an toàn trước khi tiếp tục nhận khách.",{safety:16,trust:6,flow:-6},{spillContained:true,spillResolved:true},"reassured","dry")}
  ],
  day02:"Nếu hôm nay sàn chưa được xử lý triệt để, Ngày 2 sẽ cần kiểm tra lại lối đi khi trời mưa."
 },
 {
  id:"D01-03",mechanicId:"compare",time:"20:10",slot:"Tối",title:"Hóa đơn khai trương",
  intro:"Tối. Một khách nhận hóa đơn, nhìn số tiền rồi quay lại hỏi về ly trà.",
  speaker:"Khách mua nước",cue:"Trà này trên menu là 25 nghìn mà? Sao hóa đơn lại ghi 35 nghìn?",
  transition:"Bạn đã tìm ra dòng chênh lệch. Giờ cần xử lý việc khách đã được tính tiền.",
  sceneTheme:"evening",weather:"Đèn quán đã lên",
  scene:baseScene("Quầy thu ngân","màn thu ngân, biên lai và ly trà của khách lúc tối","56% 49%","focused",[["receipt","mismatch"],["register","review"]],"hóa đơn đang tính sai"),
  assets:[
   {id:"prop-menu",src:coffee+"v2-menu-card.webp",x:15,y:50,width:17,alt:"Menu minh họa được đặt cạnh máy tính tiền"},
   {id:"prop-glass",src:coffee+"v2-glass-tea.webp",x:84,y:66,width:14,alt:"Ly trà vừa mua của khách"},
   {id:"actor",src:mascot+"clerk.webp",x:72,y:24,width:23,alt:"Cục Yên ở quầy thu ngân"}
  ],
  actionId:"inspect-bill",
  action:{id:"inspect-bill",type:"compare",targetId:"receipt",prompt:"Đối chiếu dòng trên hóa đơn với menu",keyboardAlternative:"Tab đến dòng trà, Enter để chọn",visualChange:{layer:"prop",id:"receipt",to:"mismatch-found"}},
  question:"Đã phát hiện tính dư 10.000 đồng. Bạn làm gì?",
  choices:[
   {id:"refund",label:"Xin lỗi, sửa hóa đơn và hoàn ngay 10.000 đồng cho khách.",reason:"Thừa nhận sai sót cụ thể, trả lại đúng số tiền và sửa nguồn gây lỗi.",risk:"safe",effects:{safety:0,trust:12,flow:-2,budget:-1},flags:{billCorrected:true,customerReassured:true},reaction:reaction("Khách mua nước","“Dạ, cảm ơn quán đã kiểm tra và sửa ngay.”","relieved","refunded")},
   {id:"later",label:"Giải thích và hẹn kiểm tra sau, nhưng chưa xử lý số tiền tính dư.",reason:"Khách đã được nghe giải thích, nhưng khoản tính sai vẫn tồn tại.",risk:"caution",effects:{safety:0,trust:-5,flow:2,budget:0},flags:{billCorrected:false,customerReassured:false},reaction:reaction("Khách mua nước","“Nếu đúng là tính dư, khi nào quán hoàn giúp em?”","uncertain","pending")},
   {id:"ignore",label:"Bảo đây là giá trên máy rồi tiếp tục thu tiền như cũ.",reason:"Đùn lỗi cho hệ thống làm khách mất niềm tin và sai lệch còn lặp lại.",risk:"caution",effects:{safety:0,trust:-16,flow:3,budget:3},flags:{billCorrected:false,customerReassured:false},reaction:reaction("Khách mua nước","“Vậy thôi, chắc lần sau mình không ghé nữa.”","concerned","wrong")}
  ],
  day02:"Nếu hóa đơn chưa được sửa, quán có nguy cơ lặp lại cách tính sai vào ca tiếp theo."
 }
];
export const DAY01_BY_ID=Object.fromEntries(DAY01.map(s=>[s.id,s]));
export const DAY01_SCRIPTS=Object.fromEntries(DAY01.map(s=>[
 s.id, {
  id:s.id,scene:s.scene,interactions:[s.action],choices:s.choices,callbacks:[]
 }
]));
export const DAY01_ART_REFS=Object.freeze({
  "D01-01":[coffee+"v2-espresso-machine.webp",coffee+"v2-serving-tray.webp",mascot+"barista.webp"],
  "D01-02":[coffee+"v2-milk-pitcher.webp",coffee+"v2-glass-tea.webp",mascot+"surprised.webp"],
  "D01-03":[coffee+"v2-menu-card.webp",coffee+"v2-glass-tea.webp",mascot+"clerk.webp"]
});
export function day01Debrief(flags){
 const summary=[];
 summary.push(flags.queueExplained ? "Hàng chờ đã có thứ tự và khách được báo tiến độ."
  : "Thứ tự phiếu đã sắp nhưng thông tin cho khách cần được cải thiện.");
 summary.push(flags.spillResolved ? "Lối đi đã được xử lý; nguy cơ trơn trượt không còn ở ca này."
  : "Sàn trơn chưa được khắc phục hoàn toàn, cần kiểm tra lại trước ca mới.");
 summary.push(flags.billCorrected ? "Biên lai được sửa và khoản tiền tính dư đã hoàn trả."
  : "Sai lệch trên hóa đơn vẫn cần giải quyết để không lặp lại.");
 return summary;
}
