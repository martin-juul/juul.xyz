import { shallowMount } from "@vue/test-utils";
import Hero from "@/components/Hero.vue";

describe("components/Hero.vue", () => {
  it("renders props.title when passed", () => {
    const title = "my title";
    const wrapper = shallowMount(Hero, {
      propsData: { title },
    });
    expect(wrapper.text()).toMatch(title);
  });
});
