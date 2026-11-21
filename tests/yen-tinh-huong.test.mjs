import test from "node:test";
import assert from "node:assert/strict";
import {
  SCENARIOS, DIMENSIONS, STARTING_STATS, applyEffects, getEnding, validateStory
} from "../tinh-huong/story.mjs";

test("bốn ca với ba hồi và ba lựa chọn không có nhánh cụt", () => {
  assert.equal(validateStory(), true);
  assert.equal(SCENARIOS.length, 4);
  assert.equal(new Set(SCENARIOS.map((scenario) => scenario.id)).size, 4);
  assert.equal(SCENARIOS.reduce((sum, scenario) => sum + scenario.beats.length, 0), 12);
  assert.equal(SCENARIOS.reduce((sum, scenario) => sum + scenario.beats.flatMap((beat) => beat.choices).length, 0), 36);
  for (const scenario of SCENARIOS) {
    assert.ok(scenario.title && scenario.description && scenario.lesson);
    for (const beat of scenario.beats) {
      assert.ok(beat.time && beat.line && beat.question);
      for (const choice of beat.choices) {
        assert.ok(choice.replySpeaker && typeof choice.followUp === "string");
        assert.ok(choice.text !== choice.reply);
      }
    }
  }
});

test("mọi đường đi đều có trạng thái trong phạm vi và kết thúc có giải thích", () => {
  for (const scenario of SCENARIOS) {
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
      const indices = [a, b, c];
      let stats = { ...STARTING_STATS };
      for (const [beatIndex, choiceIndex] of indices.entries()) {
        stats = applyEffects(stats, scenario.beats[beatIndex].choices[choiceIndex].effect);
        for (const { key } of DIMENSIONS) {
          assert.ok(stats[key] >= 0 && stats[key] <= 100);
        }
      }
      const end = getEnding(stats, scenario);
      assert.ok(end.headline && end.summary);
    }
  }
});

test("những lựa chọn ưu tiên an toàn giúp ca nước đổ tốt hơn bỏ qua nguy cơ", () => {
  const scenario = SCENARIOS.find((item) => item.id === "nuoc-do");
  const safe = scenario.beats.reduce((state, beat) => applyEffects(state, beat.choices[0].effect), { ...STARTING_STATS });
  const unsafe = scenario.beats.reduce((state, beat) => applyEffects(state, beat.choices[1].effect), { ...STARTING_STATS });
  assert.ok(safe.safety > unsafe.safety);
  assert.ok(safe.trust > unsafe.trust);
  assert.match(getEnding(unsafe, scenario).headline, /nguy cơ/);
});

test("các hiệu ứng chỉ có bốn chiều đã công bố", () => {
  const metrics = new Set(DIMENSIONS.map((metric) => metric.key));
  for (const scenario of SCENARIOS) for (const beat of scenario.beats) for (const choice of beat.choices) {
    assert.ok(Object.keys(choice.effect).length >= 1);
    for (const [metric, value] of Object.entries(choice.effect)) {
      assert.ok(metrics.has(metric));
      assert.ok(Number.isInteger(value));
    }
  }
  assert.deepEqual(applyEffects({ safety: 98, trust: 0, flow: 10, budget: 30 }, { safety: 30, trust: -20 }), {
    safety: 100, trust: 0, flow: 10, budget: 30
  });
});
