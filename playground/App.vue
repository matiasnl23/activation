<script setup lang="ts">
import { ref } from "vue";
import { useConnectionManager } from "./composables/connection-manager";
import Connection from "./components/Connection.vue";

const name = ref<string>();
const priority = ref<number>();
const url = ref<string>();

const { connections, addConnection, removeConnection } = useConnectionManager();


const onSubmit = () => {
  if (!name.value || !url.value || !priority.value) return;
  addConnection(name.value, url.value, priority.value);
}
</script>

<template>
  <div>
    <h4>Connections</h4>

    <ul>
      <Connection
        v-for="connection in connections"
        :key="connection.name"
        :name="connection.name"
        :authenticated="connection.authenticated"
        :online="connection.status"
        @remove="removeConnection"
      />
    </ul>

    <form class="connection-form" @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="name">Name</label>
        <input v-model="name" id="name" type="text">
      </div>
      <div class="form-group">
        <label for="priority">Priority</label>
        <input v-model="priority" id="priority" type="number">
      </div>
      <div class="form-group">
        <label for="url">Url</label>
        <input v-model="url" id="url" type="text">
      </div>

      <button type="submit">Add</button>
    </form>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;

  margin-bottom: 0.5rem;
}
</style>
