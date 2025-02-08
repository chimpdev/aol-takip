import dotenv from 'dotenv';
dotenv.config();

import { QuickDB } from 'quick.db';
import puppeteer from 'puppeteer';
import enquirer from 'enquirer';
import { EmbedBuilder, Colors, WebhookClient } from 'discord.js';

const categories = ['onemli-duyuru', 'ogrencilerimizin-dikkatine']

const BASE_URL = 'https://aol.meb.gov.tr/www/:category/icerik/';
const TIME_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const database = new QuickDB({ filePath: 'data.sqlite' });

async function initializeDatabase(): Promise<number> {
  let currentId = await database.get<number>('currentId');

  if (!currentId) {
    const response = await enquirer.prompt<{ id: string }>({
      type: 'input',
      name: 'id',
      message: 'Program ilk kez çalıştırılıyor gibi görünüyor. Takip etmeye başlamak için son duyurunun ID\'sini girin:',
    }).catch(() => null);

    if (!response || isNaN(Number(response.id))) throw new Error('Bir ID girilmedi veya geçerli bir sayı değil.');

    currentId = Number(response.id);
    await database.set('currentId', currentId);
  }

  return currentId;
}

interface Announcement {
  status: number;
  url: string;
  title?: string;
  viewsCount?: number;
  time?: string;
  date?: string;
  image?: string;
}

type Categories = 'onemli-duyuru' | 'ogrencilerimizin-dikkatine';

async function fetchAnnouncement(id: number, category: Categories): Promise<Announcement> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = BASE_URL.replace(':category', category) + id;

  try {
    const response = await page.goto(url, { timeout: 10000 });
    const status = response?.status() || 500; // Default to 500 if no response

    if (status !== 200) return { status, url };

    const data = await page.evaluate(() => {
      const container = document.querySelector('.date');
      if (!container) return null; // Graceful fallback if the structure changes

      return {
        title: document.querySelector('.main-title')?.textContent || '',
        viewsCount: Number(container.querySelector('.info-item:nth-child(1) > span')?.textContent),
        time: container.querySelector('.info-item:nth-child(2) > span')?.textContent || '',
        date: container.querySelector('.info-item:nth-child(3) > span')?.textContent || '',
        image: document.querySelector('.content-image > img')?.getAttribute('src') || '',
      };
    });

    return data ? { status, url, ...data } : { status, url };
  } finally {
    await browser.close();
  }
}

async function sendDiscordMessage(message: string, embeds: any[] = []): Promise<void> {
  if (!process.env.WEBHOOK_URL) throw new Error('WEBHOOK_URL is not defined in the environment variables.');

  const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL });

  await webhook.send({ content: message, embeds });
}

async function main(): Promise<void> {
  const currentId = await initializeDatabase();

  const readableFutureDate = new Date(Date.now() + TIME_INTERVAL).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  let result = await fetchAnnouncement(currentId + 1, 'onemli-duyuru');
  
  // If the announcement is not found in the first category, try the second one
  if (result.status !== 200 || !result.date || !result.time || !result.image) result = await fetchAnnouncement(currentId + 1, 'ogrencilerimizin-dikkatine');

  if (result.status === 200 && result.date && result.time && result.image) {
    console.log(`Yeni duyuru bulundu! 6 saat saat sonra tekrar kontrol edilecek. (${readableFutureDate})`);

    const [day, month, year] = result.date.split('.').map(Number);
    const [hour, minute] = result.time.split(':').map(Number);
    const dateObject = new Date(year, month - 1, day, hour, minute);

    const embeds = [
      new EmbedBuilder()
        .setTitle(`Yeni Duyuru | ${result.title}`)
        .setURL(result.url)
        .setImage(`https://aol.meb.gov.tr${result.image}`)
        .addFields([
          { name: 'Views', value: String(result.viewsCount), inline: true },
          { name: 'Date', value: `<t:${Math.floor(dateObject.getTime() / 1000)}:F>`, inline: true },
        ])
        .setColor(Colors.Red)
    ];

    await sendDiscordMessage('Yeni duyuru bulundu!', embeds);

    await database.set('currentId', currentId + 1);
  } else {
    console.log(`Yeni duyuru bulunamadı. 6 saat sonra tekrar kontrol edilecek. (${readableFutureDate})`);
  }

  setTimeout(main, TIME_INTERVAL);
}

main().catch(console.error);
