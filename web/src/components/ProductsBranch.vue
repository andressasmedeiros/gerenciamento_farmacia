<template>
  <div>
    <DataTable :value="products" tableStyle="min-width: 50rem">
      <template #header>
        <div class="flex flex-wrap justify-end gap-2">
        </div>
      </template>
      <Column field="name" header="Nome"></Column>
      <Column header="Imagem">
        <template #body="slotProps">
          <img :src="`data:image/jpeg;base64,${slotProps.data.avatar}`" alt="Avatar"
            style="width: 40px; height: 40px; border-radius: 50%;" />
        </template>
      </Column>
      <Column field="totalAmount" header="Quantidade"></Column>
      <Column field="description" header="Descrição"></Column>
    </DataTable>
    <Toast />
  </div>
</template>

<script setup>
import ProductService from "../services/ProductService";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ErrorUtils from '@/utils/ErrorUtils';

const router = useRouter();
const products = ref([]);

const getProducts = async () => {
  try {
    const response = await ProductService.getProducts();
    products.value = response;
  } catch (error) {
    console.error("Erro ao carregar produtos", error);
    ErrorUtils.handleError(error, router);
  }
};

onMounted(() => {
  getProducts();
});
</script>
