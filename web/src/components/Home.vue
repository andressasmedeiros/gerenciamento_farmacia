<template>
  <div>
    <Template>
      <div>
        <AdminHome v-if="'ADMIN' === profile" />
        <DriverHome v-else-if="'DRIVER' === profile" />
        <BranchHome v-else-if="'BRANCH' === profile" />
      </div>
    </Template>
  </div>
</template>

<script setup lang="js">
import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import LoginService from "../services/LoginService";
import AdminHome from './AdminHome.vue';
import DriverHome from './DriverHome.vue';
import BranchHome from './BranchHome.vue';
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
