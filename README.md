# FillUp

แอปบันทึกการเติมน้ำมันภาษาไทยสำหรับ iPhone, Android, iPad และเดสก์ท็อป ทำงานบนอุปกรณ์ด้วย React + TypeScript + Vite + IndexedDB ติดตั้งเป็น PWA ได้โดยไม่ใช้ App Store หรือบัญชี Apple Developer

## เริ่มใช้งานในเครื่อง

ต้องใช้ Node.js 24 LTS และ npm (เวอร์ชันที่ทดสอบ: Node 24.15)

```sh
npm install
npm run dev
```

เปิด URL ที่ Vite แสดง โดยทั่วไปคือ `http://localhost:5173` ฐานข้อมูลเริ่มว่าง ไม่มีข้อมูลตัวอย่างถูกใส่ใน production สร้างรถคันแรกหรือไปตั้งค่าเพื่อนำเข้าไฟล์สำรอง

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

`npm run preview` เปิด production build ที่ `http://localhost:4173` และใช้ทดสอบ Service Worker ได้ โหมด `npm run dev` ไม่เปิด Service Worker เพื่อหลีกเลี่ยง cache โค้ดระหว่างพัฒนา

สำหรับติดตั้ง dependencies ตาม lockfile ใน CI หรือเครื่องใหม่ ใช้ `npm ci` หากสิทธิ์ npm cache ถูกจำกัด ใช้ `npm ci --cache .cache/npm`

## ความสามารถ

- Dashboard: เลขไมล์ปัจจุบัน, km/L เฉลี่ยและล่าสุด, ค่าใช้จ่าย/ลิตร/ระยะทาง/จำนวนครั้งรายเดือน
- บันทึกเติมน้ำมันแบบเต็มถังหรือบางส่วน คำนวณยอดรวมและราคาต่อลิตรกลับไปมา แก้ไข/ลบพร้อมยืนยัน
- ประวัติจัดกลุ่มรายเดือน ค้นหาปั๊ม หมายเหตุ ประเภทน้ำมัน และเลขไมล์
- สถิติแบบถ่วงน้ำหนัก กราฟ SVG ที่ไม่โหลดบริการภายนอก และตารางข้อมูลสำหรับการเข้าถึง
- รถหลายคัน แยกประวัติ เลือกรถที่ใช้งาน แก้ไขและลบรถพร้อมประวัติ
- JSON backup/restore ตรวจรูปแบบ รหัสซ้ำ ความเชื่อมโยง และค่าตัวเลขก่อนแทนที่ข้อมูลทั้งหมดแบบ atomic
- CSV UTF-8 พร้อม BOM, CRLF, escaped quotes และป้องกันข้อความกลายเป็นสูตร Excel
- Light / Dark / ตามอุปกรณ์, safe areas, touch targets, Thai UI และคำแนะนำติดตั้ง iPhone ที่ปิดถาวรได้
- ไม่ส่งข้อมูลรถหรือประวัติไปยังเซิร์ฟเวอร์ ไม่มี analytics, โฆษณา, บัญชี หรือ backend

## โครงสร้าง

```text
src/
  components/    # Modal, ฟอร์มรถ/เติมน้ำมัน, กราฟ, รายละเอียดประวัติ
  pages/         # Dashboard, History, Statistics, Vehicles, Settings
  models/        # Vehicle, FuelRecord, AppSettings และขอบเขตข้อมูล
  db/            # IndexedDB repository + transaction tests
  services/      # Pure calculations, validation, JSON/CSV + unit tests
  hooks/         # โหลด/ปรับปรุงข้อมูล, สถานะ offline และ PWA updates
  utils/         # รูปแบบตัวเลข บาท วันที่ และเวลาในอุปกรณ์
  styles/        # Design tokens, mobile-first layout และ dark mode
  test/          # Fixtures สำหรับทดสอบเท่านั้น ไม่รวมใน production bundle
  App.tsx        # Navigation และประกอบหน้าจอ
  main.tsx       # React entry point และ error boundary
public/          # App icons, maskable icon, apple-touch-icon และ favicon
scripts/         # สร้างไอคอนต้นฉบับซ้ำได้
tests/           # Browser integration tests
.github/workflows/deploy.yml
TASKS.md         # แผนงานและผลตรวจสอบ
```

