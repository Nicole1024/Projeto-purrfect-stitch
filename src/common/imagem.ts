import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Forma mínima do arquivo que o multer (FileInterceptor) entrega em memória.
export interface ArquivoEnviado {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export const LIMITE_IMAGEM_BYTES = 5 * 1024 * 1024; // 5 MB
export const PASTA_UPLOADS = join(process.cwd(), 'uploads');

const EXTENSOES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Salva em uploads/<subpasta>/ e devolve o caminho público (ex.: /uploads/produtos/abc.jpg).
export async function salvarImagem(
  arquivo: ArquivoEnviado,
  subpasta = 'produtos',
): Promise<string> {
  const extensao = EXTENSOES[arquivo.mimetype];
  if (!extensao) {
    throw new BadRequestException(
      'Formato inválido. Envie uma imagem JPG, PNG ou WEBP.',
    );
  }
  const nome = `${randomUUID()}${extensao}`;
  const pasta = join(PASTA_UPLOADS, subpasta);
  await mkdir(pasta, { recursive: true });
  await writeFile(join(pasta, nome), arquivo.buffer);
  return `/uploads/${subpasta}/${nome}`;
}

// Apaga o arquivo antigo (ignora se não existir). Só mexe dentro de uploads/.
export async function removerImagem(url?: string | null): Promise<void> {
  if (!url?.startsWith('/uploads/')) return;
  const alvo = join(process.cwd(), url);
  if (!alvo.startsWith(PASTA_UPLOADS)) return;
  await unlink(alvo).catch(() => undefined);
}
