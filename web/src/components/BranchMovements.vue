<template>
    <div>
        <Fieldset legend="Movimentações de Entrada" class="mb-4">
            <DataTable :value="inboundMovements" showGridlines>
                <Column field="product.branch.user.name" header="Destino"></Column>
                <Column field="product.name" header="Produto"></Column>
                <Column field="quantity" header="Quantidade" />
                <Column field="status" header="Status"></Column>
            </DataTable>
        </Fieldset>

        <Fieldset legend="Movimentações de Saída" class="mb-4">
            <DataTable :value="outboundMovements" showGridlines>
                <Column field="destinationBranches.user.name" header="Destino"></Column>
                <Column field="product.name" header="Produto"></Column>
                <Column field="quantity" header="Quantidade" />
                <Column field="status" header="Status"></Column>
            </DataTable>
        </Fieldset>
        <Toast />
    </div>
</template>

<script setup lang="js">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ErrorUtils from '@/utils/ErrorUtils';
import MovementService from '@/services/MovementService';

const router = useRouter();
const inboundMovements = ref([]);
const outboundMovements = ref([]);


onMounted(() => {
    MovementService.getInboundMovements()
        .then(response => inboundMovements.value = response.data)
        .catch(error => ErrorUtils.handleError(error, router));

    MovementService.getOutboundMovements()
        .then(response => outboundMovements.value = response.data)
        .catch(error => ErrorUtils.handleError(error, router));
})

</script>