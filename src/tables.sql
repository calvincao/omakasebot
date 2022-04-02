CREATE TABLE "users" (
	"discord_id" varchar NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("discord_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "watchlists" (
	"_id" serial NOT NULL,
	"wl_name" varchar NOT NULL,
	"discord_id" varchar NOT NULL,
	CONSTRAINT "watchlists_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "nfts" (
	"os_name" varchar NOT NULL,
	CONSTRAINT "nfts_pk" PRIMARY KEY ("os_name")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "wl_nfts" (
	"_id" serial NOT NULL,
	"wl_id" integer NOT NULL,
	"os_name" varchar NOT NULL,
	CONSTRAINT "wl_nfts_pk" PRIMARY KEY ("_id")
) WITH (
  OIDS=FALSE
);




ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_fk0" FOREIGN KEY ("discord_id") REFERENCES "users"("discord_id");


ALTER TABLE "wl_nfts" ADD CONSTRAINT "wl_nfts_fk0" FOREIGN KEY ("wl_id") REFERENCES "watchlists"("_id");
ALTER TABLE "wl_nfts" ADD CONSTRAINT "wl_nfts_fk1" FOREIGN KEY ("os_name") REFERENCES "nfts"("os_name");
