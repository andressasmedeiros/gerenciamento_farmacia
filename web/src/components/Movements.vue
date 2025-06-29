<template>
  <div>
    <Template>
      <div>
        <DriverMovements v-if="'DRIVER' === profile" />
        <BranchMovements v-else-if="'BRANCH' === profile" />
      </div>
    </Template>
  </div>
</template>

  
  <script setup lang="js">
  import { onMounted, ref } from 'vue';
  import { useRouter } from "vue-router";
  import LoginService from "../services/LoginService";
  import BranchMovements from './BranchMovements.vue';
  import DriverMovements from './DriverMovements.vue';
  import Template from './Template.vue';
  
  const router = useRouter();
  
  const profile = ref("");
  
  onMounted(() => {
    profile.value = LoginService.getProfile();
    if (!profile.value) {
      LoginService.logout();
      router.push("/login");
    }
  });
  
  </script>
  
  <style scoped>
  </style>
  