-- Run once against an existing database:
--   mysql -u <user> -p sync_board < migrations.sql

-- Email addresses for password recovery. NULL for accounts that haven't
-- added one yet; MySQL lets several rows share NULL in a unique index.
ALTER TABLE `users`
  ADD COLUMN `email` varchar(255) DEFAULT NULL AFTER `username`,
  ADD UNIQUE KEY `email` (`email`);

-- Single-use reset links, one row per issued token.
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
