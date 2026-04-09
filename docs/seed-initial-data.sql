-- Seed inicial de locais e estabelecimentos (Itararé Pass)
-- Requer que exista pelo menos um usuário admin para ser owner dos estabelecimentos.

WITH admin_user AS (
  SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1
)
INSERT INTO spots (id, name, lat, lng, type, image, capacity, current_load, average_rating, city_id, historical_snippet)
VALUES
  ('lumber', 'Serra da Lumber', -24.2386, -49.2558, 'adventure', 'https://hotelparaiso.wordpress.com/wp-content/uploads/2014/11/serra-da-lumber-itararc3a9-sp-00731.jpg', 200, 45, 4.8, 'itarare', 'Resquícios da Southern Lumber Company, marco do desenvolvimento regional.'),
  ('rio_verde', 'Rio Verde', -24.2512, -49.2014, 'adventure', 'https://www.viagensecaminhos.com/wp-content/uploads/2023/02/rio-verde-itarare-sp.jpg', 150, 120, 4.9, 'itarare', 'Águas cristalinas e piscinas naturais esculpidas na rocha.'),
  ('pirituba', 'Cânion Pirituba', -24.2345, -49.0978, 'adventure', 'https://www.viagensecaminhos.com/wp-content/uploads/2023/01/canion-pirituba.jpg', 300, 280, 4.7, 'itarare', 'O maior cânion do estado, com formações areníticas milenares.'),
  ('poco_encantado', 'Poço Encantado', -24.1620, -49.3850, 'adventure', 'https://www.senges.pr.gov.br/portal/NAdmin/_lib/file/imgs_imagem_turismo_det/Poco_Encanto(2).jpg', 80, 25, 4.9, 'itarare', 'Uma piscina natural de cor esmeralda no coração da mata.'),
  ('morro_chato', 'Mirante Morro Chato', -24.2000, -49.3000, 'adventure', 'https://www.viagensecaminhos.com/wp-content/uploads/2023/02/itarare-mirante-morro-chato.jpg', 500, 150, 4.6, 'itarare', 'Vista panorâmica privilegiada de toda a cadeia de cânions.'),
  ('hotel_itarare', 'Hotel Itararé', -24.1100, -49.3300, 'lodging', 'https://acheiitarare.com.br/wp-content/uploads/2020/10/Foto-Fachada-Nova-1024x768.jpeg', 100, 75, 4.5, 'itarare', 'Ponto de referência hoteleiro no centro urbano.'),
  ('barreira', 'Parque da Barreira', -24.1370, -49.3639, 'adventure', 'https://www.senges.pr.gov.br/portal/NAdmin/_lib/file/imgs_imagem_turismo/Gruta_Barreira(1)(6).jpg', 400, 90, 4.8, 'itarare', 'Trincheiras naturais usadas na Revolução de 1932.')
ON CONFLICT (id) DO NOTHING;

WITH admin_user AS (
  SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1
),
establishments_insert AS (
  INSERT INTO establishments (owner_user_id, name, address, image_url, category, premium_enabled)
  SELECT id, 'Casa do Artesão', 'Rua XV de Novembro, 56', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmpbLcYBcNqO-dC-5mg6pinV9-6xk3JjRtYQ&s', 'artesanato', false FROM admin_user
  UNION ALL
  SELECT id, 'Café Dona Bela', 'Rua São Pedro, 100', 'https://img3.restaurantguru.com/w550/h367/r674-Dona-Bela-design-2025-09.jpg', 'cafeteria', false FROM admin_user
  UNION ALL
  SELECT id, 'Padaria Abati', 'Rua XV de Novembro, 12', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbgo-KLT8D57-_MTYDXoXLuPq_tVtshcrQCA&s', 'padaria', false FROM admin_user
  UNION ALL
  SELECT id, 'Hotel Itararé', 'Rua São Pedro, 50', 'https://acheiitarare.com.br/wp-content/uploads/2020/10/Foto-Fachada-Nova-1024x768.jpeg', 'hospedagem', false FROM admin_user
  UNION ALL
  SELECT id, 'Gourmeteria', 'Av. Zeca de Moraes, 120', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7cHNxnpNjUPj8es32NzXgPzG4fv-YccY3Qw&s', 'restaurante', false FROM admin_user
  RETURNING id, name
)
INSERT INTO coupons_catalog (establishment_id, title, discount, requires_profile, min_adventure_spots, requires_lodging, is_premium)
SELECT id, name || ' - Cupom', 
       CASE 
         WHEN name = 'Casa do Artesão' THEN 'Brinde + 5% OFF'
         WHEN name = 'Café Dona Bela' THEN '10% OFF no Combo'
         WHEN name = 'Padaria Abati' THEN '15% OFF'
         WHEN name = 'Hotel Itararé' THEN '25% OFF na Diária'
         ELSE '25% OFF no Prato Principal'
       END,
       CASE WHEN name = 'Casa do Artesão' THEN true ELSE false END,
       CASE WHEN name = 'Café Dona Bela' THEN 1 WHEN name = 'Padaria Abati' THEN 2 WHEN name = 'Hotel Itararé' THEN 3 ELSE NULL END,
       CASE WHEN name = 'Gourmeteria' THEN true ELSE false END,
       CASE WHEN name IN ('Casa do Artesão','Hotel Itararé','Gourmeteria') THEN true ELSE false END
FROM establishments_insert;
