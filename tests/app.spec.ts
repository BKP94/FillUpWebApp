import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function createVehicle(page: Page, name = 'รถคู่ใจ') {
  await page.getByLabel('ชื่อรถ', { exact: true }).fill(name)
  await page.getByLabel('ยี่ห้อ', { exact: true }).fill('Honda')
  await page.getByLabel('รุ่น', { exact: true }).fill('ADV 350')
  await page.getByLabel('เลขไมล์ปัจจุบัน (km)').fill('10000')
  await page.getByRole('button', { name: 'เริ่มต้นใช้งาน', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'ภาพรวมของคุณ.' })).toBeVisible()
}
async function navigate(page: Page, name: string) {
  const mobile = (page.viewportSize()?.width ?? 1280) <= 760
  await page
    .getByRole('navigation', { name: mobile ? 'เมนูมือถือ' : 'เมนูหลัก', exact: true })
    .getByRole('button', { name, exact: true })
    .click()
}
async function fillUp(page: Page, day: string, odometer: string, liters: string, full = true) {
  await page.getByRole('button', { name: 'เติมน้ำมัน', exact: true }).filter({ visible: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('วันที่และเวลา').fill(`2026-08-${day}T12:00`)
  await dialog.getByLabel('เลขไมล์ (km)', { exact: true }).fill(odometer)
  await dialog.getByLabel('ปริมาณน้ำมัน (L)').fill(liters)
  await dialog.getByLabel('ราคาต่อลิตร (฿/L)').fill('35')
  await expect(dialog.getByLabel('ยอดรวม (฿)', { exact: true })).toHaveValue(String(Number(liters) * 35))
  if (!full) await dialog.getByRole('switch').uncheck()
  await dialog.getByRole('button', { name: 'บันทึกการเติม', exact: true }).click()
  await expect(dialog).toBeHidden()
}

test('first run, fuel calculations, edit/delete, persistence and multiple vehicles', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await createVehicle(page)
  await fillUp(page, '01', '10000', '8')
  await fillUp(page, '02', '10150', '3', false)
  await fillUp(page, '03', '10300', '7')
  await expect(page.locator('.economy-metrics .metric-value').first()).toContainText('30.0')
  await page.screenshot({ path: `test-results/dashboard-${test.info().project.name}.png`, fullPage: true })
  await page.reload()
  await expect(page.locator('.hero-odometer')).toContainText('10,300')
  await navigate(page, 'ประวัติ')
  await expect(page.locator('.history-group .record-row')).toHaveCount(3)
  await page.locator('.history-group .record-row').nth(1).click()
  await page.getByRole('button', { name: 'แก้ไขรายการ' }).click()
  await page.getByLabel('ปริมาณน้ำมัน (L)').fill('5')
  await page.getByRole('button', { name: 'บันทึกการเติม', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await navigate(page, 'หน้าหลัก')
  await expect(page.locator('.economy-metrics .metric-value').first()).toContainText('25.0')
  await navigate(page, 'ประวัติ')
  await page.locator('.history-group .record-row').nth(1).click()
  await page.getByRole('button', { name: 'ลบรายการ', exact: true }).click()
  await page.getByRole('button', { name: 'ยกเลิก', exact: true }).click()
  await expect(page.locator('.history-group .record-row')).toHaveCount(3)
  await page.locator('.history-group .record-row').nth(1).click()
  await page.getByRole('button', { name: 'ลบรายการ', exact: true }).click()
  await page.getByRole('button', { name: 'ยืนยันการลบ', exact: true }).click()
  await expect(page.locator('.history-group .record-row')).toHaveCount(2)
  await navigate(page, 'รถของฉัน')
  await page.getByRole('button', { name: 'เพิ่มรถ', exact: true }).click()
  await page.getByLabel('ชื่อรถ', { exact: true }).fill('รถครอบครัว')
  await page.getByLabel('ยี่ห้อ', { exact: true }).fill('Toyota')
  await page.getByLabel('รุ่น', { exact: true }).fill('Yaris')
  await page.getByLabel('เลขไมล์ปัจจุบัน (km)').fill('100')
  await page.getByRole('button', { name: 'บันทึกข้อมูลรถ' }).click()
  await page.getByRole('button', { name: 'ใช้รถคันนี้' }).click()
  await navigate(page, 'ประวัติ')
  await expect(page.getByRole('heading', { name: 'ยังไม่มีประวัติการเติม' })).toBeVisible()
  await page.getByLabel('รถที่ใช้งาน').selectOption({ label: 'รถคู่ใจ' })
  await expect(page.locator('.history-group .record-row')).toHaveCount(2)
  await navigate(page, 'สถิติ')
  await expect(page.getByRole('img', { name: 'อัตราสิ้นเปลืองแต่ละครั้ง', exact: true })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
  expect(errors).toEqual([])
})

test('backup, import validation, CSV, wipe and restore', async ({ page }) => {
  await page.goto('/')
  await createVehicle(page)
  await fillUp(page, '01', '10000', '8')
  await navigate(page, 'ตั้งค่า')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'ส่งออกไฟล์สำรอง JSON', exact: false }).click()
  const filePath = await (await download).path()
  expect(filePath).toBeTruthy()
  const backup = await readFile(filePath!, 'utf8')
  expect(JSON.parse(backup).data.records).toHaveLength(1)
  const csvDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'ส่งออกประวัติ CSV', exact: false }).click()
  const csv = await readFile((await (await csvDownload).path())!, 'utf8')
  expect(csv).toContain('รถคู่ใจ')
  expect(csv.charCodeAt(0)).toBe(0xfeff)
  await page
    .getByLabel('ไฟล์สำรอง JSON')
    .setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{bad') })
  await expect(page.getByRole('alert')).toContainText('JSON')
  await page.getByRole('button', { name: 'ลบข้อมูลทั้งหมด', exact: false }).click()
  await page.getByRole('button', { name: 'ยืนยันการลบ', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'เพิ่มรถคันแรกของคุณ' })).toBeVisible()
  await page.getByRole('button', { name: 'มีข้อมูลเดิมอยู่แล้ว?', exact: false }).click()
  await page
    .getByLabel('ไฟล์สำรอง JSON')
    .setInputFiles({ name: 'fillup.json', mimeType: 'application/json', buffer: Buffer.from(backup) })
  await page.getByRole('button', { name: 'ยกเลิก', exact: true }).click()
  await expect(page.getByText('รถ 0 คัน · ประวัติการเติม 0 รายการ')).toBeVisible()
  await page
    .getByLabel('ไฟล์สำรอง JSON')
    .setInputFiles({ name: 'fillup.json', mimeType: 'application/json', buffer: Buffer.from(backup) })
  await page.getByRole('button', { name: 'แทนที่และกู้คืน' }).click()
  await expect(page.getByText('รถ 1 คัน · ประวัติการเติม 1 รายการ')).toBeVisible()
  await page.getByRole('button', { name: 'มืด', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.hero-odometer')).toContainText('10,000')
})

test('PWA manifest, icons, service worker registration and control', async ({ page }) => {
  await page.goto('/')
  const manifestUrl = await page.locator('link[rel="manifest"]').getAttribute('href')
  const manifestResponse = await page.request.get(manifestUrl!)
  const manifest = await manifestResponse.json()
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons).toHaveLength(3)
  for (const icon of manifest.icons) expect((await page.request.get(icon.src)).ok()).toBe(true)
  await createVehicle(page)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
})

test('offline read/write after reload', async ({ page, context, browserName }) => {
  test.skip(
    browserName === 'webkit',
    'Observed Windows Playwright WebKit internal error on offline reload; actual iPhone checklist in README.',
  )
  await page.goto('/')
  await createVehicle(page)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'ภาพรวมของคุณ.' })).toBeVisible()
  await fillUp(page, '01', '10000', '8')
  await page.reload()
  await navigate(page, 'ประวัติ')
  await expect(page.locator('.history-group .record-row')).toHaveCount(1)
  await context.setOffline(false)
})

