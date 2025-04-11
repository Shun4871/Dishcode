-- CreateTable
CREATE TABLE "Favorite" (
    "favorite_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "favorite_url" TEXT NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("favorite_id")
);
