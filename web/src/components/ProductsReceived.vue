<template>
    <div>
        <Template>
            <Fieldset legend="Movimentações de Entrada" class="mb-4">
                <DataTable :value="movements" showGridlines>
                    <Column field="product.name" header="Produto" />
                    <Column field="quantity" header="Quantidade" />
                    <Column field="status" header="Status" />
                    <Column header="Ação">
                        <template #body="slotProps">
                            <Button icon="pi pi-check" @click=" () => finish(slotProps.data.id)" text />
                        </template> 
                    </Column>
                </DataTable>
            </Fieldset>
        </Template>
    </div>
</template>

<script setup lang="js">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ErrorUtils from '@/utils/ErrorUtils';
import Template from './Template.vue';
import MovementService from '@/services/MovementService';

const router = useRouter();
const movements = ref([]);

const finish = (id) => {
    MovementService.finishMovement(id)
        .then(() => {
            populateMovements();
        })
        .catch(error => ErrorUtils.handleError(error, router));
}

const populateMovements = () => {
    MovementService.getFinishedMovements()
        .then(response => movements.value = response.data)
        .catch(error => ErrorUtils.handleError(error, router));
}

onMounted(() => {
    populateMovements();    
})

</script>