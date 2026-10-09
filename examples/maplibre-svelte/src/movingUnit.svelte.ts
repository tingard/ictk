// Runes only work in .svelte / .svelte.ts files, so the reactive state the
// moving marker's component reads from lives here. Passing this $state
// object as `mount()`'s props means plain assignments (`movingUnit.bearing
// = x`) update the already-mounted component in place — the Svelte
// equivalent of calling root.render() again in the React example.
export const movingUnit = $state({ bearing: 0 });
