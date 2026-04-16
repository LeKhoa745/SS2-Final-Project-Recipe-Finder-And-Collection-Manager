-- ============================================================
-- Recipe Finder & Collection Manager — MySQL Schema (UPDATED)
-- Hỗ trợ recommend theo nguyên liệu người dùng đang có
-- ============================================================

CREATE DATABASE IF NOT EXISTS recipe_finder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recipe_finder;

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NULL,
    google_id     VARCHAR(100)  NULL UNIQUE,
    avatar        TEXT          NULL,
    phone         VARCHAR(20)   NULL,
    role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    dietary_prefs JSON          NULL,
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
) ENGINE=InnoDB;

-- ─── Refresh Tokens ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    token      VARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME     NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token(255))
) ENGINE=InnoDB;

-- ─── User Pantry (Bảng MỚI - quan trọng nhất cho tính năng recommend) ───
CREATE TABLE IF NOT EXISTS user_pantry (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED  NOT NULL,
    ingredient_name VARCHAR(200)  NOT NULL,           -- ví dụ: "cơm", "thịt bò", "dưa muối", "trứng gà"
    quantity        DECIMAL(10,2) NULL DEFAULT 1.00,   -- số lượng
    unit            VARCHAR(50)   NULL,                 -- "cái", "g", "kg", "bát", "ml", ...
    category        VARCHAR(100)  NULL,                 -- "grain", "meat", "vegetable", "dairy", "pickle", ...
    added_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      DATE          NULL,                 -- để nhắc nguyên liệu dễ hỏng
    notes           TEXT          NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Mỗi user chỉ nên có 1 dòng cho 1 loại nguyên liệu (app sẽ handle update quantity)
    UNIQUE KEY uq_user_ingredient (user_id, ingredient_name),
    
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- ─── Wishlist ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist_items (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED  NOT NULL,
    recipe_id     VARCHAR(50)   NOT NULL,
    recipe_title  VARCHAR(255)  NOT NULL,
    recipe_image  VARCHAR(500)  NULL,
    ready_in_min  INT           NULL,
    servings      INT           NULL,
    source_url    VARCHAR(500)  NULL,
    saved_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_recipe (user_id, recipe_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── Meal Plans ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meal_plans (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    week_start DATE         NOT NULL,
    name       VARCHAR(100) NULL DEFAULT 'My Meal Plan',
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_week (user_id, week_start),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── Meal Plan Entries ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS meal_plan_entries (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plan_id       INT UNSIGNED  NOT NULL,
    day_of_week   ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    meal_type     ENUM('breakfast','lunch','dinner','snack') NOT NULL,
    recipe_id     VARCHAR(50)   NOT NULL,
    recipe_title  VARCHAR(255)  NOT NULL,
    recipe_image  VARCHAR(500)  NULL,
    servings      INT           NOT NULL DEFAULT 1,
    FOREIGN KEY (plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    UNIQUE KEY uq_plan_day_meal (plan_id, day_of_week, meal_type),
    INDEX idx_plan_id (plan_id)
) ENGINE=InnoDB;

-- ─── Shopping Lists ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shopping_lists (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        INT UNSIGNED NOT NULL,
    plan_id        INT UNSIGNED NULL,
    name           VARCHAR(100) NOT NULL DEFAULT 'Shopping List',
    generated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES meal_plans(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── Shopping Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shopping_items (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    list_id         INT UNSIGNED  NOT NULL,
    ingredient_name VARCHAR(200)  NOT NULL,
    amount          DECIMAL(10,2) NULL,
    unit            VARCHAR(50)   NULL,
    aisle           VARCHAR(100)  NULL,
    is_checked      TINYINT(1)    NOT NULL DEFAULT 0,
    FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
    INDEX idx_list_id (list_id)
) ENGINE=InnoDB;

-- ─── Recipe Notes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipe_notes (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    recipe_id   VARCHAR(50)  NOT NULL,
    rating      TINYINT      NULL CHECK (rating BETWEEN 1 AND 5),
    notes       TEXT         NULL,
    cooked_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_recipe (user_id, recipe_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ─── User-Created Recipes (Collection / Community) ──────────
CREATE TABLE IF NOT EXISTS user_recipes (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNSIGNED  NOT NULL,
    title            VARCHAR(255)  NOT NULL,
    description      TEXT          NULL,
    image_url        VARCHAR(500)  NULL,
    ingredients      JSON          NOT NULL,              -- [{name, amount, unit}]
    instructions     JSON          NOT NULL,              -- ["Step 1…", "Step 2…"]
    cuisine          VARCHAR(100)  NULL,
    cook_time_minutes INT UNSIGNED NULL,
    servings         INT UNSIGNED  NULL DEFAULT 2,
    is_public        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_public (is_public),
    FULLTEXT INDEX ft_title_desc (title, description)
) ENGINE=InnoDB;

-- ─── Audit / Deleted Tables ───────────────────────────────────
CREATE TABLE IF NOT EXISTS deleted_wishlist_items (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED  NOT NULL,
    recipe_id     VARCHAR(50)   NOT NULL,
    recipe_title  VARCHAR(255)  NOT NULL,
    recipe_image  VARCHAR(500)  NULL,
    deleted_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS deleted_user_recipes (
    id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id            INT UNSIGNED  NOT NULL,
    original_recipe_id INT UNSIGNED  NOT NULL,
    title              VARCHAR(255)  NOT NULL,
    deleted_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
