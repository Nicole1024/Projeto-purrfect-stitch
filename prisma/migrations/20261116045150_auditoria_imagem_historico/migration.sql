-- CreateEnum
CREATE TYPE "AcaoHistorico" AS ENUM ('CADASTRO', 'EDICAO', 'EXCLUSAO');

-- CreateEnum
CREATE TYPE "TipoRegistro" AS ENUM ('PRODUTO', 'ADMINISTRADOR');

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "atualizado_por_id" INTEGER,
ADD COLUMN     "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "criado_por_id" INTEGER,
ADD COLUMN     "imagem_url" TEXT;

-- CreateTable
CREATE TABLE "historico" (
    "id" SERIAL NOT NULL,
    "administrador_id" INTEGER NOT NULL,
    "administrador_nome" TEXT NOT NULL,
    "acao" "AcaoHistorico" NOT NULL,
    "tipo_registro" "TipoRegistro" NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "registro_nome" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historico_data_hora_idx" ON "historico"("data_hora");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
