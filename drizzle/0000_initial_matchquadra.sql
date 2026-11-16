-- MatchQuadra - Migration Inicial MySQL 8.0+
-- Cria todas as tabelas para Admin da Quadra, Admin do Time, Jogadores, Desafios e Agenda de Horários.

CREATE TABLE IF NOT EXISTS `courts` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `modality` VARCHAR(64) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `neighborhood` VARCHAR(120) NOT NULL,
  `city` VARCHAR(120) NOT NULL,
  `hourly_rate` INT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  `review_count` INT NOT NULL DEFAULT 1,
  `available_time_slots` JSON NOT NULL,
  `amenities` JSON NOT NULL,
  `owner_id` VARCHAR(64) NOT NULL,
  `owner_name` VARCHAR(120) NOT NULL,
  `phone_contact` VARCHAR(40) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `court_blocked_slots` (
  `id` VARCHAR(64) NOT NULL,
  `court_id` VARCHAR(64) NOT NULL,
  `block_date` VARCHAR(16) NOT NULL,
  `time_slot` VARCHAR(32) NOT NULL,
  `reason` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_court_block_slot` (`court_id`, `block_date`, `time_slot`),
  CONSTRAINT `fk_blocked_slots_court`
    FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teams` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(140) NOT NULL,
  `captain_name` VARCHAR(120) NOT NULL,
  `captain_phone` VARCHAR(40) NOT NULL,
  `crest_url` VARCHAR(500) NOT NULL,
  `modality` VARCHAR(64) NOT NULL,
  `skill_level` VARCHAR(64) NOT NULL,
  `home_court_id` VARCHAR(64) NULL,
  `home_court_name` VARCHAR(160) NULL,
  `city` VARCHAR(120) NOT NULL,
  `matches_played` INT NOT NULL DEFAULT 0,
  `wins` INT NOT NULL DEFAULT 0,
  `draws` INT NOT NULL DEFAULT 0,
  `losses` INT NOT NULL DEFAULT 0,
  `fair_play_score` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_teams_home_court`
    FOREIGN KEY (`home_court_id`) REFERENCES `courts` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `team_members` (
  `id` VARCHAR(64) NOT NULL,
  `team_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `position` VARCHAR(80) NOT NULL,
  `jersey_number` INT NULL,
  `phone` VARCHAR(40) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'JOGADOR',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_team_members_team` (`team_id`),
  CONSTRAINT `fk_team_members_team`
    FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `challenges` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `modality` VARCHAR(64) NOT NULL,
  `match_date` VARCHAR(16) NOT NULL,
  `formatted_date` VARCHAR(64) NOT NULL,
  `time_slot` VARCHAR(32) NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 60,
  `court_id` VARCHAR(64) NOT NULL,
  `court_name` VARCHAR(160) NOT NULL,
  `court_address` VARCHAR(255) NOT NULL,
  `neighborhood` VARCHAR(120) NOT NULL,
  `total_price` INT NOT NULL,
  `price_per_team` INT NOT NULL,
  `host_role` VARCHAR(24) NOT NULL DEFAULT 'MANDANTE',
  `skill_level` VARCHAR(64) NOT NULL,
  `status` VARCHAR(24) NOT NULL DEFAULT 'ABERTO',
  `proposing_team_id` VARCHAR(64) NOT NULL,
  `accepting_team_id` VARCHAR(64) NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_challenges_court_date` (`court_id`, `match_date`, `time_slot`),
  CONSTRAINT `fk_challenges_court`
    FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_challenges_proposing_team`
    FOREIGN KEY (`proposing_team_id`) REFERENCES `teams` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_challenges_accepting_team`
    FOREIGN KEY (`accepting_team_id`) REFERENCES `teams` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(64) NOT NULL,
  `court_id` VARCHAR(64) NOT NULL,
  `court_name` VARCHAR(160) NOT NULL,
  `modality` VARCHAR(64) NOT NULL,
  `booking_date` VARCHAR(16) NOT NULL,
  `formatted_date` VARCHAR(64) NOT NULL,
  `time_slot` VARCHAR(32) NOT NULL,
  `price` INT NOT NULL,
  `status` VARCHAR(24) NOT NULL DEFAULT 'PENDENTE',
  `team1_id` VARCHAR(64) NULL,
  `team1_name` VARCHAR(140) NOT NULL,
  `team2_id` VARCHAR(64) NULL,
  `team2_name` VARCHAR(140) NULL,
  `requester_name` VARCHAR(120) NOT NULL,
  `requester_phone` VARCHAR(40) NOT NULL,
  `paid_amount` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bookings_court_slot` (`court_id`, `booking_date`, `time_slot`),
  CONSTRAINT `fk_bookings_court`
    FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_team1`
    FOREIGN KEY (`team1_id`) REFERENCES `teams` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_bookings_team2`
    FOREIGN KEY (`team2_id`) REFERENCES `teams` (`id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
