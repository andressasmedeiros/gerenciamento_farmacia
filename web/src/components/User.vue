<template>
  <div>
    <Template>
      <div class="w-12 flex justify-content-center">
        <form @submit.prevent="onFormSubmit" class="w-6 flex-column gap-3 flex">

          <div class="w-12">
            <IftaLabel>
              <InputText class="w-12" v-model="user.name" type="text" />
              <label>Nome</label>
            </IftaLabel>
          </div>

          <div class="w-12">
            <IftaLabel>
              <InputText class="w-12" v-model="user.email" type="text" />
              <label>Email</label>
            </IftaLabel>
          </div>

          <div class="w-12">
            <IftaLabel>
              <Password class="w-12" v-model="user.password" :feedback="false" toggleMask />
              <label for="password">Password</label>
            </IftaLabel>
          </div>

          <div class="w-12">
            <Select :options="profiles" optionLabel="name" optionValue="code" v-model="user.profile"
              placeholder="Perfil" class="w-12" />
          </div>

          <div class="w-12">
            <IftaLabel>
              <InputText class="w-12" v-model="user.document" type="text"
                :maxlength="user.profile === 'BRANCH' ? 18 : 14" @input="onDocumentInput" />
              <label>{{ user.profile === 'BRANCH' ? 'CNPJ' : 'CPF' }}</label>
            </IftaLabel>
          </div>

          <div class="w-12 flex gap-3">
            <div class="w-8">
              <IftaLabel>
                <InputText class="w-12" v-model="user.street" type="text" />
                <label>Rua</label>
              </IftaLabel>
            </div>
            <div class="w-4">
              <IftaLabel>
                <InputText class="w-12" v-model="user.number" type="text" />
                <label>Número</label>
              </IftaLabel>
            </div>
          </div>

          <div class="w-12">
            <IftaLabel>
              <InputText class="w-12" v-model="user.neighborhood" type="text" />
              <label>Bairro</label>
            </IftaLabel>
          </div>

          <div class="w-12">
            <IftaLabel>
              <InputText class="w-12" v-model="user.city" type="text" />
              <label>Cidade</label>
            </IftaLabel>
          </div>

          <div class="w-12">
            <IftaLabel>
              <InputText class="w-12" v-model="user.state" type="text" />
              <label>Estado</label>
            </IftaLabel>
          </div>

          <div class="w-12 flex gap-3">
            <div class="w-8">
              <IftaLabel>
                <InputText class="w-12" v-model="user.complement" type="text" />
                <label>Complemento</label>
              </IftaLabel>
            </div>

            <div class="w-4">
              <IftaLabel>
                <InputText v-model="user.zip_code" maxlength="9" type="text" />
                <label>CEP</label>
              </IftaLabel>
            </div>
          </div>

          <div class="w-12">
              <div class="card flex flex-col items-center gap-6">
                <FileUpload mode="basic" @select="onAdvancedUpload" customUpload auto severity="secondary"
                  class="p-button-outlined" />
                <img v-if="user.avatar" :src="user.avatar" alt="Image" class="shadow-md rounded-xl w-full sm:w-64"
                  style="filter: grayscale(100%)" />
              </div>
          </div>

          <span class="w-12 text-green-500" v-if="successMessage">{{ successMessage }}</span>
          <span class="w-12 text-red-500" v-if="errorMessage">{{ errorMessage }}</span>
          <Button type="submit" severity="secondary" label="Cadastrar" />
        </form>
      </div>
    </Template>
  </div>
</template>

<script setup lang="js">
import Template from './Template.vue';
import UserService from "../services/UserService";
import StringUtils from '@/utils/StringUtils';
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import ErrorUtils from '@/utils/ErrorUtils';
const avatarFile = ref(null);

const router = useRouter();
const user = ref({
  name: '',
  email: '',
  password: '',
  profile: '',
  document: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  zip_code: '',
  complement: '',
  fullAdress: '',
  avatar: ''
});
const successMessage = ref('');
const errorMessage = ref('');