## วิธีคำนวณ

ใช้ **full-tank method** เท่านั้น:

```text
ระยะทาง = เลขไมล์เต็มถังครั้งปัจจุบัน − เลขไมล์เต็มถังครั้งก่อน
ลิตรที่ใช้ = น้ำมันทุกครั้งหลังเต็มถังครั้งก่อน จนถึงเต็มถังครั้งปัจจุบัน
km/L = ระยะทาง ÷ ลิตรที่ใช้
```

ไม่นับน้ำมันของถังเปิดช่วง ตัวอย่าง 10,000 km เต็มถัง → 10,150 km เติมบางส่วน 3 L → 10,300 km เต็มถัง 7 L เท่ากับ `300 / (3 + 7) = 30 km/L` การแก้ไขย้อนหลังจะคำนวณช่วงที่เกี่ยวข้องใหม่เสมอ ค่าเฉลี่ยรวมคือระยะทางทุกช่วงที่ใช้ได้ ÷ ลิตรทุกช่วงที่ใช้ได้ ไม่ใช่ค่าเฉลี่ยเลขคณิตของ km/L

ข้อมูลไม่พอจะแสดง “ยังมีข้อมูลไม่เพียงพอ” ค่าเลขไมล์ติดลบหรือปริมาณน้ำมันไม่ถูกต้องจะถูกปฏิเสธ เลขไมล์ลดลงตามเวลาจะให้ยืนยัน และตัดช่วงนั้นออกจากการคำนวณ km/L เต็มถังถัดไปใช้เริ่มช่วงใหม่ได้

ระยะทางที่บันทึกเริ่มจากรายการเติมแรก (เลขไมล์เริ่มต้นไม่มีวันที่ จึงไม่เอามาเดาระยะทางรายเดือน) ระยะทางรายเดือนรวมส่วนต่างเลขไมล์ที่สิ้นสุดในเดือนนั้น ช่วงที่เลขไมล์ลดลงนับเป็นศูนย์ ยอดลิตร/เงินเป็นยอดซื้อจริง ค่าใช้จ่ายต่อกิโลเมตรคือยอดซื้อทั้งหมด ÷ ระยะทางที่บันทึก จึงไม่ใช่ต้นทุนการเผาไหม้จริง โดยเฉพาะถังแรกหรือช่วงที่ยังเติมไม่เต็ม

วันเวลาจัดเก็บเป็น ISO UTC แสดงผล/จัดกลุ่มเดือนตามเขตเวลาของอุปกรณ์ วันที่ไทยแสดงปี พ.ศ. ช่องปีรถระบุ **ค.ศ.** ชัดเจน

## Deploy ฟรีด้วย GitHub Pages

Remote ของโปรเจกต์นี้คือ `https://github.com/BKP94/FillUpWebApp.git` ไม่มีการ push หรือเผยแพร่อัตโนมัติจากการสร้างโค้ดในเครื่อง

1. ใช้ GitHub repository แบบ **public** เพื่อใช้ GitHub Pages ฟรี เปิด **Settings → Pages → Build and deployment → Source → GitHub Actions**
2. Push โค้ดขึ้น branch `main`:

   ```sh
   git push -u origin main
   ```

3. ดูแท็บ **Actions → Verify and deploy FillUp** Workflow จะติดตั้ง dependencies, ตรวจ TypeScript/lint, รัน unit tests, build, ทดสอบ Chromium/WebKit แล้วจึง deploy
4. เมื่อ workflow สำเร็จ เปิด URL ที่ job `deploy` แสดง สำหรับ remote ปัจจุบันคาดว่าจะเป็น `https://bkp94.github.io/FillUpWebApp/` URL นี้ยังไม่ถือว่าออนไลน์จน deploy สำเร็จ

