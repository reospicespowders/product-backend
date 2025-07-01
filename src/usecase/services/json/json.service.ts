import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class JsonService {

    private data: any;

    public async parseJson(fileName: string): Promise<any> {
        if (this.data) {
            return Promise.resolve(this.data);
        }
        return new Promise((resolve, reject) => {
            fs.readFile('' + fileName, 'utf8', (err, data) => {
                if (err) {
                    // Handle error, e.g., file not found           
                    console.error('Error reading data:', err);
                    reject(err);
                } else {
                    try {
                        const jsonData = JSON.parse(data);
                        this.data = jsonData;
                        resolve(jsonData);
                    } catch (parseErr) {
                        // Handle JSON parsing error
                        console.error('Error parsing JSON:', parseErr);
                        reject(parseErr);
                    }
                }
            });
        });
    }
}
