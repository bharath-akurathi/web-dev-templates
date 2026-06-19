CREATE table users(
	id serial PRIMARY KEY,
	name VARCHAR(100) not null,
	email VARCHAR(100) UNIQUE not null,
	password VARCHAR(255) not null,
	created_id TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

SELECT * from users;