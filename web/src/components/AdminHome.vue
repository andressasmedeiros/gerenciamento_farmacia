<template>
  <div>
    <div v-if="isLoading">
      <ProgressSpinner />
    </div>
    <div v-else>
      <p>CONTEUDO DA PAGINA</p>
    </div>
  </div>
</template>

<script setup lang="js">
import { onMounted, ref } from 'vue';
import LoginService from '@/services/LoginService';
import { useRouter } from 'vue-router';
import ErrorUtils from '@/utils/ErrorUtils';

const isLoading = ref(true);
const router = useRouter();

onMounted(() => {
  LoginService.validateToken()
    .then(() => isLoading.value = false)
    .catch(() => ErrorUtils.handleError(error, router));
});


</script>
