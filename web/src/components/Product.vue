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
            <Select :options="branches" optionLabel="name" optionValue="id" v-model="product.branches"
              placeholder="Filial" class="w-12" />
          </div>
          <div class="w-12">
            <IftaLabel>
              <Textarea class="w-12" id="description" v-model="product.description" rows="5" style="resize: none" />
              <label for="description">Descrição</label>
            </IftaLabel>
          </div>
          <!--<div class="card">
              <Toast />
              <FileUpload
                name="demo[]"
                url="/api/upload"
                :multiple="true"
                accept="image/*"
                :maxFileSize="1000000"
              >
                <template #empty>
                  <span>Coloque as imagens do produto aqui.</span>
                </template>
</FileUpload>
</div> -->
          <div class="w-12">
            <IftaLabel>
              <InputText class="w-12" v-model="product.urlCover" type="text" />
              <label>Url do produto</label>
            </IftaLabel>
          </div>
          <span class="w-12 text-green-500" v-if="successMessage">{{
            successMessage
          }}</span>
          <span class="w-12 text-red-500" v-if="errorMessage">{{
            errorMessage
          }}</span>
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

const onFormSubmit = async () => {
  const erros = [];

  if (!product.value.name || product.value.name.length < 3 || product.value.name.length > 20) {
    erros.push("Campo nome não pode estar vazio e deve conter entre 3 e 20 caracteres.");
  }

  if (!product.value.branches) {
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
    .then(response => branches.value = response.data)
    .catch(error => ErrorUtils.handleError(error, router));
})
</script>