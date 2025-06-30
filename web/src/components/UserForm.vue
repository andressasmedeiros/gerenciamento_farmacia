<template>
    <div class="w-12 flex justify-content-center">
        <form @submit.prevent="onFormSubmit" class="w-6 flex-column gap-3 flex">

            <div class="w-12">
                <IftaLabel>
                    <InputText class="w-12" v-model="user.name" type="text" />
                    <label>Nome</label>
                </IftaLabel>
            </div>

            <div class="w-12" v-if="props.showEmail">
                <IftaLabel>
                    <InputText class="w-12" v-model="user.email" type="text" />
                    <label>Email</label>
                </IftaLabel>
            </div>

            <div class="w-12" v-if="props.showPassword">
                <IftaLabel>
                    <Password class="w-12" v-model="user.password" :feedback="false" toggleMask />
                    <label for="password">Password</label>
                </IftaLabel>
            </div>

            <div class="w-12" v-if="props.showProfile">
                <Select :options="profiles" optionLabel="name" optionValue="code" v-model="user.profile"
                    placeholder="Perfil" class="w-12" />
            </div>

            <div class="w-12" v-if="props.showDocument">
                <IftaLabel>
                    <InputText class="w-12" v-model="user.document" type="text"
                        :maxlength="user.profile === 'BRANCH' ? 18 : 14" @input="onDocumentInput" />
                    <label>{{ user.profile === 'BRANCH' ? 'CNPJ' : 'CPF' }}</label>
                </IftaLabel>
            </div>

            <div class="w-12 flex gap-3">
                <div class="w-8">
                    <IftaLabel>
                        <InputText class="w-12" v-model="user.address.street" type="text" />
                        <label>Rua</label>
                    </IftaLabel>
                </div>
                <div class="w-4">
                    <IftaLabel>
                        <InputText class="w-12" v-model="user.address.number" type="text" />
                        <label>Número</label>
                    </IftaLabel>
                </div>
            </div>

            <div class="w-12">
                <IftaLabel>
                    <InputText class="w-12" v-model="user.address.neighborhood" type="text" />
                    <label>Bairro</label>
                </IftaLabel>
            </div>

            <div class="w-12">
                <IftaLabel>
                    <InputText class="w-12" v-model="user.address.city" type="text" />
                    <label>Cidade</label>
                </IftaLabel>
            </div>

            <div class="w-12">
                <IftaLabel>
                    <InputText class="w-12" v-model="user.address.state" type="text" />
                    <label>Estado</label>
                </IftaLabel>
            </div>

            <div class="w-full flex gap-3">
                <div class="w-8">
                    <IftaLabel>
                        <InputText class="w-full" v-model="user.address.complement" type="text" />
                        <label>Complemento</label>
                    </IftaLabel>
                </div>

                <div class="w-4">
                    <IftaLabel>
                        <InputText class="w-full" v-model="user.address.zip_code" maxlength="9" type="text" />
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
            <Button type="submit" severity="secondary" :label="props.isCreating ? 'Cadastrar' : 'Salvar'" />
        </form>
    </div>
</template>

<script setup lang="js">
import UserService from "../services/UserService";
import StringUtils from '@/utils/StringUtils';
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import ErrorUtils from '@/utils/ErrorUtils';

const router = useRouter();
const user = ref({
    name: '',
    email: '',
    password: '',
    profile: '',
    document: '',
    address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        complement: '',
    },
    avatar: ''
});
const successMessage = ref('');
const errorMessage = ref('');

const props = defineProps({
    userId: {
        type: Number,
        default: null
    },
    showDocument: {
        type: Boolean,
        default: true
    },
    showEmail: {
        type: Boolean,
        default: true
    },
    showProfile: {
        type: Boolean,
        default: true
    },
    isCreating: {
        type: Boolean,
        default: true
    },
    showPassword: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['userCreated', 'userUpdated']);

const profiles = ref([
    { name: 'Administrador', code: 'ADMIN' },
    { name: 'Motorista', code: 'DRIVER' },
    { name: 'Filial', code: 'BRANCH' }
]);

const onFormSubmit = async () => {
    const erros = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (props.showEmail && !user.value.email || !emailRegex.test(user.value.email)) {
        erros.push("Email inválido.");
    }

    if (props.showPassword) {
        if (!user.value.password || user.value.password.length < 6 || user.value.password.length > 20) {
            erros.push("A senha deve conter entre 6 e 20 caracteres.");
        }
    }


    if (!user.value.name || user.value.name.length < 3 || user.value.name.length > 240) {
        erros.push("O nome deve conter entre 3 e 240 caracteres.");
    }

    if (props.showProfile && !user.value.profile) {
        erros.push("Selecione um perfil.");
    }

    if (props.showDocument) {
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
    }

    if (!user.value.address.street || user.value.address.street.length < 2) {
        erros.push("A rua deve ser informada.");
    }

    if (!user.value.address.number) {
        erros.push("O número deve ser informado.");
    }

    if (!user.value.address.neighborhood || user.value.address.neighborhood.length < 2) {
        erros.push("O bairro deve ser informado.");
    }

    if (!user.value.address.city || user.value.address.city.length < 2) {
        erros.push("A cidade deve ser informada.");
    }

    if (!user.value.address.state || user.value.address.state.length < 2) {
        erros.push("O estado deve ser informado.");
    }

    if (!user.value.address.zip_code || user.value.address.zip_code.length < 9) {
        erros.push("O CEP deve ser informado corretamente.");
    } else {
        if (!StringUtils.isValidCep(user.value.address.zip_code)) {
            erros.push("CEP inválido no formato.");
        } else {
            const existeCep = await cepExists(user.value.address.zip_code);
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

    if (props.isCreating) {
        UserService.createUser(user.value)
            .then(() => {
                user.value = {
                    name: '',
                    email: '',
                    password: '',
                    profile: '',
                    document: '',
                    address: {
                        street: '',
                        number: '',
                        neighborhood: '',
                        city: '',
                        state: '',
                        zip_code: '',
                        complement: '',
                    },
                    avatar: ''
                };
                successMessage.value = "Usuário cadastrado com sucesso!";
                errorMessage.value = '';

                emit('userCreated');
            })
            .catch(error => {
                errorMessage.value = ErrorUtils.asMessage(error, router);
                successMessage.value = '';
            });
    } else {
        UserService.updateUser(props.userId, user.value)
            .then(() => {
                successMessage.value = "Usuário atualizado com sucesso!";
                errorMessage.value = '';

                emit('userUpdated');
            })
            .catch(error => {
                errorMessage.value = ErrorUtils.asMessage(error, router);
                successMessage.value = '';
            });
    }
}

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

watch(() => user.value.address.zip_code, (val) => {
    if (!val) return;
    let formatted = StringUtils.formatCep(val);
    user.value.address.zip_code = formatted.slice(0, 9);
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

onMounted(async () => {
    if (props.userId) {
        try {
            const response = await UserService.getUserById(props.userId);
            Object.assign(user.value, response.data);
        } catch (error) {
            errorMessage.value = ErrorUtils.asMessage(error, router);
        }
    }
});
</script>


<style scoped>
:deep(.p-password) {
    width: 100%;
}

:deep(.p-password input) {
    width: 100%;
}
</style>