import { test, expect } from '@playwright/test'

test.describe('Phonebook', () => {
  test('front page can be opened', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Phonebook')).toBeVisible()
    await expect(page.getByText('add a new')).toBeVisible()
    await expect(page.getByText('Numbers')).toBeVisible()
  })
})