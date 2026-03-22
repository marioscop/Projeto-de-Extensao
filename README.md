# Venda Fácil - Trabalho de Extensão Móbile 🚀

> **Sobre o Projeto**
> Este aplicativo foi projetado e desenvolvido de forma integral para compor a disciplina de Trabalho de Extensão Universitária. O objetivo real aqui foi automatizar o processo diário de gerência de vendas e estoque de uma pequena empresa comercial que anteriormente só usava cadernos físicos (papel e caneta) para sua administração financeira. 
> Sendo assim, o app Venda Fácil democratiza a gestão de frente de caixa trazendo poder de hardware (SQLite, Leitor de código de barras pela Câmera) diretamente para as mãos e bolso da comunidade local, de maneira 100% offline (funciona em áreas isoladas e economiza franquia de dados do empreendedor pequeno).

## 🛠 Tecnologias Utilizadas (O que eu decidi usar)
Tentei utilizar arquiteturas modernas porém que fossem fáceis de embarcar no celular:
- **React Native** (Programação moderna por componentes React)
- **Expo SDK 54** (Para emular e empacotar para o mundo iOS e Android rapidamente)
- **SQLite Pragmático (`expo-sqlite`)** (Para garantir a confiabilidade de banco de dados offline)
- **Expo Camera** (Captação das lentes nativa para leitura veloz de Código de Barras e QR Code)
- **React Navigation** (Stacks dinâmicas para ir e voltar das telas e renderização das Abas nativas BottomTab)

## 📌 Funcionalidades Core
- Identificação e Abertura Segura do Fundo de Troco de Caixa do Expediente (Autenticação Simple Mock).
- Tela Frontal de Vendas/PDV contendo varredura manual textual ou varredura de visão de computador pelo Scanner (Câmera).
- Gestão completa de inventário em banco de dados isolado com edição/deleção de estoque e suporte a produtos vendidos por kg ou grama (fração).
- Painel "Dashboard" gerencial do Dia computando o Lucro Total Bruto na hora e checagem de falta de materiais de giro.

## 📱 Como Clonar e Rodar esse Projeto Localmente
Se o meu professor quiser testar o app ao vivo rodando na sua máquina, siga este passo a passo simplão:

1. **Instale os requisitos:** Precisa do [Node.js](https://nodejs.org/) instalado.
2. **Baixe ou clone minha pasta:**
   ```bash
   git clone [url_do_seu_repo_se_existir]
   cd Estacio
   ```
3. **Instale os pacotes e libs do React Native via Expo:**
   No terminal que foi aberto, rode:
   ```bash
   # Usei a tag --legacy-peer-deps apenas pro NPM não reclamar de versões antigas acopladas!
   npm install --legacy-peer-deps
   ```
4. **Acendo o Servidor Start do Expo:**
   Apenas digite:
   ```bash
   npx expo start -c
   ```
   **Dica acadêmica:** Espere o QR Code aparecer gigante na do seu terminal! Leia ele com o aplicativo "Expo Go" no seu dispositivo fixo ou pressione 'w' para abrir uma visão Mock Web. O celular deve estar na mesma Wifi!
   
## 🤓 Estrutura das Pastas
Eu cataloguei assim as responsabilidades para separar as lógicas certinho:
* `/src/database`: O coração e as chaves. Fica lá o meu CRUD do SQLite!
* `/src/navigation`: Minhas rotas de troca de telas e Stack Navigation nativo.
* `/src/screens`: Toda a camada de Design/UX dos módulos interativos (Vendas, Estoques, Dashboard, e Operador!).

Feito com ☕ e bastante foco no mundo de desenvolvimento móbile acadêmico. Mãos à obra!
# Projeto-de-Extensao
