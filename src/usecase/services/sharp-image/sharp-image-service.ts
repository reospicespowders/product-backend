import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageService {

  async convertSvgToPngAndReplaceIcons(items: any[]): Promise<any[]> {
    try {
      const updatedItems = await Promise.all(items.map(async item => {

        if (!item.icon || typeof item.icon !== 'string' || path.extname(item.icon) !== '.svg') {
          // console.log("Invalid or non-SVG icon path:", item.icon);
          return item;
        }

        const svgFilePath = path.join(__dirname, '..', item.icon.replace('/public', '../../../public'));
        const pngFilePath = svgFilePath.replace('.svg', '.png');

        // Check if SVG file exists
        if (!fs.existsSync(svgFilePath)) {
          console.warn(`SVG file not found: ${svgFilePath}`);
          // Return the original item if SVG file does not exist
          return item;
        }

        // Check if PNG file already exists
        if (fs.existsSync(pngFilePath)) {
          return {
            ...item,
            icon: `/public${pngFilePath.split('public')[1]}`
          };
        }

        // Convert SVG to PNG
        const svgBuffer = fs.readFileSync(svgFilePath);
        const pngBuffer = await sharp(svgBuffer)
          .png()
          .toBuffer();

        // Save PNG file
        fs.writeFileSync(pngFilePath, pngBuffer);

        return {
          ...item,
          icon: `/public${pngFilePath.split('public')[1].replace(/\\/g, '/')}`
        };
      }));

      return updatedItems;
    } catch (err) {
      console.error('Error converting SVG to PNG and updating icons:', err);
      throw new Error('Failed to convert SVG to PNG and update icons');
    }
  }

}
