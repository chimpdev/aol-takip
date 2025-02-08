## AOL Takip

AOL Takip is a simple Node.js application that periodically checks for new announcements on the Turkish Ministry of National Education's (MEB) official website and sends a notification to a Discord channel.

#### Features

- Fetches the latest announcements from [AOL MEB](https://aol.meb.gov.tr/www/onemli-duyuru/icerik/) website.
- Automatically checks for new announcements every 6 hours.
- Sends notifications to a Discord channel using a webhook.
- Stores the last checked announcement ID in a local SQLite database.
- Includes the announcement's views, date, and time in the Discord message.
- Supports Bark app for iOS notifications.

#### Requirements

- Node.js (version 16.x or higher)
- A Discord webhook URL to send notifications.
- SQLite database for storing the last checked announcement ID.
- `.env` file for storing sensitive configuration.

#### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/chimpdev/aol-takip.git
   cd aol-takip
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the project and add the following:

   ```env
   WEBHOOK_URL=your-discord-webhook-url
   BARK_SERVER_URL=your-bark-server-url
   BARK_DEVICE_KEY=your-bark-device-key
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Start the application:

   ```bash
   npm start
   ```

> [!NOTE]
> - If you plan to use this application in a Linux environment, you may need to install additional dependencies for Puppeteer to work. You can find more information on the [official Puppeteer documentation](https://pptr.dev/troubleshooting#chrome-doesnt-launch-on-linux).

#### How It Works

- When the application starts, it prompts the user to enter the ID of the last announcement if it is the first run.
- It then checks the MEB website for a new announcement by incrementing the last checked ID.
- If a new announcement is found, it sends a notification to the specified Discord webhook with details about the announcement, including its views, date, and time.
- The application waits for 6 hours before checking again.

#### Scripts

- `npm start`: Builds the project (if needed) and starts the application.
- `npm run build`: Builds the TypeScript code into JavaScript.
- `npm run build-if-needed`: Builds the TypeScript code only if there are changes.

#### Dependencies

- `discord.js`: For interacting with Discord's API.
- `puppeteer`: For scraping the MEB website for announcements.
- `quick.db`: For simple SQLite database management.
- `enquirer`: For prompting user input.
- `@thiskyhan/bark.js`: For sending notifications to the Bark app.

#### License

This project is licensed under the [GNU General Public License v3.0](LICENSE).