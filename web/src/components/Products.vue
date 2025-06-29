<template>
  <div>
    <Template>
      <div>
        <ProductsAdmin v-if="'ADMIN' === profile" />
        
        <template v-else-if="'BRANCH' === profile">
          <ProductsBranch />
          <ProductsMovements />
        </template>
      </div>
    </Template>
  </div>
</template>


<script setup lang="js">
import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import LoginService from "../services/LoginService";
import ProductsAdmin from './ProductsAdmin.vue';
import ProductsBranch from './ProductsBranch.vue';
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
