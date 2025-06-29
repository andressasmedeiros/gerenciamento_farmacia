<template>
    <div>
        <Fieldset legend="Movimentações" class="mb-4">
            <DataTable :expandedRows="expandedRows" :value="movements" @rowExpand="onRowExpand"
                @rowCollapse="onRowCollapse" dataKey="id" showGridlines>
                <Column expander style="width: 5rem" />
                <Column field="createdAt" header="Data">
                    <template #body="slotProps">
                        {{ StringUtils.formatDateTime(slotProps.data.createdAt) }}
                    </template>
                </Column>
                <Column field="product.branch.user.name" header="Origem" />
                <Column field="destinationBranches.user.name" header="Destino" />
                <Column field="product.name" header="Produto"></Column>
                <Column field="quantity" header="Quantidade" />
                <Column header="Ação">
                    <template #body="slotProps">
                        <Button v-if="slotProps.data.status === 'PENDING'" label="Iniciar" rounded icon="pi pi-play"
                            class="p-button-sm" @click="iniciarEntrega(slotProps.data)" />
                        <Button v-else-if="slotProps.data.status === 'IN_PROGRESS'" label="Finalizar" rounded
                            icon="pi pi-check" class="p-button-sm" @click="finalizarEntrega(slotProps.data)" />
                        <Button v-else-if="slotProps.data.status === 'DELIVERED'" label="Concluído" rounded
                            icon="pi pi-check" class="p-button-sm p-button-secondary" disabled />
                    </template>
                </Column>
                <Column header="Mapa">
                    <template #body="slotProps">
                        <Button icon="pi pi-map" severity="success" variant="text" rounded aria-label="Mapa"
                            @click="abrirMapa(slotProps.data)" />
                    </template>
                </Column>

                <template #expansion="slotProps">
                    <div class="p-4">
                        <h3>Histórico</h3>
                        <p>Motorista: {{ slotProps.data.driver?.user.name || 'Nenhum' }}</p>
                        <p>Status: {{ slotProps.data.status }}</p>
                    </div>
                </template>
            </DataTable>
        </Fieldset>
    </div>
</template>

<script setup lang="js">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ErrorUtils from "@/utils/ErrorUtils";
import StringUtils from "@/utils/StringUtils";
import MovementService from "@/services/MovementService";
import BranchService from "@/services/BranchService";

const router = useRouter();
const movements = ref([]);
const branches = ref([]);
const expandedRows = ref([]);

const carregarMovimentos = () => {
    MovementService.getMovements()
        .then((response) => {
            movements.value = response.data;
        })
        .catch((error) => ErrorUtils.handleError(error, router));
};

onMounted(async () => {
    try {
        const branchesRes = await BranchService.getBranchesForMap();
        branches.value = branchesRes.data;
        await carregarMovimentos();
    } catch (error) {
        ErrorUtils.handleError(error, router);
    }
});

const iniciarEntrega = (movement) => {
    MovementService.startMovement(movement.id)
        .then(() => carregarMovimentos())
        .catch((error) => ErrorUtils.handleError(error, router));
};

const finalizarEntrega = (movement) => {
    MovementService.endMovement(movement.id)
        .then(() => carregarMovimentos())
        .catch((error) => ErrorUtils.handleError(error, router));
};

const geocode = async (address) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
        )}`
    );
    const data = await response.json();
    if (data.length === 0) throw new Error("Endereço não encontrado");
    return {
        lat: data[0].lat,
        lng: data[0].lon,
    };
};

const abrirMapa = async (movement) => {
    if (!movement.product?.branch || !movement.destinationBranches) {
        alert("Endereço de origem ou destino não disponível.");
        return;
    }

    const formatAddress = (branch) =>
        `${branch.street} ${branch.number}, ${branch.neighborhood}, ${branch.city} - ${branch.state}, ${branch.zip_code}`;

    const origemAddress = formatAddress(movement.product.branch);
    const destinoAddress = formatAddress(movement.destinationBranches);

    try {
        const origemCoords = await geocode(origemAddress);
        const destinoCoords = await geocode(destinoAddress);

        router.push(
            `/mapa?origemLat=${origemCoords.lat}&origemLng=${origemCoords.lng}&destinoLat=${destinoCoords.lat}&destinoLng=${destinoCoords.lng}`
        );
    } catch (err) {
        alert(
            `Erro ao localizar endereços no mapa. Verifique os endereços:\nOrigem: ${origemAddress}\nDestino: ${destinoAddress}`
        );
        console.error(err);
    }
};
</script>
