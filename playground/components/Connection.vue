<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  authenticated: boolean;
  online: boolean;
  name: string;
}

const props = defineProps<Props>();
const circleColor = computed(() =>
  props.online && props.authenticated
    ? "green"
    : props.online
      ? "yellow"
      :  "red"
);
</script>

<template>
  <li class="connection-container">
    <div class="circle" :class="[circleColor]"></div>
    {{ name }}
    <button @click="$emit('remove', $props.name)">X</button>
  </li>
</template>

<style scoped>
.connection-container {
  display: flex;
  gap: 5px;
}

.circle {
  border-radius: 50%;
  height: 20px;
  width: 20px;
}

.circle.red {
  background-color: red;
}

.circle.yellow {
  background-color: yellow;
}

.circle.green {
  background-color: green;
}
</style>
