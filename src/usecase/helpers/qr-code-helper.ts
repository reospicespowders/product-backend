// qr-code.service.ts
import { Injectable } from '@nestjs/common';
import * as qr from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class QrCodeService {


    generateAndSaveQRCode(data: string) {
        let filename = this.generateRandomString();
        // Generate the QR code as a data URL

        const opts: any = {
            errorCorrectionLevel: 'H',
            type: 'terminal',
            quality: 0.95,
            margin: 1,
            color: {
                dark: '#208698',
                light: '#FFF',
            },
        }

        // Save the QR code to a public folder
        const basedir = path.resolve(__dirname, '../../../')
        const publicPath = `public/qrcodes/${filename}.png`
        const filePath = path.join(basedir, publicPath);
 
        qr.toBuffer(data, opts,(err,data) => {
            if (err){
                // console.log(err);
            } else {
                fs.writeFileSync(filePath, data);
            }
        });
        return process.env.CURRENT_PUBLIC_DOMAIN + "/" + publicPath;
    }

    private generateRandomString() {
        let length = 10;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }
}