test('GitHub Pages subpath resolves assets, manifest and scoped service worker', async ({
  page,
  context,
  browserName,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('http://127.0.0.1:4174/FillUpWebApp/')
  await createVehicle(page)
  const manifestUrl = await page
    .locator('link[rel="manifest"]')
    .evaluate((element: HTMLLinkElement) => element.href)
  expect(manifestUrl).toBe('http://127.0.0.1:4174/FillUpWebApp/manifest.webmanifest')
  const manifest = await (await page.request.get(manifestUrl)).json()
  for (const icon of manifest.icons)
    expect((await page.request.get(new URL(icon.src, manifestUrl).href)).ok()).toBe(true)
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)
  expect(scope).toBe('http://127.0.0.1:4174/FillUpWebApp/')
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  if (browserName === 'chromium') {
    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'ภาพรวมของคุณ.' })).toBeVisible()
    await context.setOffline(false)
  }
  expect(errors).toEqual([])
})

test('editing remains attached to the original vehicle when another tab switches', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await createVehicle(page)
  await fillUp(page, '01', '10000', '8')
  await navigate(page, 'รถของฉัน')
  await page.getByRole('button', { name: 'เพิ่มรถ', exact: true }).click()
  await page.getByLabel('ชื่อรถ', { exact: true }).fill('รถคันที่สอง')
  await page.getByLabel('ยี่ห้อ', { exact: true }).fill('Toyota')
  await page.getByLabel('รุ่น', { exact: true }).fill('Yaris')
  await page.getByLabel('เลขไมล์ปัจจุบัน (km)').fill('0')
  await page.getByRole('button', { name: 'บันทึกข้อมูลรถ' }).click()
  await navigate(page, 'ประวัติ')
  await page.locator('.history-group .record-row').click()
  await page.getByRole('button', { name: 'แก้ไขรายการ' }).click()
  const other = await context.newPage()
  await other.goto('/')
  await other.getByLabel('รถที่ใช้งาน').selectOption({ label: 'รถคันที่สอง' })
  await expect(page.getByLabel('รถที่ใช้งาน')).toHaveValue(await other.getByLabel('รถที่ใช้งาน').inputValue())
  await page.getByLabel('หมายเหตุ').fill('รายการยังเป็นของรถคู่ใจ')
  await page.getByRole('button', { name: 'บันทึกการเติม', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.getByRole('heading', { name: 'ยังไม่มีประวัติการเติม' })).toBeVisible()
  await page.getByLabel('รถที่ใช้งาน').selectOption({ label: 'รถคู่ใจ' })
  await expect(page.locator('.history-group .record-row')).toHaveCount(1)
  await page.locator('.history-group .record-row').click()
  await expect(page.getByText('รายการยังเป็นของรถคู่ใจ', { exact: true })).toBeVisible()
  await other.close()
})

test('reverse price calculation, unusual-value confirmation, iOS hint persistence', async ({
  page,
  browserName,
}) => {
  await page.goto('/')
  await createVehicle(page)
  if (browserName === 'webkit') {
    await expect(page.getByText('ติดตั้ง FillUp บน iPhone', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'ไม่แสดงคำแนะนำอีก' }).click()
    await page.reload()
    await expect(page.getByRole('button', { name: 'ไม่แสดงคำแนะนำอีก' })).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'เติมน้ำมัน', exact: true }).filter({ visible: true }).click()
  await page.getByLabel('เลขไมล์ (km)', { exact: true }).fill('9900')
  await page.getByLabel('ปริมาณน้ำมัน (L)').fill('7.2')
  await page.getByLabel('ยอดรวม (฿)', { exact: true }).fill('255.60')
  await expect(page.getByLabel('ราคาต่อลิตร (฿/L)')).toHaveValue('35.5000')
  await page.getByRole('button', { name: 'บันทึกการเติม', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('เลขไมล์ไม่เรียงตามเวลา')
  await page.getByRole('button', { name: 'ตรวจสอบแล้ว ยืนยันบันทึก' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('.hero-odometer')).toContainText('9,900')
})