const profiles = ref([
  { name: 'Administrador', code: 'ADMIN' },
  { name: 'Motorista', code: 'DRIVER' },
  { name: 'Filial', code: 'BRANCH' }
]);

const onAdvancedUpload = (event) => {
  const file = event.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    user.value.avatar = e.target.result;
    console.log('Avatar file selected:', user.value.avatar);
  };

  reader.readAsDataURL(file);
};

watch(() => user.value.document, (val) => {
  if (!val) return;

  if (user.value.profile === 'BRANCH') {
    let formatted = StringUtils.formatCnpj(val);
    user.value.document = formatted.slice(0, 18);
  } else {
    let formatted = StringUtils.formatCpf(val);
    user.value.document = formatted.slice(0, 14);
  }
});

watch(() => user.value.zip_code, (val) => {
  if (!val) return;
  let formatted = StringUtils.formatCep(val);
  user.value.zip_code = formatted.slice(0, 9);
});

async function cepExists(cep) {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Erro ao consultar CEP', error);
    return false;
  }
}

const onFormSubmit = async () => {
  const erros = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!user.value.email || !emailRegex.test(user.value.email)) {
    erros.push("Email inválido.");
  }

  if (!user.value.password || user.value.password.length < 6 || user.value.password.length > 20) {
    erros.push("A senha deve conter entre 6 e 20 caracteres.");
  }

  if (!user.value.name || user.value.name.length < 3 || user.value.name.length > 240) {
    erros.push("O nome deve conter entre 3 e 240 caracteres.");
  }

  if (!user.value.profile) {
    erros.push("Selecione um perfil.");
  }

  if (!user.value.document) {
    erros.push("Documento é obrigatório.");
  } else if (user.value.profile === "BRANCH") {
    if (!StringUtils.isValidCnpj(user.value.document)) {
      erros.push("O documento deve ser um CNPJ válido.");
    }
  } else {
    if (!StringUtils.isValidCpf(user.value.document)) {
      erros.push("O documento deve ser um CPF válido.");
    }
  }

  if (!user.value.street || user.value.street.length < 2) {
    erros.push("A rua deve ser informada.");
  }

  if (!user.value.number) {
    erros.push("O número deve ser informado.");
  }

  if (!user.value.neighborhood || user.value.neighborhood.length < 2) {
    erros.push("O bairro deve ser informado.");
  }

  if (!user.value.city || user.value.city.length < 2) {
    erros.push("A cidade deve ser informada.");
  }

  if (!user.value.state || user.value.state.length < 2) {
    erros.push("O estado deve ser informado.");
  }

  if (!user.value.zip_code || user.value.zip_code.length < 9) {
    erros.push("O CEP deve ser informado corretamente.");
  } else {
    if (!StringUtils.isValidCep(user.value.zip_code)) {
      erros.push("CEP inválido no formato.");
    } else {
      const existeCep = await cepExists(user.value.zip_code);
      if (!existeCep) {
        erros.push("CEP não encontrado.");
      }
    }
  }

  if (erros.length > 0) {
    errorMessage.value = erros.join(" ");
    successMessage.value = "";
    return;
  }

  user.value.fullAdress = `${user.value.street}, ${user.value.number} - ${user.value.neighborhood}, ${user.value.city} - ${user.value.state}, ${user.value.zip_code}` +
    (user.value.complement ? `, ${user.value.complement}` : '');
console.log(user.value);
  UserService.createUser(user.value)
    .then(() => {
      user.value = {
        name: '',
        email: '',
        password: '',
        profile: '',
        document: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        complement: '',
        fullAdress: ''
      };
      avatarFile.value = null;
      successMessage.value = "Usuário cadastrado com sucesso!";
      errorMessage.value = '';
    })
    .catch(error => {
      errorMessage.value = ErrorUtils.asMessage(error, router);
      successMessage.value = '';
    });
}
</script>


<style scoped>
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}
</style>