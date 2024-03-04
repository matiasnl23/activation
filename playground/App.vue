<script setup lang="ts">
import { ref } from "vue";
import { useServerManager } from "./composables/server-manager";
import Server from "./components/Server.vue";

const name = ref<string>();
const priority = ref<number>();
const url = ref<string>();

const { servers, addServer, removeServer } = useServerManager();


const onSubmit = () => {
  if (!name.value || !url.value || !priority.value) return;
  addServer(name.value, url.value, priority.value);
}
</script>

<template>
  <div>
    <h4>Servers</h4>

    <ul>
      <Server
        v-for="server in servers"
        :key="server.name"
        :name="server.name"
        :authenticated="server.authenticated"
        :online="server.status"
        @remove="removeServer"
      />
    </ul>

    <form class="server-form" @submit.prevent="onSubmit">
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
