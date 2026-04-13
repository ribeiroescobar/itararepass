-- Reset de teste para cupons dos turistas
-- Mantem preservado o brinde unico da Casa do Artesao (requires_profile = true)

DELETE FROM user_coupons uc
USING users u, coupons_catalog c
WHERE uc.user_id = u.id
  AND uc.coupon_id = c.id
  AND u.role = 'tourist'
  AND COALESCE(c.requires_profile, false) = false;

-- Se voce quiser resetar tambem o brinde da Casa do Artesao para um usuario especifico,
-- use a consulta abaixo trocando o email.
--
-- DELETE FROM user_coupons uc
-- USING users u, coupons_catalog c
-- WHERE uc.user_id = u.id
--   AND uc.coupon_id = c.id
--   AND u.email = 'turista@exemplo.com'
--   AND COALESCE(c.requires_profile, false) = true;
