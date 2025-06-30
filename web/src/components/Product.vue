<template>
  <div>
    <Template>
      <div class="w-12 flex justify-content-center">
        <form @submit.prevent="onFormSubmit" class="w-6 flex-column gap-3 flex">
          <div class="w-12">
            <IftaLabel>
              <InputText class="w-12" v-model="product.name" type="text" />
              <label>Nome do produto</label>
            </IftaLabel>
          </div>
          <div class="w-12">
            <IftaLabel>
              <InputNumber class="w-12" v-model="product.amount" showButtons :min="1" />
              <label>Quantidade</label>
            </IftaLabel>
          </div>
          <div class="w-12">
            <Select :options="branches" optionLabel="userName" optionValue="id" v-model="product.branch"
              placeholder="Filial" class="w-12" />
          </div>
          <div class="w-12">
            <IftaLabel>
              <Textarea class="w-12" id="description" v-model="product.description" rows="5" style="resize: none" />
              <label for="description">Descrição</label>
            </IftaLabel>
          </div>
          <div class="w-12">
            <div class="card flex flex-col items-center gap-6">
              <div class="flex flex-col align-items-center gap-3 mb-5">
                <label for="avatar" class="font-semibold w-6rem">Imagem</label>
                <FileUpload name="avatar" mode="basic" customUpload auto @select="onAdvancedUpload" severity="secondary"
                  class="p-button-outlined" />
                <img v-if="product.avatar" :src="product.avatar" alt="Imagem do Produto"
                  class="shadow-md rounded-xl w-24 sm:w-24 mt-3" style="object-fit: cover;" />
              </div>
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

<script setup>
import Template from './Template.vue';
import ProductService from "../services/ProductService";
import BranchService from "../services/BranchService";
import { onMounted, ref } from "vue";
import ErrorUtils from '@/utils/ErrorUtils';
import { useRouter } from "vue-router";

const router = useRouter();

const product = ref({
  name: "",
  amount: "",
  branch: "",
  description: ""
});

const successMessage = ref("");
const errorMessage = ref("");
const branches = ref([]);

const onAdvancedUpload = (event) => {
  const file = event.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const maxWidth = 150;
      const maxHeight = 150;

      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = maxWidth;
          height = maxWidth / aspectRatio;
        } else {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);

      product.value.avatar = resizedBase64;

      console.log('Resized and compressed avatar file:', product.value.avatar);
    };
  };

  reader.readAsDataURL(file);
};

const onFormSubmit = async () => {
  const erros = [];

  if (!product.value.name || product.value.name.length < 3 || product.value.name.length > 20) {
    erros.push("Campo nome não pode estar vazio e deve conter entre 3 e 20 caracteres.");
  }

  if (!product.value.branch) {
    erros.push("Selecione uma filial.");
  }

  if (!product.value.description) {
    erros.push("Descrição não pode estar vazia.");
  }

  if (!product.value.amount || product.value.amount <= 0) {
    erros.push("Valor deve ser maior que zero.");
  }

  if (erros.length > 0) {
    errorMessage.value = erros.join(" ");
    successMessage.value = "";
    return;
  }

  console.log("Product object before sending:", product.value);

  try {
    await ProductService.createProduct(product.value)
    successMessage.value = "Produto cadastrado com sucesso!";
    errorMessage.value = "";

    product.value = {
      name: "",
      amount: "",
      branch: "",
      description: ""
    };
  } catch (error) {
    errorMessage.value = ErrorUtils.asMessage(error, router);
    successMessage.value = '';
  }
};

onMounted(() => {
  BranchService.getBranches()
    .then(response => {
      branches.value = response.data;
      console.log('Branches loaded:', branches.value);
    })
    .catch(error => ErrorUtils.handleError(error, router));
})
</script>
