import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('./shots', { recursive: true });
const B = 'http://localhost:4178';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
const shot = async (n) => { await page.waitForTimeout(250); await page.screenshot({ path: `shots/${n}.png`, fullPage: true }); console.log('shot', n); };

await page.goto(B, { waitUntil: 'networkidle' });
await shot('01-welcome');

await page.getByRole('button', { name: /Pick up Ren/i }).click();
await shot('02-intake-midconversation');

// step 6: venture_stage — single choice
await page.getByText("I've tried it out in a small way").click();
await page.getByRole('button', { name: /^Continue$/ }).click();
await page.waitForTimeout(700);
await shot('03-confirm-back');

await page.getByRole('button', { name: /Yes, that's right/i }).click();
await page.waitForTimeout(300);
await shot('04-intake-founding-history');

// step 7 founding_history — the emotional beat
await page.getByText('Yes, I have registered a company before').click();
await page.getByRole('button', { name: /^Continue$/ }).click();
await page.waitForTimeout(700);
await shot('05-confirm-struck-off');
await page.getByRole('button', { name: /Yes, that's right/i }).click();
await page.waitForTimeout(300);

// step 8 support_network — multi
await page.getByText("I've spoken to a university or accelerator").click();
await page.getByText('I can show who I help and why they need it').click();
await page.getByRole('button', { name: /^Continue$/ }).click();
await page.waitForTimeout(700);
await page.getByRole('button', { name: /Yes, that's right/i }).click();
await page.waitForTimeout(300);

// step 9 money
await page.locator('#answer').fill('25000');
await page.getByRole('button', { name: /^Continue$/ }).click();
await page.waitForTimeout(700);
await page.getByRole('button', { name: /Yes, that's right/i }).click();
await page.waitForTimeout(300);

// step 10 what_you_have
await page.getByText('CVs for you and your team').click();
await page.getByRole('button', { name: /^Continue$/ }).click();
await page.waitForTimeout(700);
await page.getByRole('button', { name: /Yes, that's right/i }).click();
await page.waitForTimeout(500);
await shot('06-readiness-map');

// open VFG
await page.getByRole('button', { name: /See the full checklist/i }).nth(1).click();
await page.waitForTimeout(300);
await shot('07-grant-detail-vfg');

await page.getByRole('button', { name: /Start a draft/i }).click();
await page.waitForTimeout(1400);
await shot('08-draft-gap-flags');

await page.getByRole('button', { name: /Back to the checklist/i }).click();
await page.getByRole('button', { name: /Back to all schemes/i }).click();
await page.waitForTimeout(300);

// not_a_fit card
await page.getByRole('button', { name: /See the full checklist/i }).nth(2).click();
await page.waitForTimeout(300);
await shot('09-grant-detail-not-a-fit');

await page.getByRole('button', { name: /Back to all schemes/i }).click();
await page.getByRole('button', { name: /Review everything/i }).click();
await page.waitForTimeout(300);
await shot('10-profile-review');

// large text
await page.getByRole('button', { name: /Largest text/i }).click();
await page.waitForTimeout(300);
await shot('11-largest-text');

await browser.close();
