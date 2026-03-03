#!/usr/bin/env node
/**
 * Gallery Image Optimization Script
 *
 * Converts gallery images to optimized WebP format:
 * - Thumbnails: 150x150 max (contain)
 * - Full-size: 1920px max width
 *
 * Usage: npx tsx scripts/optimize-gallery.ts
 */

import sharp from 'sharp';
import { readdir, mkdir, rm, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename, extname } from 'path';

const GALLERY_DIR = 'public/assets/gallery';
const THUMB_SIZE = 150;
const FULL_SIZE = 1920;
const WEBP_QUALITY = 80;

interface ImageInfo {
  filename: string;
  thumb: string;
  full: string;
  width: number;
  height: number;
}

interface AlbumManifest {
  name: string;
  slug: string;
  cover: string;
  images: ImageInfo[];
}

async function getFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile())
    .filter(e => /\.(jpe?g|png)$/i.test(e.name))
    .map(e => e.name);
}

async function optimizeImage(
  inputPath: string,
  outputPath: string,
  maxWidth: number,
  maxHeight?: number
): Promise<{ width: number; height: number }> {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  let resizeOptions: sharp.ResizeOptions = {
    width: maxWidth,
    withoutEnlargement: true,
  };

  if (maxHeight) {
    resizeOptions.height = maxHeight;
    resizeOptions.fit = 'contain';
    resizeOptions.background = { r: 0, g: 0, b: 0, alpha: 0 };
  } else {
    resizeOptions.fit = 'inside';
  }

  await image
    .rotate() // Auto-rotate based on EXIF
    .resize(resizeOptions)
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(outputPath);

  // Get final dimensions
  const resultMetadata = await sharp(outputPath).metadata();
  return {
    width: resultMetadata.width || 0,
    height: resultMetadata.height || 0,
  };
}

async function processAlbum(albumSlug: string): Promise<AlbumManifest | null> {
  const albumDir = join(GALLERY_DIR, albumSlug);
  const thumbsDir = join(albumDir, 'thumbs');
  const fullDir = join(albumDir, 'full');

  if (!existsSync(albumDir)) {
    console.log(`  Skipping ${albumSlug} - directory not found`);
    return null;
  }

  const files = await getFiles(albumDir);
  if (files.length === 0) {
    console.log(`  Skipping ${albumSlug} - no images found`);
    return null;
  }

  console.log(`\nProcessing album: ${albumSlug} (${files.length} images)`);

  // Create output directories
  await mkdir(thumbsDir, { recursive: true });
  await mkdir(fullDir, { recursive: true });

  const images: ImageInfo[] = [];
  let coverImage = '';

  // Sort files naturally (1.jpeg, 2.jpeg, ... 10.jpeg, etc.)
  const sortedFiles = files.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

  for (const filename of sortedFiles) {
    const inputPath = join(albumDir, filename);
    const baseName = basename(filename, extname(filename));

    console.log(`  Converting: ${filename}`);

    try {
      // Generate thumbnail
      const thumbPath = join(thumbsDir, `${baseName}.webp`);
      await optimizeImage(inputPath, thumbPath, THUMB_SIZE, THUMB_SIZE);

      // Generate full-size
      const fullPath = join(fullDir, `${baseName}.webp`);
      const { width, height } = await optimizeImage(inputPath, fullPath, FULL_SIZE);

      // Store image info
      const imageInfo: ImageInfo = {
        filename: baseName,
        thumb: `/assets/gallery/${albumSlug}/thumbs/${baseName}.webp`,
        full: `/assets/gallery/${albumSlug}/full/${baseName}.webp`,
        width,
        height,
      };
      images.push(imageInfo);

      // Use first image as cover
      if (!coverImage) {
        coverImage = `/assets/gallery/${albumSlug}/thumbs/${baseName}.webp`;
      }

      // Delete original
      await rm(inputPath);
      console.log(`    Deleted original: ${filename}`);
    } catch (err) {
      console.error(`    Error processing ${filename}:`, err);
    }
  }

  return {
    name: albumSlug.charAt(0).toUpperCase() + albumSlug.slice(1),
    slug: albumSlug,
    cover: coverImage,
    images,
  };
}

async function main() {
  console.log('🖼️  Gallery Image Optimizer');
  console.log('============================');
  console.log(`Source: ${GALLERY_DIR}`);
  console.log(`Thumbnail size: ${THUMB_SIZE}x${THUMB_SIZE}`);
  console.log(`Full-size width: ${FULL_SIZE}px`);
  console.log(`WebP quality: ${WEBP_QUALITY}`);

  // Get album directories
  const entries = await readdir(GALLERY_DIR, { withFileTypes: true });
  const albumDirs = entries
    .filter(e => e.isDirectory() && e.name !== 'thumbs' && e.name !== 'full')
    .map(e => e.name);

  console.log(`\nFound ${albumDirs.length} album(s): ${albumDirs.join(', ')}`);

  const manifests: AlbumManifest[] = [];

  for (const albumSlug of albumDirs) {
    const manifest = await processAlbum(albumSlug);
    if (manifest) {
      manifests.push(manifest);
    }
  }

  // Output summary
  console.log('\n✅ Optimization complete!');
  console.log('\nManifests:');
  for (const m of manifests) {
    console.log(`  ${m.name}: ${m.images.length} images`);
  }

  console.log('\n📝 Update ALBUMS in src/features/gallery/page.tsx with:');
  console.log(JSON.stringify(manifests, null, 2));
}

main().catch(console.error);