`base: './'`, manifest scope/start URL แบบ relative และ navigation ภายในแอปที่ไม่สร้าง path ใหม่ ทำให้รองรับทั้งโดเมนหลักและ GitHub Pages repository subpath การเปิดเว็บครั้งแรกต้องออนไลน์และใช้ HTTPS จึงเตรียม offline cache ได้

Pull requests รัน checks แต่ไม่ deploy มีสิทธิ์เขียนเฉพาะ deploy job ไม่มี token ฝังใน frontend ไม่ต้องตั้ง secrets เพิ่มสำหรับ Pages มาตรฐาน

ขั้นตอนอ้างอิง: [Vite static deployment](https://vite.dev/guide/static-deploy) และ [Vite PWA registration](https://vite-pwa-org.netlify.app/guide/register-service-worker)

### Cloudflare Pages เป็นอีกทางเลือก

1. สร้าง Pages project เชื่อม repository ของคุณ
2. ตั้ง build command เป็น `npm run build`, output directory เป็น `dist`, production branch เป็น `main` และ Node version เป็น `24`
3. Deploy และเปิด HTTPS URL ที่ได้รับ หรือสร้าง Direct Upload project แล้วอัปโหลดไฟล์ทั้งหมดภายใน `dist`

ไม่มี Workers, Functions, database หรือบริการเสียเงินที่แอปต้องใช้ ดูขั้นตอนปัจจุบันที่ [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)

## ทดสอบและติดตั้งบน iPhone

1. เปิด **HTTPS URL ที่ deploy แล้วใน Safari** การเปิดผ่าน `http://<LAN-IP>:5173` ใช้ดู UI ได้ แต่ไม่ใช่ secure context สำหรับ Service Worker/PWA
2. รอให้เปิดครบ ไปตั้งค่าและตรวจข้อความ **พร้อมใช้งานออฟไลน์**
3. กด **Share (แชร์) → เพิ่มไปยังหน้าจอโฮม → เพิ่ม** แล้วเปิด FillUp จากไอคอนบน Home Screen
4. สร้างรถและบันทึกการเติม ปิดแอปแล้วเปิดใหม่ ตรวจว่าประวัติยังอยู่
5. เปิดโหมดเครื่องบิน ปิดและเปิดแอปอีกครั้ง ลองเพิ่ม/แก้ไข/ลบรายการ ตรวจว่า Dashboard เปลี่ยนและข้อมูลยังอยู่หลังเปิดใหม่
6. กลับออนไลน์ ทดลองส่งออก JSON ไปแอป Files จากนั้นนำเข้าและตรวจจำนวนรถ/ประวัติ อย่าล้างข้อมูลจริงก่อนมีไฟล์สำรองที่ตรวจแล้ว
7. ทดสอบ Light/Dark, หมุนหน้าจอ, แป้นพิมพ์ตัวเลข, safe area ด้านบน/ล่าง และปิดคำแนะนำติดตั้ง

ไม่ต้องใช้ App Store หรือบัญชี Apple Developer การทดสอบ WebKit อัตโนมัติช่วยตรวจการทำงานของ engine และขนาดหน้าจอ แต่ไม่ได้แทนการทดสอบ Add to Home Screen, คีย์บอร์ด และ lifecycle บน iPhone จริง

## การทดสอบอัตโนมัติ

```sh
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

บน Linux ที่ยังไม่มี system dependencies ใช้ `npx playwright install --with-deps chromium webkit` ภาพ/trace ของการทดสอบที่ล้มเหลวอยู่ใน `test-results` และ HTML report อยู่ใน `playwright-report` ทั้งสองโฟลเดอร์ไม่ถูก commit

ทดสอบสูตรเติมเต็มถังปกติ/หลาย partial fills/ไม่มี baseline/เลขไมล์ผิด/ศูนย์ลิตร/แก้ไขย้อนหลัง/แยกรถ/ค่าเฉลี่ยถ่วงน้ำหนัก รวมถึง persistence, transactions, conflict detection, invalid imports, CSV และ backup ขนาดใหญ่ที่มีข้อความไทย

Browser tests ครอบคลุม onboarding, fuel CRUD, ยกเลิกการลบ, หลายคัน, การสลับรถข้ามแท็บระหว่างแก้ไข, JSON/CSV, ล้างและกู้คืน, dark mode, reverse calculation, warning confirmation, install hint, manifest/Service Worker และ URL โฟลเดอร์ย่อยแบบ GitHub Pages ทั้ง Chromium และ WebKit

การจำลอง offline reload/read/write ตรวจผ่าน Chromium ส่วนกรณี offline reload บน Playwright WebKit/Windows ถูกข้ามไว้โดยระบุเหตุผล: ทดลองแล้ว engine แจ้ง `WebKit encountered an internal error` แม้ Service Worker ลงทะเบียนและควบคุมหน้าได้ การติดตั้งและ offline lifecycle บน iPhone จริงยังต้องตรวจตามรายการด้านบน

## ข้อมูลและข้อจำกัดที่ควรรู้

- ข้อมูลแยกตามอุปกรณ์/เบราว์เซอร์/origin ไม่มี cloud sync ย้ายโดเมนหรือย้ายอุปกรณ์ให้ export/import JSON โหมด standalone และ Safari อาจมี lifecycle/storage ต่างกันตาม iOS ให้สำรองจากแอปที่ใช้งานจริง
- iOS/เบราว์เซอร์เป็นผู้กำหนดอายุ storage และอาจล้างข้อมูลเมื่อพื้นที่เต็ม ผู้ใช้ล้างเว็บไซต์ หรือใช้ Private Browsing มีปุ่มขอ persistent storage แต่เบราว์เซอร์อาจไม่อนุญาต สำรองเป็นระยะเสมอ
- รองรับ 1,000 คันและ 10,000 รายการต่อฐานข้อมูล นำเข้า JSON ได้สูงสุด 100 MB ขอบเขตความยาวฟิลด์ทำให้ไฟล์สำรองที่แอปสร้างจากข้อมูลที่รองรับนำกลับเข้าได้ แม้บันทึกหมายเหตุภาษาไทยเต็มทุกช่อง
- ไม่รองรับรูปใบเสร็จ, OCR, sync, การรวมไฟล์สำรองหลายชุด หรือการย้ายประวัติข้ามรถ การ import แทนที่ทั้งฐานข้อมูลหลังยืนยัน
- กราฟแสดง 12 เดือนที่มีข้อมูลล่าสุด / 30 รายการหรือช่วงล่าสุดเพื่อให้อ่านง่ายบนมือถือ แต่ตัวเลขรวมใช้ข้อมูลทั้งหมด
- การอัปเดตแอปจะแสดงปุ่มให้ผู้ใช้ยืนยัน และซ่อนปุ่มขณะเปิด editor เพื่อไม่ reload ระหว่างกรอกข้อมูล IndexedDB ไม่ถูกลบเมื่อ Service Worker เปลี่ยนเวอร์ชัน
- Schema ปัจจุบันคือเวอร์ชัน 1 หากเปลี่ยน schema ในอนาคตต้องเพิ่ม IndexedDB upgrade migration และ backup version migration ก่อน release
- ไฟล์สำรองไม่เข้ารหัส ควรเก็บในที่ปลอดภัย เว็บไซต์โฮสต์อาจเก็บ request logs ของไฟล์ static ตามนโยบายผู้ให้บริการ แต่ FillUp ไม่มี API ส่งข้อมูลรถหรือประวัติออกไป

ไอคอนเป็นงานวาดต้นฉบับใน repository ไม่มีรูปหรือฟอนต์ remote หากต้องการสร้าง PNG ซ้ำบน Windows ใช้ `powershell -NoProfile -File scripts/generate-icons.ps1`
