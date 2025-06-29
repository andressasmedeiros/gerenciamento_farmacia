import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import App from './App.vue';
import Home from './components/Home.vue';
import Mapa from './components/Mapa.vue';
import Login from './components/Login.vue';
import Users from './components/Users.vue';
import Product from './components/Product.vue';
import Products from './components/Products.vue';
import Movements from './components/Movements.vue';
import ProductsReceived from './components/ProductsReceived.vue';
import Movement from './components/Movement.vue';
import User from './components/User.vue';
import { Dialog } from 'primevue/dialog';

import PrimeVue from 'primevue/config';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Aura from '@primeuix/themes/aura';

import {
  InputText,
  Password,
  Button,
  ProgressSpinner,
  Toolbar,
  PanelMenu,
  DataTable,
  Column,
  ColumnGroup,
  Row,
  ToggleSwitch,
  IftaLabel,
  Select,
  Tag,
  Textarea,
  FileUpload,
  InputNumber,
  Fieldset
} from 'primevue';

import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/users', component: Users },
  { path: '/user', component: User },
  { path: '/products', component: Products },
  { path: '/product', component: Product },
  { path: '/movement', component: Movement },
  { path: '/movements', component: Movements },
  { path: '/products/received', component: ProductsReceived },
  { path: '/mapa', component: Mapa }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const app = createApp(App);

app.use(router);
app.use(ToastService);
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

// Registrando componentes PrimeVue
app.component('Button', Button);
app.component('Password', Password);
app.component('InputText', InputText);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Toolbar', Toolbar);
app.component('PanelMenu', PanelMenu);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);
app.component('ToggleSwitch', ToggleSwitch);
app.component('IftaLabel', IftaLabel);
app.component('Select', Select);
app.component('Tag', Tag);
app.component('Toast', Toast); // Registra Toast apenas uma vez
app.component('Textarea', Textarea);
app.component('FileUpload', FileUpload);
app.component('InputNumber', InputNumber);
app.component('Fieldset', Fieldset);
app.component('Dialog', Dialog);

app.mount('#app');
