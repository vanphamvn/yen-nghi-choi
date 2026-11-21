// VN-F03 #221 · Pure, reusable interaction primitives for Yên's visual novel.
// Visual targets are real in-scene buttons. No timeouts, personal data, storage or network.
const painted = (file) => "../../lab/assets/" + file;

export const SCENES = Object.freeze([
  {
    id: "arrange", kind: "arrange", incident: "D01-01", title: "Hàng khách đầu tiên",
    prompt: "Ba phiếu bị xếp lộn xộn. Chọn một phiếu rồi chọn phiếu khác để đổi chỗ.",
    backdrop: painted("room-backdrop.jpg"), camera: "counter",
    actors: "Ba vị khách đang đợi bên quầy.",
    goal: "Xếp theo thứ tự nhận đơn: 01 → 02 → 03.",
    items: [
      { id: "03", label: "Đơn 03 · Cà phê đen", kind: "ticket" },
      { id: "01", label: "Đơn 01 · Trà đào", kind: "ticket" },
      { id: "02", label: "Đơn 02 · Matcha dâu", kind: "ticket" }
    ],
    initialOrder: ["03","01","02"], answer: ["01","02","03"],
    success: "Phiếu về đúng thứ tự. Khách đứng đầu hàng đã thấy đơn của mình được gọi.",
    evidence: "Dải phiếu đã sắp đúng trước khi quay lại pha chế."
  },
  {
    id: "isolate", kind: "isolate", incident: "D01-02", title: "Lối đi đang trơn",
    prompt: "Đặt cảnh báo vào đúng chỗ có nguy cơ trước khi xử lý nước đổ.",
    backdrop: painted("room-backdrop.jpg"), camera: "floor",
    actors: "Một khách đang chuẩn bị bước qua khu vực ướt.",
    goal: "Chọn bảng cảnh báo, sau đó chạm vùng sàn trơn.",
    items: [
      { id: "sign", kind: "sign", label: "Biển cảnh báo · Chọn để đặt", x: 16, y: 63 },
      { id: "spill", kind: "spill", label: "Vùng sàn trơn · Cần khoanh lại", x: 58, y: 69 },
      { id: "dry", kind: "dry", label: "Lối khô · Có thể đi", x: 80, y: 42 }
    ],
    success: "Biển cảnh báo đã được đặt ngay chỗ nước đổ. Khách đổi hướng, khu vực cần được lau và kiểm tra trước khi mở lại.",
    evidence: "Vùng nguy hiểm được đánh dấu, lối khô vẫn thông thoáng."
  },
  {
    id: "compare", kind: "compare", incident: "D01-03", title: "Hóa đơn khai trương",
    prompt: "Khách chỉ ra tổng tiền không khớp. Chạm dòng sai trên hóa đơn.",
    backdrop: painted("room-backdrop.jpg"), camera: "counter",
    actors: "Khách đang giữ biên lai và chờ nhân viên kiểm tra.",
    goal: "Giá ly trà là 25.000đ, không phải 35.000đ.",
    items: [
      { id: "coffee", kind: "receipt", label: "Cà phê đen · 16.000đ", x: 31, y: 41 },
      { id: "tea", kind: "receipt", label: "Trà đào · 35.000đ", x: 31, y: 55 },
      { id: "total", kind: "receipt", label: "Tổng · 51.000đ", x: 31, y: 69 }
    ],
    success: "Dòng trà đào được đánh dấu để sửa về 25.000đ. Tổng tiền đúng là 41.000đ, chưa áp dụng ưu đãi khác.",
    evidence: "Dòng sai và tổng tiền được cập nhật rõ trên biên lai."
  },
  {
    id: "inspect", kind: "inspect", incident: "D08-01", title: "Kiểm tra ly trước khi giao",
    prompt: "Khách dặn ít ngọt. Hãy kiểm tra đúng ly đang đặt trên bàn.",
    backdrop: painted("room-backdrop.jpg"), camera: "table",
    actors: "Một vị khách đang đợi ly ít ngọt.",
    goal: "Chạm vào ly để nhìn kỹ nhãn đơn.",
    items: [
      { id: "cup", kind: "painted", label: "Ly cần kiểm tra", src: painted("cup.webp"), x: 46, y: 62 },
      { id: "book", kind: "painted", label: "Sổ ghi chép trên bàn", src: painted("book.webp"), x: 75, y: 61 }
    ],
    success: "Nhãn trên ly ghi mức ngọt tiêu chuẩn, không phải ít ngọt. Chưa thể giao ly này cho khách.",
    evidence: "Ly đã được kiểm tra, yêu cầu ít ngọt cần được xác nhận lại."
  },
  {
    id: "place", kind: "place", incident: "D03-02", title: "Đặt ly vào đúng khay",
    prompt: "Ly đã hoàn thành nhưng chưa ở khay nhận nước. Chuyển ly vào vị trí phục vụ.",
    backdrop: painted("room-backdrop.jpg"), camera: "table",
    actors: "Khách chờ trước quầy nhận nước.",
    goal: "Chạm ly để chọn, rồi chạm khay để đặt.",
    items: [
      { id: "cup", kind: "painted", label: "Ly cà phê · Có thể chuyển", src: painted("cup.webp"), x: 32, y: 67 },
      { id: "tray", kind: "target", label: "Khay nhận nước · Đặt ly vào đây", x: 71, y: 70 }
    ],
    success: "Ly nằm đúng khay nhận nước. Vị trí đặt đã được cập nhật ngay trên cảnh.",
    evidence: "Ly di chuyển từ bàn pha sang khay nhận nước."
  },
  {
    id: "move", kind: "move", incident: "D17-01", title: "Dời chậu cây chắn lối",
    prompt: "Chậu cây đặt sát lối đi. Hãy chuyển nó sang góc an toàn.",
    backdrop: painted("room-backdrop.jpg"), camera: "floor",
    actors: "Khách đang tránh chậu cây khi đi ngang qua.",
    goal: "Chạm chậu cây, sau đó chọn góc trống.",
    items: [
      { id: "plant", kind: "painted", label: "Chậu cây · Đang chắn lối", src: painted("plant.webp"), x: 51, y: 62 },
      { id: "corner", kind: "target", label: "Góc trống · Có thể chuyển cây vào", x: 79, y: 52 }
    ],
    success: "Chậu cây đã chuyển sang góc trống. Lối đi không còn bị chắn.",
    evidence: "Lối đi rộng hơn và chậu cây hiện ở vị trí mới."
  }
]);

