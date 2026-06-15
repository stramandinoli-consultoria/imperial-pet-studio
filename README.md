# Imperial Pet Studio

## Informações do Projeto

**Descrição**: Site para banho e tosa, produtos para pets  
**Website**: https://imperialpets.com.br

---

## Como editar este código?

Existem algumas formas de editar a aplicação.

### Usando sua IDE preferida

Se quiser trabalhar localmente com sua própria IDE, clone o repositório e envie as alterações.  
O único requisito é ter Node.js e npm instalados — [instale com o nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

Siga os passos abaixo:

```sh
# Passo 1: Clone o repositório usando a URL do projeto.
git clone <SUA_URL_GIT>

# Passo 2: Navegue até o diretório do projeto.
cd <NOME_DO_PROJETO>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com recarregamento automático.
npm run dev
```

### Editando diretamente no GitHub

- Navegue até o arquivo desejado.
- Clique no botão **Editar** (ícone de lápis) no canto superior direito.
- Faça suas alterações e confirme o commit.

### Usando o GitHub Codespaces

- Acesse a página principal do repositório.
- Clique no botão **Code** (botão verde) no canto superior direito.
- Selecione a aba **Codespaces**.
- Clique em **New codespace** para abrir um novo ambiente.
- Edite os arquivos diretamente no Codespace e faça commit e push ao finalizar.

---

## Tecnologias utilizadas

Este projeto foi construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

---

## Como fazer o deploy?

O projeto pode ser publicado em diversas plataformas de hospedagem, como Vercel, Netlify ou GitHub Pages.

---

## Informações de Domínio

O projeto está configurado para usar o domínio personalizado: **imperialpets.com.br**

### Deploy no Railway

Para publicar o projeto no Railway com o domínio personalizado:

**1. Vincule o repositório ao Railway**

- Crie um novo projeto no Railway
- Conecte seu repositório do GitHub
- O Railway detectará automaticamente a configuração do arquivo `railway.json`
- O projeto inclui um arquivo `.npmrc` que configura o npm para excluir dependências de desenvolvimento em produção
- A configuração do Vite permite acesso tanto pelo domínio do Railway quanto pelo domínio personalizado

**2. Configure o DNS**

No painel do seu registrador de domínio (ex: GoDaddy, Namecheap), adicione os seguintes registros:

```
A       imperialpets.com.br      76.76.21.21
CNAME   www.imperialpets.com.br  railway.app
```

**3. Verifique o domínio no Railway**

- No seu projeto Railway, acesse **Settings > Domains**
- Clique em **Add Domain** e informe `imperialpets.com.br`
- O Railway irá validar as configurações de DNS
- Adicione também `www.imperialpets.com.br` se necessário

**4. Certificado SSL**

- O Railway provisiona automaticamente um certificado SSL via Let's Encrypt
- Isso garante acesso seguro via HTTPS ao seu site

> ⏱️ Após a configuração, o site estará acessível em https://imperialpets.com.br assim que a propagação de DNS for concluída (pode levar até 24-48 horas).
