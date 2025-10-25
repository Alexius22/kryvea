<script setup lang="ts">
import { useData } from "vitepress";
import { computed, ref, onMounted, watch } from "vue";

interface Props {
  light: string;
  dark: string;
  alt?: string;
  class?: string;
}
const props = defineProps<Props>();
const { isDark, site } = useData();

const base = site.value.base || "/";

const currentDark = ref(isDark.value);

// On client before hydration, prefer persisted VitePress choice or OS preference
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("vitepress-theme-appearance");
  currentDark.value = stored
    ? stored === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

onMounted(() => {
  // keep synced with VitePress reactive state after hydration
  currentDark.value = isDark.value;
  watch(isDark, (v) => (currentDark.value = v));
});

const imageSrc = computed(() => {
  const src = currentDark.value ? props.dark : props.light;
  return `${base.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
});
</script>

<template>
  <img
    :src="imageSrc"
    :alt="props.alt || ''"
    :class="props.class"
    style="max-width: 100%"
  />
</template>

<style scoped>
img {
  border-radius: 8px;
  display: block;
}
</style>
