# Guia de Deploy - Vercel

Este projeto está configurado para ser implantado na **Vercel** com facilidade. Siga os passos abaixo:

## Pré-requisitos
- Conta na [Vercel](https://vercel.com/)
- Repositório no GitHub contendo este código

## Passos para Deploy

1. **Importar Projeto**
   - No dashboard da Vercel, clique em **"Add New..."** -> **"Project"**.
   - Selecione o repositório do **Rege Finance**.

2. **Configuração de Build (Automático)**
   A Vercel deve detectar automaticamente que é um projeto **Vite**.
   - **Framework Preset**: Vite
   - **Root Directory**: `Rege-Finance` (se o package.json estiver na raiz do repo, deixe em branco. Se estiver na pasta `Rege-Finance`, selecione-a).
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Variáveis de Ambiente**
   É **crucial** configurar as variáveis de ambiente para que a IA funcione.
   Na seção **"Environment Variables"**, adicione:

   | Key              | Value                     |
   |------------------|---------------------------|
   | `GEMINI_API_KEY` | `SuaChaveDeAPIGoogleGemini` |

   > **Nota:** Se você usar um arquivo `.env` local, certifique-se de não subí-lo para o GitHub por segurança. Na Vercel, as variáveis são inseridas nesse painel.

4. **Deploy**
   - Clique em **"Deploy"**.
   - Aguarde o processo de build finalizar.

## Arquivo vercel.json
Um arquivo `vercel.json` foi incluído na raiz para garantir que o roteamento funcione corretamente em uma Single Page Application (SPA), redirecionando todas as requisições para `index.html`.

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
