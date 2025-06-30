<template>
  <div>
    <DataTable :value="products" dataKey="id" tableStyle="min-width: 60rem">
      <template #header>
        <div class="flex flex-wrap justify-end gap-2">
          <Button text icon="pi pi-plus" label="Cadastrar" @click="createProduct" />
        </div>
      </template>
      <Column field="name" header="Nome"></Column>
      <Column header="Imagem">
        <template #body="slotProps">
          <img v-if="slotProps.data.avatar" :src="`data:image/jpeg;base64,${slotProps.data.avatar}`" alt="Avatar"
            style="width: 40px; height: 40px; border-radius: 50%;" />
          <span v-else>Sem Imagem</span>
        </template>
      </Column>
      <Column field="amount" header="Quantidade" />
      <Column field="description" header="Descrição" />
      <Column field="branch.id" header="Filial"></Column>
      <Column header="Ação">
        <template #body="slotProps">
          <Button label="Editar" icon="pi pi-pencil" class="p-button-sm"
            @click="() => prepareEditProduct(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="visible" modal header="Editar Produto" :style="{ width: '25rem' }">
      <span class="p-text-secondary block mb-5">Atualize as informações</span>
      <div class="flex align-items-center gap-3 mb-3">
        <label for="username" class="font-semibold w-6rem">Nome</label>
        <InputText id="username" class="flex-auto" v-model="product.name" autocomplete="off" />
      </div>
      <div class="flex align-items-center gap-3 mb-5">
        <label for="avatar" class="font-semibold w-6rem">Imagem</label>
        <FileUpload name="avatar" mode="basic" customUpload auto @select="onAdvancedUpload" severity="secondary"
          class="p-button-outlined" />
        <img v-if="product.avatar" :src="product.avatar" alt="Imagem do Produto"
          class="shadow-md rounded-xl w-24 sm:w-24 mt-3" style="object-fit: cover;" />
      </div>
      <div class="flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="visible = false"></Button>
        <Button type="button" label="Salvar" @click="saveProduct"></Button>
      </div>
    </Dialog>

    <Toast />
  </div>
</template>


<script setup lang="js">
import ProductService from "../services/ProductService";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ErrorUtils from '@/utils/ErrorUtils';

const router = useRouter();
const visible = ref(false);
const product = ref({
  name: "",
  avatar: ""
});
const products = ref([]);
const successMessage = ref('');
const errorMessage = ref('');

const saveProduct = async () => {
  try {
    if (product.value.avatar) {
      await ProductService.updateProduct(product.value.id, {
        name: product.value.name,
        avatar: product.value.avatar
      });
    }

    successMessage.value = "Produto atualizado com sucesso!";
    errorMessage.value = '';

    getProducts();
    visible.value = false;
  } catch (error) {
    errorMessage.value = ErrorUtils.asMessage(error, router);
    successMessage.value = '';
    console.error("Erro ao salvar produto", error);
  }
};

const prepareEditProduct = (productData) => {
  console.log('Produto para editar:', productData);

  product.value = {
    id: productData.id,
    name: productData.name,
    avatar: productData.avatar,
    amount: productData.amount,
    description: productData.description,
    branch_id: productData.branch_id
  };

  visible.value = true;
};

const getProducts = async () => {
  try {
    const response = await ProductService.getProducts();
    products.value = response;
    console.log("Produtos carregados com sucesso.");
  } catch (error) {
    console.error("Erro ao carregar produtos", error);
    ErrorUtils.handleError(error, router);
  }
};

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

      product.value.avatar = resizedBase64; // Atualiza o avatar do produto
    };
  };

  reader.readAsDataURL(file);
};

onMounted(() => {
  getProducts();
});
</script>
