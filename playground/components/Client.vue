<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  online: boolean;
  name: string;
}

const props = defineProps<Props>();
const circleColor = computed(() => props.online ? "green" : "red");
</script>

<template>
  <li class="client-container">
    <div class="circle" :class="[circleColor]"></div>
    {{ name }}
    <button @click="$emit('remove', $props.name)">X</button>
  </li>
</template>

<style scoped>
.client-container {
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

.circle.green {
  background-color: green;
}
</style>
