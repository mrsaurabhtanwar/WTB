// WhatsApp client implementation optimized for Railway deployment
// Includes containerized environment support with unique Chrome profiles

const fs = require('fs');
const path = require('path');
const os = require('os');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');

class WhatsAppClient {
    constructor(opts = {}) {
        this._ready = false;
        this._opts = opts;
        this._qrPngPath = path.join(__dirname, 'current-qr.png');
        this._qrDataUrlPath = path.join(__dirname, 'qr-data-url.txt');
        this._sessionDir = path.join(__dirname, '.wwebjs_auth');
        this._retryCount = 0;
        this._maxRetries = 5;
        this._isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;

        // Ensure session directory exists
        try { fs.mkdirSync(this._sessionDir, { recursive: true }); } catch {}

        console.log(`🌐 Environment: ${this._isRailway ? 'Railway' : 'Local'} | Platform: ${process.platform}`);
        
        this._createClient();
        this._wireEvents();
        this._initialize();
    }

    _createClient() {
        const isWindows = process.platform === 'win32';
        
        console.log(`🌐 Environment: ${this._isRailway ? 'Railway' : 'Local'} | Platform: ${process.platform}`);

        // Strategy 1: Use external browser if provided (RECOMMENDED for Azure F1)
        if (process.env.BROWSER_WS_URL) {
            console.log('🔗 Using external Chrome service:', process.env.BROWSER_WS_URL);
            this.client = new Client({
                authStrategy: new LocalAuth({ clientId: 'tailoring-shop-bot' }),
                puppeteer: {
                    browserWSEndpoint: process.env.BROWSER_WS_URL,
                    timeout: 0,
                    protocolTimeout: 0
                },
                qrMaxRetries: 10,
                authTimeoutMs: 300000,
                restartOnAuthFail: true
            });
            return;
        }

        // Strategy 2: Try local Chrome with Azure-optimized config
        let puppeteerConfig;
        
        if (this._isRailway) {
            console.log('🔧 Using Railway-optimized Puppeteer configuration');
            // Containerized environment configuration with minimal memory usage
            const uniqueUserDataDir = path.join(os.tmpdir(), `whatsapp-chrome-${Date.now()}-${process.pid}`);
            
            puppeteerConfig = {
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--single-process',
                    '--no-zygote',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI,BlinkGenPropertyTrees',
                    '--disable-ipc-flooding-protection',
                    '--disable-extensions',
                    '--disable-default-apps',
                    '--disable-plugins',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--no-first-run',
                    '--memory-pressure-off',
                    '--max_old_space_size=256',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    `--user-data-dir=${uniqueUserDataDir}`,
                    `--crash-dumps-dir=${os.tmpdir()}`
                ],
                timeout: 0,
                protocolTimeout: 0
            };
            
            this._userDataDir = uniqueUserDataDir;
        } else if (isWindows) {
            // Windows local development
            const chromePaths = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
            ];
            
            const executablePath = chromePaths.find(p => {
                try { return fs.existsSync(p); } catch { return false; }
            });

