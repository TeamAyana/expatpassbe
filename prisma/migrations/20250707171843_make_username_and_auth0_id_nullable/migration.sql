-- DropIndex
DROP INDEX "Users_auth0Id_key";

-- DropIndex
DROP INDEX "Users_username_key";

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "auth0Id" DROP NOT NULL;
