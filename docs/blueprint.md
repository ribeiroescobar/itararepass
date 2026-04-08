# **App Name**: Itararé Pass

## Core Features:

- Location Check-in: Allows tourists to check-in at predefined points of interest using GPS-based proximity (Haversine formula), with an instant 'DEMO_MODE' override for presentations.
- Progress and Challenges Display: Displays interactive cards for tourist spots showing current status (visited, locked) and call-to-action buttons for check-in or coupon redemption. Includes a circular progress bar in the header and challenge category tabs.
- Generative Local Highlight Tool: After a successful check-in, an AI tool provides a brief, engaging historical fact or unique insight about the visited location to enrich the user experience.
- Coupon Wallet: A dedicated section to display all earned discount coupons from local businesses, ready for redemption.
- User Progress & Rewards Storage: Utilizes Firebase Firestore to persist user progress, visited locations, and earned coupons, ensuring data is available across sessions.
- Offline PWA Functionality: Configures manifest.json and Service Workers to enable offline access to core application features, providing a reliable experience without constant internet connectivity.
- Bottom Navigation: Provides intuitive navigation between main application sections like 'Explorar', 'Meus Cupons', and 'Sobre' via a persistent bottom bar.

## Style Guidelines:

- Primary action color: Vibrant Orange (#FF8C42) for interactive elements such as buttons ('Resgatar Cupom', 'Fazer Check-in', 'Usar Cupom'), conveying energy and prompting user interaction. This bright hue stands out effectively against the dark background.
- Background color: Deep Forest Green (#1A4331) used for the main application background and header, setting a calm, natural, and inviting tone reminiscent of Itararé's landscapes, chosen for its strong contrast with interactive elements.
- Text color: White (#FFFFFF) and other light tones to ensure high readability and contrast against the dark forest green background and highlight interactive elements. Status text for completed challenges uses a distinct success green (e.g., #6DDB4E).
- Progress bar fill color: A lighter shade of green to indicate progress within the circular indicator (e.g., #8BC34A), complementing the overall green theme.
- The 'Inter' sans-serif typeface is recommended for all text elements, including headlines and body text. Its clean, modern, and highly legible design is ideal for a mobile-first application, ensuring clarity and an objective feel, as seen in the 'Olá, Turista! Explore e Ganhe!' and card titles.
- Use clear and intuitive icons for status indicators, such as a green 'Check' for visited/completed locations and an orange 'Padlock' for locked challenges. Additional icons include 'Itararé Pass' logo, PWA indicator, adventure/lodging categories, and navigation icons for 'Explorar', 'Meus Cupons', and 'Sobre' in the bottom bar. All icons should be flat and minimalist for modern aesthetic.
- A mobile-first, clean, and intuitive layout featuring a prominent header with the 'Itararé Pass' logo, a greeting, and a circular progress bar ('3 de 5 Locais Visitados'). Content is organized into easily digestible horizontal-scrolling cards for challenge descriptions and a dedicated section for coupon displays ('Minha Carteira de Cupons'), adhering to modern UI best practices for small screens. A persistent bottom navigation bar allows quick access to main sections.
- Subtle and functional animations should be used sparingly, primarily for visual feedback on user interactions like successful check-ins, coupon redemptions, and state transitions of challenge cards or navigation taps, enhancing the user experience without being distracting.