import { BarkClient, BarkPushPayload } from '@thiskyhan/bark.js';

async function pushBarkMessage(message: string, id = '') {
  if (!process.env.BARK_SERVER_URL || !process.env.BARK_DEVICE_KEY) throw new Error('BARK_SERVER_URL or BARK_DEVICE_KEY is not defined in the environment variables.');

  const barkClient = new BarkClient({
    baseUrl: process.env.BARK_SERVER_URL,
    key: process.env.BARK_DEVICE_KEY
  });

  const payload = {
    title: 'Açık Öğretim Lisesi Duyuru Takip',
    body: message,
    icon: 'https://i.ibb.co/Vp2rDDws/g2kdVzu.jpg'
  } as BarkPushPayload;

  if (id !== '') payload.subtitle = `ID: ${id}`;

  try {
    await barkClient.pushMessage(payload);
  } catch (error) {
    console.error('There was an error while sending the push message:', error);
  }
}

export default pushBarkMessage;