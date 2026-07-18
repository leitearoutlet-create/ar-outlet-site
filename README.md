# A.R Outlet React v0.3

Nesta versão:
- Produtos do painel são lidos do Cloud Firestore em tempo real.
- Cadastro, edição e exclusão são salvos na coleção `produtos`.
- A vitrine da página inicial também lê a coleção `produtos`.
- Fotos pequenas (até 450 KB) podem ser salvas temporariamente no documento.

## Executar

```bash
npm install
npm run dev
```

## Configuração

Crie um arquivo `.env` baseado em `.env.example` e preencha as variáveis do aplicativo Web do Firebase.

## Observação sobre fotos

O Firestore limita cada documento a 1 MiB. Por isso esta versão aceita imagens pequenas. Para fotos normais da loja, o próximo passo é integrar Cloudinary ou Firebase Storage.
