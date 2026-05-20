CREATE DATABASE chess_game;

USE chess_game;

-- Tabla de usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,

    username VARCHAR(50) NOT NULL UNIQUE,

    email VARCHAR(100) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL
);

--Posible estructura de las siguientes tablas

-- Tablas games
CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,

    white_player_id INT NOT NULL,

    black_player_id INT NOT NULL,

    winner_id INT NULL,

    status ENUM(
        'waiting',
        'playing',
        'finished'
    ) DEFAULT 'waiting',

    FOREIGN KEY (white_player_id)
        REFERENCES users(id),

    FOREIGN KEY (black_player_id)
        REFERENCES users(id),

    FOREIGN KEY (winner_id)
        REFERENCES users(id)
);

-- Tabla movimientos
CREATE TABLE moves (
    id INT PRIMARY KEY AUTO_INCREMENT,

    game_id INT NOT NULL,

    player_id INT NOT NULL,

    from_square VARCHAR(5) NOT NULL,

    to_square VARCHAR(5) NOT NULL,

    piece VARCHAR(20),

    FOREIGN KEY (game_id)
        REFERENCES games(id),

    FOREIGN KEY (player_id)
        REFERENCES users(id)
);

-- Tabla rankinhs
CREATE TABLE rankings (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT UNIQUE NOT NULL,

    points INT DEFAULT 0,

    wins INT DEFAULT 0,

    losses INT DEFAULT 0,

    draws INT DEFAULT 0,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);