const sceneById = new Map(SCENES.map(s => [s.id, s]));
const invariant = (ok, msg) => { if (!ok) throw new Error("Yên scene: " + msg); };
const intro = "Chạm vào một vật trên cảnh để bắt đầu. Có thể dùng Tab và Enter.";
const freeze = state => Object.freeze({ ...state, order: Object.freeze([...state.order]) });

export function getScene(id) { return sceneById.get(id) || null; }
export function createInteraction(id) {
  const scene = getScene(id);
  invariant(scene, "unknown scene " + id);
  return freeze({ id, selected: null, completed: false, checked: [], order: scene.initialOrder || [],
    message: intro, outcome: "", attempts: 0 });
}

export function updateInteraction(current, action) {
  const scene = getScene(current.id);
  invariant(scene, "unknown scene");
  invariant(action && typeof action === "object", "missing action");
  if (action.type === "reset") return createInteraction(scene.id);
  if (current.completed) return current; // no double credit, reset is always available
  const clicked = scene.items.find(i => i.id === action.id);
  if (action.type !== "activate" || !clicked) return current;
  const state = { ...current, checked: [...current.checked], order: [...current.order],
    attempts: current.attempts + 1, message: "", outcome: "" };
  const done = () => { state.completed = true; state.selected = null; state.outcome = scene.success; state.message = scene.evidence; };

  if (scene.kind === "inspect") {
    if (clicked.id === "cup") done();
    else state.message = "Sổ không có thông tin trên ly. Hãy kiểm tra ngay nhãn ly đang chờ giao.";
  } else if (scene.kind === "compare") {
    if (clicked.id === "tea") done();
    else state.message = "Dòng này chưa chứng minh được sai lệch. So lại đơn giá trà trên menu.";
  } else if (scene.kind === "arrange") {
    if (state.selected === null) {
      state.selected = clicked.id; state.message = "Đã chọn phiếu " + clicked.id + ". Chọn phiếu khác để đổi chỗ.";
    } else if (state.selected === clicked.id) {
      state.selected = null; state.message = "Đã bỏ chọn. Bạn có thể chọn lại phiếu.";
    } else {
      const a = state.order.indexOf(state.selected), b = state.order.indexOf(clicked.id);
      if (a >= 0 && b >= 0) [state.order[a], state.order[b]] = [state.order[b], state.order[a]];
      state.selected = null;
      if (state.order.every((id, index) => id === scene.answer[index])) done();
      else state.message = "Phiếu đã đổi chỗ. Kiểm tra lại thứ tự trên quầy.";
    }
  } else if (["isolate","place","move"].includes(scene.kind)) {
    const movable = { isolate: "sign", place: "cup", move: "plant" }[scene.kind];
    const destination = { isolate: "spill", place: "tray", move: "corner" }[scene.kind];
    if (clicked.id === movable) {
      state.selected = state.selected === movable ? null : movable;
      state.message = state.selected ? "Đã chọn " + clicked.label + ". Chạm vị trí cần đặt trên cảnh." : "Đã bỏ chọn vật dụng.";
    } else if (clicked.id === destination && state.selected === movable) {
      done();
    } else if (clicked.id === destination) {
      state.message = "Hãy chọn vật cần di chuyển trước khi chọn vị trí đặt.";
    } else {
      state.message = "Vị trí này không xử lý đúng nguy cơ. Hãy nhìn lại dấu hiệu trên cảnh.";
    }
  } else {
    invariant(false, "unsupported mechanic");
  }
  return freeze(state);
}

