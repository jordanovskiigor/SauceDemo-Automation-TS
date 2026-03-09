import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login.page';
import { InventoryPage } from '../../page-objects/inventory.page';
import { CartPage } from '../../page-objects/cart.page';
import { CheckoutPage } from '../../page-objects/checkout.page';
import users from '../../test-data/users.json';

test.describe('checkout scenarios', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  const item1 = 'Sauce Labs Backpack';

  test.beforeEach(async ({ page }) => {
    const validUser = users.find(user => user.scenario === 'valid_credentials');
    if (!validUser) {
      throw new Error('Test data not found for valid credentials scenario.');
    }

    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(validUser.username, validUser.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  async function addItemAndGoToCheckout() {
    await inventoryPage.addItemToCart(item1);
    await expect.poll(async () => inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.goToCart();
    await expect(cartPage.itemName(item1)).toBeVisible();

    await cartPage.goToCheckout();
  }

  test('Complete successful checkout', async ({ page }) => {
    await addItemAndGoToCheckout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await checkoutPage.fillFirstName('Igor');
    await checkoutPage.fillLastName('Jordanovski');
    await checkoutPage.fillZipCode('1000');
    await checkoutPage.clickContinue();
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await checkoutPage.clickFinish();
    await expect(page).toHaveURL(/checkout-complete\.html/);

    const confirmationText = await checkoutPage.getConfirmationMessageText();
    expect(confirmationText).toContain('Thank you for your order!');
  });

  test('Verify error when first name is missing', async ({ page }) => {
    await addItemAndGoToCheckout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await checkoutPage.fillLastName('Jordanovski');
    await checkoutPage.fillZipCode('1000');
    await checkoutPage.clickContinue();

    await expect(checkoutPage.errorMessage).toBeVisible();
    const errorText = await checkoutPage.getErrorMessageText();
    expect(errorText).toContain('Error: First Name is required');
  });

  test('Verify error when last name is missing', async ({ page }) => {
    await addItemAndGoToCheckout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await checkoutPage.fillFirstName('Igor');
    await checkoutPage.fillZipCode('1000');
    await checkoutPage.clickContinue();

    await expect(checkoutPage.errorMessage).toBeVisible();
    const errorText = await checkoutPage.getErrorMessageText();
    expect(errorText).toContain('Error: Last Name is required');
  });

  test('Verify error when zip code is missing', async ({ page }) => {
    await addItemAndGoToCheckout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await checkoutPage.fillFirstName('Igor');
    await checkoutPage.fillLastName('Jordanovski');
    await checkoutPage.clickContinue();

    await expect(checkoutPage.errorMessage).toBeVisible();
    const errorText = await checkoutPage.getErrorMessageText();
    expect(errorText).toContain('Error: Postal Code is required');
  });

  test('Verify cart is empty after successful checkout', async ({ page }) => {
    await addItemAndGoToCheckout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await checkoutPage.fillFirstName('Igor');
    await checkoutPage.fillLastName('Jordanovski');
    await checkoutPage.fillZipCode('1000');
    await checkoutPage.clickContinue();
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await checkoutPage.clickFinish();
    await expect(page).toHaveURL(/checkout-complete\.html/);

    await cartPage.goto();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });
});
