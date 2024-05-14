CREATE TABLE IF NOT EXISTS messages
(
    id      INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    content TEXT,
    time    timestamptz,
    username varchar,
    type varchar,
    room varchar
);

