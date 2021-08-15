import { resolve } from 'path';
import path from 'path';
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
        svg = readFileSync(path.join(__dirname, '../assets/octocat_idle.svg'), 'utf8');
    } catch (error) {
        console.error(error);
    }

    let greet;
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: process.env.TIMEZONE });
    const hour = +(timeString.split(':')[0]);
    if (hour >= 6 && hour < 12) greet = "#Good Morning 🌤";
    else if (hour >= 12 && hour < 18) greet = "#Good Afternoon ☀️";
    else if (hour >= 18 && hour < 24) greet = "#Good Evening 🌆";
    else if (hour >= 0 && hour < 6) greet = "#You need to sleep bro! 😴";

    content += `<div align="center">${svg}</div>\n${greet}`;

    try {
        const writeData = writeFileSync(resolve(__dirname, '../README.md'), content + "\n" + data);
    } catch (error) {
        console.error(error);
    }
}