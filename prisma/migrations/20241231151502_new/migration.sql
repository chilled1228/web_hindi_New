/*
  Warnings:

  - You are about to drop the column `post_category` on the `blog_posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "blog_posts" DROP COLUMN "post_category",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Uncategorized';
