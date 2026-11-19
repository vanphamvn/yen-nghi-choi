(() => {
  'use strict';
  // Design prototype only: no exercise timer, clinical task, storage or network.
  const views = ['hub', 'intro', 'active', 'paused', 'result', 'error'];
  const tools = {
    breath: { name: 'Thở cùng Yên', purpose: 'Thử thở nhẹ theo nhịp, trong mức dễ chịu.', caution: 'Không cần hít sâu hay nín thở. Bạn có thể giữ nhịp tự nhiên hoặc chỉ quan sát. Nếu chóng mặt, hụt hơi hoặc khó chịu, hãy dừng và thở tự nhiên.', evidence: 'Dựa trên kỹ thuật thở đã được nghiên cứu. Bản thực hành ngắn này chưa được kiểm chứng hiệu quả riêng.' },
    release: { name: 'Căng rồi thả', purpose: 'Thử nhận ra lúc cơ căng và lúc thả.', caution: 'Đây chỉ là mẫu luồng. Không cần gồng cơ. Bài thực hành thật còn chờ rà soát quy trình và lưu ý an toàn.', evidence: 'Nghiên cứu về thư giãn cơ không chứng minh hiệu quả của bản mẫu này hoặc liều lượng rút gọn.' },
    small: { name: 'Ba điều nhỏ xíu', purpose: 'Có điều nhỏ nào bạn muốn giữ lại hôm nay?', caution: 'Không cần nghĩ ra đủ ba điều. Không có gì để kể cũng được. Prototype này không yêu cầu nhập nội dung.', evidence: 'Nghiên cứu về thực hành biết ơn không xác nhận hiệu quả của một lượt chơi tại Yên.' }
  };
  let state = 'hub';
  let tool = null;
  let lastTool = null;
  const byId = id => document.getElementById(id);
  function clearReflection() {
    byId('reflection').hidden = false;
    byId('reflection-status').textContent = '';
  }
  function show(next, focus = true) {
    state = next;
    for (const id of views) byId(id).hidden = id !== next;
    if (focus) {
      const target = next === 'hub' && lastTool ? document.querySelector(`[data-tool="${lastTool}"]`) : byId(`${next}-title`);
      target?.focus();
      if (next !== 'hub') window.scrollTo(0, 0);
    }
  }
  function setFilter(need) {
    const map = { mind: ['breath'], body: ['breath', 'release'], pleasant: ['small'], all: Object.keys(tools) };
    const visible = map[need] || map.all;
    document.querySelectorAll('[data-need]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.need === need)));
    document.querySelectorAll('[data-item]').forEach(item => { item.hidden = !visible.includes(item.dataset.item); });
    byId('list-title').textContent = need === 'all' ? 'Tất cả bài mẫu' : 'Bài mẫu bạn có thể thử';
  }
  function route(focus = true) {
    clearReflection();
    const match = /^#tool=(breath|release|small)$/.exec(location.hash);
    if (!match) { tool = null; setFilter('all'); show('hub', focus); return; }
    tool = match[1]; lastTool = tool;
    const content = tools[tool];
    byId('intro-title').textContent = content.name;
    byId('intro-purpose').textContent = content.purpose;
    byId('intro-caution').textContent = content.caution;
    byId('intro-evidence').textContent = content.evidence;
    show('intro', focus);
  }
  document.addEventListener('click', event => {
    const need = event.target.closest('[data-need]');
    if (need) { setFilter(need.dataset.need); return; }
    const reflection = event.target.closest('[data-reflection]');
    if (reflection && state === 'result') {
      // Discard selection immediately: no retained value, URL or persistence.
      byId('reflection').hidden = true;
      byId('reflection-status').textContent = reflection.dataset.reflection === 'skip' ? 'Đã bỏ qua.' : 'Cảm ơn bạn đã tự để ý một chút.';
      byId('result').querySelector('.actions a').focus(); return;
    }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action || !tool) return;
    if (action === 'start' && state === 'intro') show('active');
    if (action === 'pause' && state === 'active') show('paused');
    if (action === 'resume' && state === 'paused') show('active');
    if (action === 'stop' && ['active', 'paused'].includes(state)) { clearReflection(); byId('result-title').textContent = 'Mình dừng ở đây nhé.'; show('result'); }
    if (action === 'complete' && state === 'active') { clearReflection(); byId('result-title').textContent = 'Bài đã kết thúc.'; show('result'); }
    if (action === 'error' && state === 'active') { clearReflection(); show('error'); }
    if ((action === 'reset' && state === 'result') || (action === 'retry' && state === 'error')) { clearReflection(); show('intro'); }
  });
  window.addEventListener('hashchange', () => route());
  window.addEventListener('popstate', () => route());
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'active') show('paused', false); });
  window.addEventListener('pagehide', () => { clearReflection(); tool = null; state = 'hub'; });
  window.addEventListener('pageshow', event => { if (event.persisted) route(false); });
  route(false);
})();
