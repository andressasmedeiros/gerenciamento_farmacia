# Farma Transportes - Sistema de Gerenciamento de Farmácias
## Visão Geral
Farma Transportes é um sistema completo para gerenciamento de usuários, produtos e movimentações de estoque entre filiais, garantindo rastreabilidade, segurança e eficiência na distribuição de produtos.
Este repositório reúne dois projetos principais:

Backend: API para gerenciamento e controle dos dados e regras de negócio.

Frontend (Web): Interface web amigável para interação dos usuários com o sistema.

## Backend - API Farma Transportes
Sobre o Projeto
API backend desenvolvida para controle completo de usuários, produtos e movimentações entre filiais, com segurança e autenticação robusta.

## Problema Resolvido
Permite que filiais cadastrem produtos, gerenciem estoques e realizem movimentações seguras, garantindo entregas via motoristas autorizados. Controla acessos para que apenas usuários permitidos executem ações.

## Tecnologias Utilizadas
Backend: Node.js com Express

Banco de Dados: PostgreSQL com TypeORM

Autenticação: JWT (JSON Web Token)

Hash de Senha: Bcrypt

## Melhorias Futuras
Implementar testes automatizados

Criar interface web para gestão (frontend)

Melhorar logs de auditoria e histórico de movimentações

Atualizar produtos automaticamente ao finalizar movimentações

## Frontend - Web Gerenciamento Farmácia
Sobre o Projeto
Aplicação web que permite a usuários autorizados visualizar e controlar produtos, estoques e movimentações entre filiais, com uma interface responsiva e intuitiva.

## Problema Resolvido
Facilita o gerenciamento das operações da farmácia, garantindo eficiência, segurança e facilidade de uso na visualização e cadastro de produtos e movimentações.

## Tecnologias Utilizadas
Frontend: Vue.js

Estilização: PrimeVue e PrimeFlex

Comunicação com API Backend: Axios

Gerenciamento de Estado: Vuex ou Composition API

Build e Desenvolvimento: Vite (ou Vue CLI)

## Melhorias Futuras
Adicionar testes automatizados de interface

Melhorar responsividade e usabilidade

Integrar notificações em tempo real para movimentações e alertas


## Como Executar o Projeto
1. Clone este repositório:
   ```sh
   git clone https://github.com/andressasmedeiros/gerenciamento_farmacia.git
   ```
2. Instale as dependências:
   ```sh
   cd web
   npm install

   cd api
   npm install
   ```
3. Clone o arquivo .env-example e preencha as variáveis de ambiente

4. Rode as migrações:
   ```sh
   cd api
   npx typeorm-ts-node-commonjs -d ./src/data-source.ts migration:run
   ```
5. Inicie o servidor:
   ```sh
   cd web
   npm run serve

   cd api
   npm run start
   ```
6. Abra seu navegador em http://localhost:3000
