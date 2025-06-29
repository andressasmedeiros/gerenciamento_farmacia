<template>
  <div>
    <Template>
      <div>
        <DataTable :value="users" stripedRows>
          <Column header="Avatar">
            <template #body="slotProps">
              <img :src="`data:image/jpeg;base64,${slotProps.data.avatar}`" alt="Avatar"
                style="width: 40px; height: 40px; border-radius: 50%;" />
            </template>
          </Column>
          <Column field="name" header="Nome" />
          <Column field="status" header="Status">
            <template #body="slotProps">
              <ToggleSwitch v-model="slotProps.data.status" @change="updateStatus(slotProps.data)" />
            </template>
          </Column>
          <Column field="profile" header="Perfil" />
          <Column header="Ação">
            <template #body>
              <Button label="Editar" icon="pi pi-pencil" class="p-button-sm" @click="visible = true" />
            </template>
          </Column>
        </DataTable>
      </div>
    </Template>
  </div>
</template>


<script setup lang="js">
import Template from './Template.vue';
import UserService from "../services/UserService";
import { onMounted, ref } from "vue";
import ErrorUtils from "@/utils/ErrorUtils";
import { useRouter } from "vue-router";

const users = ref([]);
const router = useRouter();
const visible = ref(false);

const updateStatus = (user) => {
  UserService.updateUserStatus(user.id, user.status)
    .catch(error => ErrorUtils.handleError(error, router));
};


onMounted(() => {
  UserService.getUsers()
    .then(response => users.value = response.data)
    .catch(error => ErrorUtils.handleError(error, router));
});

</script>