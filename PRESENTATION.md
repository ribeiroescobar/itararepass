
# 🎫 Itararé Pass - Documentação do Pitch

## 🚀 Visão Geral
O **Itararé Pass** não é apenas um guia turístico; é uma ferramenta de fomento econômico e combate à informalidade hoteleira. Através de uma experiência gamificada, conectamos o turista aos pontos naturais e ao comércio local.

## 🛠️ Stack Tecnológica (O Porquê das Escolhas)

### 1. Next.js 15 + React 19
*   **Performance**: Uso intensivo de *Server Components* para garantir que o app carregue instantaneamente, mesmo em conexões de borda.
*   **PWA Nativo**: A estrutura permite que o app seja instalado no celular, ocupando pouco espaço e funcionando como um aplicativo nativo.

### 2. Genkit + Google Gemini (IA)
*   **Inteligência Contextual**: Diferente de apps estáticos, o Itararé Pass utiliza IA generativa para criar insights culturais em tempo real após cada check-in.
*   **Engajamento**: A IA transforma cada visita em uma micro-aula de história, aumentando o tempo de permanência no app.

### 3. Leaflet.js (Mapas Offline)
*   **Resiliência**: Escolhemos Leaflet por sua leveza e capacidade de lidar com camadas de mapa em cache, essencial para os cânions de Itararé onde o sinal 4G é inexistente.

### 4. Tailwind CSS + ShadCN UI
*   **Design System**: Garantimos uma interface profissional, limpa e acessível (UX/UI de alto nível) com produtividade máxima no desenvolvimento.

## 🛡️ O Diferencial: Validação Híbrida
O maior trunfo do projeto contra a informalidade:
1.  **Check-in GPS**: Valida a presença física nos parques.
2.  **QR Code Físico**: Para desbloquear os cupons de maior valor (30%+), o turista **precisa** escanear um código que só existe no balcão de hotéis e pousadas legalizadas.
3.  **Resultado**: Incentivamos o turista a se hospedar em locais oficiais para conseguir os melhores descontos na cidade.

## 📈 Escalabilidade
O modelo de dados foi desenhado para ser replicado em qualquer cidade turística do Brasil que sofra com a desconexão entre parques e centro urbano.