export function visualState(scene, state) {
  invariant(scene.id === state.id, "mismatched scene");
  const items = (scene.kind === "arrange" ? state.order.map(id => scene.items.find(item => item.id === id)) : scene.items)
    .map((item, i) => {
      const selected = item.id === state.selected;
      const positions = scene.kind === "arrange" ? { x: 24 + i * 25, y: 59 } : { x: item.x, y: item.y };
      const placed = state.completed && ["place", "move"].includes(scene.kind) && item.id === ({ place:"cup",move:"plant" }[scene.kind]);
      const mark = scene.kind === "isolate" && item.id === "spill" && state.completed;
      const corrected = scene.kind === "compare" && state.completed && (item.id === "tea" || item.id === "total");
      const shift = placed ? { x: scene.kind === "move" ? 79 : 71, y: scene.kind === "move" ? 52 : 70 } : positions;
      const label = corrected && item.id === "tea" ? "Trà đào · 25.000đ" :
        corrected && item.id === "total" ? "Tổng · 41.000đ" : item.label;
      return { ...item, ...shift, label, selected, marked: mark, corrected, placed };
    });
  return { items, phase: state.completed ? "resolution" : state.selected ? "interactive" : "establishing",
    selected: state.selected, completed: state.completed, outcome: state.outcome };
}

export function validateInteractions(scenes = SCENES) {
  invariant(scenes.length >= 6, "need six mechanic examples");
  invariant(new Set(scenes.map(s=>s.id)).size === scenes.length, "duplicate scene");
  for (const scene of scenes) {
    invariant(["inspect","arrange","isolate","compare","place","move"].includes(scene.kind),
      "unknown mechanic " + scene.id);
    invariant(scene.incident?.startsWith("D") && scene.backdrop?.startsWith("../../lab/assets/"),
      "scene missing incident reference or painted visual");
    invariant(scene.title && scene.goal && scene.success && scene.evidence && scene.actors,
      "scene missing user-visible context");
    invariant(scene.items.length >= 2 && new Set(scene.items.map(i=>i.id)).size === scene.items.length,
      "bad targets");
    for (const item of scene.items) invariant(item.label && item.kind, "in-scene target needs accessible label");
    if (scene.kind === "arrange") {
      invariant(scene.answer.length === 3 && scene.initialOrder.length === 3,
        "need ordered tickets");
      invariant(scene.initialOrder.some((x,i)=>x!==scene.answer[i]), "challenge cannot start solved");
    }
  }
  return true;
}
validateInteractions();
