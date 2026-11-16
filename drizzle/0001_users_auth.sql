-- MatchQuadra - Migration 0001: Autenticação de Usuários (Admin do Time & Admin da Quadra)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(180) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(40) NOT NULL,
  `avatar_url` VARCHAR(500) NOT NULL,
  `arena_name` VARCHAR(160) NULL,
  `team_id` VARCHAR(64) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`),
  CONSTRAINT `fk_users_team`
    FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
