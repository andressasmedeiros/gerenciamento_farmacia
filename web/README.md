# Gerenciamento Farmácia (Web)
## Sobre o Projeto
Este é o front-end web para o sistema de gerenciamento de farmácias, que permite aos usuários visualizar e controlar produtos, estoque e movimentações entre filiais com interface amigável e responsiva.

## Problema Resolvido
A aplicação web facilita o gerenciamento das operações da farmácia, permitindo que usuários autorizados monitorem estoques, cadastrem produtos e visualizem movimentações de forma intuitiva, garantindo eficiência e segurança no controle.

## Tecnologias Utilizadas
Frontend: Vue.js
Estilização: PrimeVue e PrimeFlex
Comunicação com API Backend: Axios
Gerenciamento de Estado: Vuex (se usar) ou Composition API
Build e Desenvolvimento: Vite (ou Vue CLI, se usar)


## Como Executar o Projeto
1. Clone este repositório:
   ```sh
   git clone https://github.com/andressasmedeiros/gerenciamento_farmacia.git
   ```
2. Instale as dependências:
   ```sh
   cd backend-farmacia-web
   npm install
   ```
3. Clone o arquivo .env-example e preencha as variáveis de ambiente

4. Rode as migrações:
   ```sh
   npx typeorm-ts-node-commonjs -d ./src/data-source.ts migration:run
   ```
5. Inicie o servidor:
   ```sh
   npm run serve
   ```
6. Abra seu navegador em http://localhost:3000

##Melhorias Futuras
Adicionar testes automatizados de interface
Melhorar responsividade e usabilidade
Integrar notificações em tempo real para movimentações e alertas
