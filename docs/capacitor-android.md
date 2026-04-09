# Capacitor Android - Itarare Pass

Este guia empacota o app atual (Next.js) em um APK usando Capacitor.
Neste primeiro passo, o app roda via URL de producao (server.url).

## 1) Pre-requisitos
- Node.js 18+ instalado
- Android Studio instalado
- Java 17 (JDK)

## 2) Defina a URL do app
No arquivo `capacitor.config.ts`, ajuste:
```
server.url = "https://SEU_DOMINIO_AQUI"
```

Opcional: defina a variavel de ambiente `NEXT_PUBLIC_APP_URL` antes do build.

## 3) Instale dependencias
```
npm install
```

## 4) Crie o projeto Android
```
npm run cap:add:android
```

## 5) Sincronize os arquivos
```
npm run cap:sync
```

## 6) Abra no Android Studio
```
npm run cap:open:android
```

## 7) Gere o APK
No Android Studio:
- Build > Build Bundle(s) / APK(s) > Build APK(s)

O APK aparece em:
`android/app/build/outputs/apk/`

## Observacoes
- Este modelo usa a URL do servidor (app online).
- No proximo passo faremos cache offline e fila de sincronizacao.
