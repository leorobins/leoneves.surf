CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`session_id` text NOT NULL,
	`size` text NOT NULL,
	`created_at` text DEFAULT '2025-03-05T17:00:16.820Z'
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` real NOT NULL,
	`image` text NOT NULL,
	`images` text DEFAULT '[]',
	`videos` text DEFAULT '[]',
	`brand_id` integer NOT NULL,
	`size_stock` text DEFAULT '[]'
);
