import { resolve } from 'path';
import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
/**
 * get environment variable
 */
config({ path: resolve(__dirname, '../.env') });

export default function gitGotchiSVG(Pet: any) {
    let data;
    let svg;
    let content = '';

    try {
        data = readFileSync(resolve(__dirname, '../README.md'), 'utf8');
    } catch (error) {
        console.error(error);
    }

    try {
        svg = readFileSync(resolve(__dirname, '../assets/octocat_idle.svg'), 'utf8');
    } catch (error) {
        console.error(error);
    }

    content += `<div align="center">${svg}</div>`;

    try {
        const writeData = writeFileSync(resolve(__dirname, '../README.md'), content + "\n" + data);
    } catch (error) {
        console.error(error);
    }
}