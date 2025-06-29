<template>
  <div>
    <Toolbar style="border-radius: 3rem; padding: 1rem 1rem 1rem 1.5rem">
      <template #start>
        <div class="flex items-center gap-2">
          <img
            src="@/assets/logo.png"
            alt="Imagem SVG"
            width="55"
            height="60"
          />
        </div>
      </template>

      <template #end>
        <div class="flex items-center gap-2">
          <Button label="Logout" class="p-button-danger" @click="logout" />
        </div>
      </template>
    </Toolbar>

    <!-- Espaço entre Toolbar e conteúdo -->
    <div class="w-12 flex mt-3">
      <div class="w-3">
        <PanelMenu :model="items" />
      </div>
      <div class="w-9 p-2">
        <slot />
      </div>
    </div>
  </div>
</template>


<script setup lang="js">

import { useRouter } from "vue-router";
import LoginService from "../services/LoginService";
import { onMounted } from "vue";
import { ref } from "vue";
import ErrorUtils from "@/utils/ErrorUtils";

const router = useRouter();
const items = ref([]);

const logout = () => {
  LoginService.logout();
  router.push("/login");
};

onMounted (() => {
  LoginService.getMenu()
    .then(response => items.value = response.data)
    .catch(error => ErrorUtils.handleError(error, router));
})
</script>