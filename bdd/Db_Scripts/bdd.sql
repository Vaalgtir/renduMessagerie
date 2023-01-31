-- Adminer 4.8.1 PostgreSQL 13.9 dump

DROP TABLE IF EXISTS "_prisma_migrations";
CREATE TABLE "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamptz,
    "migration_name" character varying(255) NOT NULL,
    "logs" text,
    "rolled_back_at" timestamptz,
    "started_at" timestamptz DEFAULT now() NOT NULL,
    "applied_steps_count" integer DEFAULT '0' NOT NULL,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "conv_request";
DROP SEQUENCE IF EXISTS conv_request_id_seq;
CREATE SEQUENCE conv_request_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."conv_request" (
    "from" integer NOT NULL,
    "for" integer NOT NULL,
    "id" integer DEFAULT nextval('conv_request_id_seq') NOT NULL,
    "state" text NOT NULL,
    CONSTRAINT "conv_request_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "friends";
DROP SEQUENCE IF EXISTS friends_id_seq;
CREATE SEQUENCE friends_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."friends" (
    "id" integer DEFAULT nextval('friends_id_seq') NOT NULL,
    "relation" character varying(25) NOT NULL,
    "requesting" integer,
    CONSTRAINT "friends_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "relation" UNIQUE ("relation")
) WITH (oids = false);

INSERT INTO "friends" ("id", "relation", "requesting") VALUES
(1,	'1-2',	NULL);

DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "username" character varying(25) NOT NULL,
    "password" text NOT NULL,
    "mail" character varying(25) NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "isValidated" boolean DEFAULT false NOT NULL,
    "nom" character varying(25),
    "prenom" character varying(25),
    "isBannished" boolean DEFAULT false NOT NULL,
    "isSalesman" boolean DEFAULT false NOT NULL,
    CONSTRAINT "mail" UNIQUE ("mail"),
    CONSTRAINT "username" UNIQUE ("username"),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "users" ("id", "username", "password", "mail", "isAdmin", "isValidated", "nom", "prenom", "isBannished", "isSalesman") VALUES
(2,	'test',	'$2a$10$djK28niTD6cqeR6TidKo3OLLC/zl51lkZSGFafa2vnVS9gnua6KR.',	'customer@gmail.com',	'0',	'1',	'test',	'test',	'0',	'0'),
(1,	'admin',	'$2a$10$OE56twAdKrv/c1/xSPYcOeC68.3l6b1lgrOSIsj8ZZp5OdLo6nHDe',	'salesman@gmail.com',	'1',	'1',	'Spark',	'Admin',	'0',	'1');

ALTER TABLE ONLY "public"."conv_request" ADD CONSTRAINT "conv_request_for_fkey" FOREIGN KEY ("for") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;
ALTER TABLE ONLY "public"."conv_request" ADD CONSTRAINT "conv_request_from_fkey" FOREIGN KEY ("from") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE;

-- 2022-12-12 07:53:57.233543+00
