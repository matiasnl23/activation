<script setup lang="ts">
import { ref } from "vue";
import { useClientManager } from "./composables/manager";
import Client from "./components/Client.vue";

const name = ref<string>();
const priority = ref<number>();
const url = ref<string>();

const { clients, addClient, removeClient } = useClientManager();


const onSubmit = () => {
  if (!name.value || !url.value || !priority.value) return;
  addClient(name.value, url.value, priority.value);
}
</script>

<template>
  <div>
    <h4>Clientes</h4>

    <ul>
      <Client v-for="client in clients" :key="client.name" :name="client.name" :online="client.status" @remove="removeClient"/>
    </ul>

    <form class="client-form" @submit.prevent="onSubmit">
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