            puppeteerConfig = {
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: executablePath,
                timeout: 60000
            };
        } else {
            // Linux configuration - Use system Chromium with unique profile for Railway/containerized environments
            const { execSync } = require('child_process');
            const os = require('os');
            let executablePath = null;
            
            try {
                executablePath = execSync('which chromium', { encoding: 'utf8' }).trim();
                console.log('🔍 Found Chromium at:', executablePath);
            } catch (e) {
                console.log('⚠️ System Chromium not found, using Puppeteer default');
            }
            
            // Create unique user data directory to avoid profile conflicts
            const uniqueUserDataDir = path.join(os.tmpdir(), `whatsapp-chrome-${Date.now()}-${process.pid}`);
            
            puppeteerConfig = {
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-default-browser-check',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI,BlinkGenPropertyTrees',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--mute-audio',
                    '--no-zygote',
                    '--disable-accelerated-2d-canvas',
                    '--disable-accelerated-jpeg-decoding',
                    '--disable-accelerated-mjpeg-decode',
                    '--disable-accelerated-video-decode',
                    '--disable-ipc-flooding-protection',
                    '--single-process',
                    `--user-data-dir=${uniqueUserDataDir}`,
                    `--crash-dumps-dir=${os.tmpdir()}`,
                    '--memory-pressure-off'
                ],
                timeout: 0,
                protocolTimeout: 0
            };
            
            if (executablePath) {
                puppeteerConfig.executablePath = executablePath;
            }
            
            // Store user data dir for cleanup
            this._userDataDir = uniqueUserDataDir;
        }

        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: 'tailoring-shop-bot' }),
            puppeteer: puppeteerConfig,
            qrMaxRetries: this._isRailway ? 10 : 3,
            authTimeoutMs: this._isRailway ? 300000 : 60000,
            restartOnAuthFail: true,
            takeoverOnConflict: true,
            takeoverTimeoutMs: 0
        });
    }

    _wireEvents() {
        if (!this.client) return;

        this._onQr = async (qr) => {
            try {
                this._ready = false;
                console.log('📱 QR Code received! Generating files...');
                
                // Save QR to PNG for /qr endpoint
                await qrcode.toFile(this._qrPngPath, qr, { type: 'png', errorCorrectionLevel: 'H' });
                console.log('✅ QR PNG saved');
                
                // Also store data URL
                const dataUrl = await qrcode.toDataURL(qr);
                fs.writeFileSync(this._qrDataUrlPath, dataUrl, 'utf8');
                console.log('✅ QR data URL saved');
                
                // Print terminal QR
                qrcodeTerminal.generate(qr, { small: true });
                console.log('🔐 New WhatsApp QR generated. Scan it to authenticate.');
                
                // Reset retry count on successful QR generation
                this._retryCount = 0;
                
            } catch (err) {
                console.error('❌ Failed to write QR assets:', err.message);
            }
        };

        this._onReady = () => {
            this._ready = true;
            try { if (fs.existsSync(this._qrPngPath)) fs.unlinkSync(this._qrPngPath); } catch {}
            console.log('✅ WhatsApp client is ready.');
        };

        this._onAuthenticated = () => {
            console.log('🔒 WhatsApp authenticated.');
        };

        this._onAuthFailure = (m) => {
            this._ready = false;
            console.error('❌ WhatsApp authentication failed:', m);
            this._handleFailure();
        };

        this._onDisconnected = (reason) => {
            this._ready = false;
            console.warn('⚠️ WhatsApp disconnected:', reason);
            this._handleFailure();
        };

        this.client.on('qr', this._onQr);
        this.client.on('ready', this._onReady);
        this.client.on('authenticated', this._onAuthenticated);
        this.client.on('auth_failure', this._onAuthFailure);
        this.client.on('disconnected', this._onDisconnected);
    }

    _handleFailure() {
        if (this._retryCount >= this._maxRetries) {
            console.error('❌ Max retries reached. Please check Railway configuration.');
            console.log('💡 Solutions:');
            console.log('   1. Add BROWSER_WS_URL environment variable with a remote Chrome service');
            console.log('   2. Check Railway deployment logs for Chrome/Puppeteer issues');
            console.log('   3. Use local development for initial WhatsApp setup');
            return;
        }

        this._retryCount++;
        const delay = Math.min(30000 * this._retryCount, 120000); // Exponential backoff, max 2 min
        
        console.log(`🔄 Retry ${this._retryCount}/${this._maxRetries} in ${delay/1000}s...`);
        
        setTimeout(() => {
            console.log('🔄 Attempting WhatsApp client restart...');
            this.restartClient().catch((err) => {
                console.error('❌ Restart failed:', err.message);
            });
        }, delay);
    }

    async _initialize() {
        try {
            console.log('🚀 Initializing WhatsApp client...');
            await this.client.initialize();
        } catch (err) {
            console.error('❌ Failed to initialize WhatsApp client:', err.message);
            this._handleFailure();
        }
    }

    isReady() {
        return !!this._ready;
    }

    async waitUntilReady(timeoutMs = 30000) {
        if (this.isReady()) return;
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                if (this.isReady()) return resolve();
                if (Date.now() - start > timeoutMs) return reject(new Error('WhatsApp client not ready'));
                setTimeout(check, 500);
            };
            check();
        });
    }

    async sendMessage(chatId, message) {
        if (!this.isReady()) {
            throw new Error('WhatsApp client not ready');
        }
        return this.client.sendMessage(chatId, message);
    }

    async restartClient() {
        try {
            await this.destroy();
        } catch {}
        
        // Wait a bit before recreating
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        this._createClient();
        this._wireEvents();
        await this._initialize();
    }

    async destroy() {
        try {
            if (this.client) {
                this.client.removeListener('qr', this._onQr);
                this.client.removeListener('ready', this._onReady);
                this.client.removeListener('authenticated', this._onAuthenticated);
                this.client.removeListener('auth_failure', this._onAuthFailure);
                this.client.removeListener('disconnected', this._onDisconnected);
                await this.client.destroy();
            }
            
            // Cleanup temporary user data directory if it exists
            if (this._userDataDir && fs.existsSync(this._userDataDir)) {
                try {
                    fs.rmSync(this._userDataDir, { recursive: true, force: true });
                    console.log('🧹 Cleaned up temporary Chrome profile');
                } catch (cleanupErr) {
                    console.warn('⚠️ Could not clean up Chrome profile:', cleanupErr.message);
                }
            }
        } catch (err) {
            console.error('Error during WhatsApp client destroy:', err.message);
        } finally {
            this.client = null;
            this._ready = false;
            this._userDataDir = null;
        }
    }
}

module.exports = WhatsAppClient;
