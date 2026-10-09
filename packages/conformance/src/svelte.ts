import { render } from 'svelte/server';
import SvelteFixture from './SvelteFixture.svelte';
import type { Adapter, Spec } from './spec';

export const svelteAdapter: Adapter = {
  name: 'svelte',
  cssPath: new URL('../../svelte/dist/style.css', import.meta.url),
  render(spec: Spec) {
    return render(SvelteFixture, { props: { spec } }).body;
  },
};
