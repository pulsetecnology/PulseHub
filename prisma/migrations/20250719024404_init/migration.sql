-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "imageUrls" TEXT NOT NULL,
    "category" TEXT,
    "sizes" TEXT,
    "targetAudiences" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "supplierId" TEXT,
    "supplierName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
