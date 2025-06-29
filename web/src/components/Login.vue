<template>
  <div class="flex justify-content-center align-items-center h-100vh">
    <form class="w-2" @submit.prevent="login">
      <InputText class="w-12" v-model="email" placeholder="Email" />
      <div class="w-12">
        <Password v-model="password" placeholder="Password" :feedback="false" toggleMask />
      </div>
      <span class="error w-12" v-if="errorMessage">{{ errorMessage }}</span>
      <Button class="w-12" type="submit" label="Login" />
    </form>
  </div>
</template>
  
<script setup lang="js">
import { ref } from "vue";
import { onMounted } from 'vue';
import { useRouter } from "vue-router";
import LoginService from "../services/LoginService";
import ErrorUtils from "@/utils/ErrorUtils";

const router = useRouter();

const errorMessage = ref("");
const email = ref("");
const password = ref("");
const login = () => {
  const erros = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value || !emailRegex.test(email.value)) {
    erros.push("Email inválido.");
  }
  if (!password.value || password.value.length < 6 || password.value.length > 20) {
    erros.push(
      "A senha não pode estar vazia e deve conter entre 6 e 20 caracteres."
    );
  }
  if (erros.length > 0) {
    errorMessage.value = erros.join(" ");
    return;
  }

  LoginService.login(email.value, password.value)
  .then(() => router.push("/"))
  .catch(error => errorMessage.value = ErrorUtils.asMessage(error));

};

onMounted(() => {
    if (LoginService.tokenExists()) {
    router.push("/");
  }
})
</script>
  
  
<style scoped>
.error {
  color: red;
}

.h-100vh {
  height: 100vh;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}
</style>  