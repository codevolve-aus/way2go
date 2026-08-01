-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocumentSection" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "LegalDocumentSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocumentRevision" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "editedBy" TEXT,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalDocumentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocument_slug_key" ON "LegalDocument"("slug");

-- AddForeignKey
ALTER TABLE "LegalDocumentSection" ADD CONSTRAINT "LegalDocumentSection_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalDocumentRevision" ADD CONSTRAINT "LegalDocumentRevision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
