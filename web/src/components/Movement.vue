<template>
    <div>
        <Template>
            <div class="w-12 flex justify-content-center">
                <form @submit.prevent="onFormSubmit" class="w-6 flex-column gap-3 flex">
                    <div class="w-12">
                        <Select :options="branches" optionLabel="name" optionValue="id"
                            v-model="movement.destinationBranchId" placeholder="Filial Destino" class="w-12" />
                    </div>
                    <div class="w-12">
                        <Select :options="groupedProducts" optionLabel="name" v-model="movement.product"
                            @change="movement.quantity = null" placeholder="Produtos" class="w-12">
                            <template #option="slotProps">
                                <span>{{ slotProps.option.name }} - quantidade: {{ slotProps.option.amount }}</span>
                            </template>
                        </Select>
                    </div>
                    <div class="w-12">
                        <IftaLabel>
                            <InputNumber class="w-12"
                                :disabled="!movement.product || (movement.product.amount ?? 0) <= 0"
                                v-model="movement.quantity"
                                showButtons 
                                :min="1" 
                                :max="movement.product?.amount ?? 1" />
                            <label>Quantidade</label>
                        </IftaLabel>
                    </div>
                    <div class="w-12">
                        <IftaLabel>
                            <Textarea class="w-12" id="description" v-model="movement.description" rows="5"
                                style="resize: none" />
                            <label for="description">Descrição</label>
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
import ErrorUtils from '@/utils/ErrorUtils';
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import MovementService from '@/services/MovementService';

const router = useRouter();

const movement = ref({
    destinationBranchId: null,
    product: null,
    quantity: null,
    description: null
});
const successMessage = ref("");
const errorMessage = ref("");
const branches = ref([]);
const groupedProducts = ref([]);

const onFormSubmit = async () => {
    const erros = [];

    if (!movement.value.destinationBranchId) {
        erros.push("Selecione uma filial.");
    }

    if (!movement.value.description) {
        erros.push("Descrição não pode estar vazia.");
    }

    if (!movement.value.product) {
        erros.push("Selecione um produto.");
    }

    if (!movement.value.quantity || movement.value.quantity <= 0) {
        erros.push("Quantidade deve ser maior que zero.");
    }

    if (erros.length > 0) {
        errorMessage.value = erros.join(" ");
        successMessage.value = "";
        return;
    }

    try {
        await MovementService.createMovement(movement.value);
        successMessage.value = "Movimentação cadastrada com sucesso!";
        errorMessage.value = "";
        movement.value = {
            destinationBranchId: null,
            product: null,
            quantity: null,
            description: null
        };
    } catch (error) {
        errorMessage.value = ErrorUtils.asMessage(error, router);
        successMessage.value = '';
    }
};

const groupProducts = (productsList) => {
    if (!Array.isArray(productsList)) {
        console.error("Dados inválidos para agrupar produtos", productsList);
        return [];
    }

    const grouped = {};
    
    productsList.forEach(product => {
        if (!grouped[product.name]) {
            grouped[product.name] = {
                id: product.id,
                name: product.name,
                amount: product.amount,
                description: product.description,
                url_cover: product.url_cover
            };
        } else {
            grouped[product.name].amount += product.amount;
        }
    });

    return Object.values(grouped);
};

const getProducts = async () => {
    try {
        const response = await ProductService.getProducts();
        if (Array.isArray(response)) {
            groupedProducts.value = groupProducts(response);
            console.log("Produtos carregados e agrupados com sucesso.");
        } else {
            console.error("Resposta inválida do serviço de produtos", response);
            groupedProducts.value = [];
        }
    } catch (error) {
        console.error("Erro ao carregar produtos", error);
        ErrorUtils.handleError(error, router);
    }
};

onMounted(() => {
    BranchService.getDestinationBranches()
        .then(response => branches.value = response.data)
        .catch(error => ErrorUtils.handleError(error, router));

    getProducts();
});
</script>

