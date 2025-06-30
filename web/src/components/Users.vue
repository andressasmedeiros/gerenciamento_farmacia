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
            <template #body="slotProps">
              <Button label="Editar" icon="pi pi-pencil" class="p-button-sm" @click="() => prepareEditUser(slotProps.data.id)" />
            </template>
          </Column>
        </DataTable>


        <Dialog v-model:visible="visible" modal header="Edit Profile" :style="{ width: '50rem' }">
          <UserForm :showDocument="false" :showEmail="false" :showProfile="false" :isCreating="false" :userId="userIdBeingEdited" :showPassword="false" @userUpdated="loadUsers" />
        </Dialog>

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
import UserForm from './UserForm.vue';

const users = ref([]);
const router = useRouter();
const visible = ref(false);
const userIdBeingEdited = ref(null);

const updateStatus = (user) => {
  UserService.updateUserStatus(user.id, user.status)
    .catch(error => ErrorUtils.handleError(error, router));
};

const prepareEditUser = (userId) => {
  visible.value = true;
  userIdBeingEdited.value = userId;
};

const loadUsers = () => {
  UserService.getUsers()
    .then(response => users.value = response.data)
    .catch(error => ErrorUtils.handleError(error, router));
};

onMounted(() => {
  loadUsers();
});

</script>