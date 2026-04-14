# APK Local do Itarare Pass

## Objetivo

Rodar o frontend do app dentro do APK e manter as chamadas da API apontando para o servidor remoto.

Isso permite:

- abrir a interface mesmo sem internet
- usar cache local do fluxo do turista
- guardar leituras de placa offline para sincronizar depois

## Modos de execucao

### 1. Modo remoto antigo

Usa `server.url` no Capacitor e abre a app direto do servidor.

PowerShell:

```powershell
$env:CAP_REMOTE_SERVER="1"
npm.cmd run cap:sync
```

### 2. Modo APK local

Remove o `server.url` do Capacitor e usa os arquivos estaticos gerados em `out/`.

PowerShell:

```powershell
$env:CAP_BUILD="1"
$env:NEXT_PUBLIC_API_BASE_URL="https://75.119.133.198.nip.io"
npm.cmd run build
npm.cmd run cap:sync
```

## Observacoes

- No modo local, as chamadas para `/api/*` do frontend sao redirecionadas no cliente para `NEXT_PUBLIC_API_BASE_URL`.
- O fluxo offline do turista depende de o usuario ja ter aberto a app logado ao menos uma vez.
- Cupons continuam exigindo internet para gerar e validar QR comercial.
- Check-ins de placas podem ser guardados offline e sincronizados depois.
