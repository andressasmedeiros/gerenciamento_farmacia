<template>
  <div>
    <DataTable :value="groupedProducts" tableStyle="min-width: 50rem">
      <template #header>
        <div class="flex flex-wrap justify-end gap-2">
        </div>
      </template>
      <Column field="name" header="Nome"></Column>
      <Column field="url_cover" header="Imagem">
        <template #body="slotProps">
          <img :src="slotProps.data.url_cover" class="shadow-lg" width="100" />
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
const groupedProducts = ref([]);

const groupProducts = (productsList) => {
  const grouped = {};

  productsList.forEach(product => {
    if (!grouped[product.name]) {
      grouped[product.name] = {
        id: product.id,
        name: product.name,
        totalAmount: product.amount,
        description: product.description,
        url_cover: product.url_cover,
      };
    } else {
      grouped[product.name].totalAmount += product.amount;
    }
  });

  return Object.values(grouped); // Retorna um array com os produtos agrupados
};

const getProducts = async () => {
  try {
    const response = await ProductService.getProducts();
    products.value = response;

    // Agrupar produtos e atualizar a variável
    groupedProducts.value = groupProducts(products.value);
  } catch (error) {
    console.error("Erro ao carregar produtos", error);
    ErrorUtils.handleError(error, router);
  }
};

onMounted(() => {
  getProducts();
});
</script>
