import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/login.page';
import users from '../../test-data/users.json';
import * as messages from '../utils/messages';

test.describe('login scenarios', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('verify successful login with valid credentials', async ({ page }) => {
    const validUser = users.find(user => user.scenario === 'valid_credentials');

    if (!validUser) {
      throw new Error('Test data not found for valid credentials scenario.');
    }

    await loginPage.login(validUser.username, validUser.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('verify login fails with valid username and invalid password', async ({ page }) => {
    const invalidPasswordUser = users.find(user => user.scenario === 'invalid_password');
    const validUser = users.find(user => user.scenario === 'valid_credentials');

    if (!invalidPasswordUser) {
      throw new Error('Test data not found for invalid password scenario.');
    }
    if (!validUser) {
      throw new Error('Test data not found for valid credentials scenario (to get username).');
    }

    await loginPage.login(validUser.username, invalidPasswordUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
    const errorMessageText = await loginPage.getErrorMessageText();
    expect(errorMessageText).toContain(messages.INVALID_CREDENTIALS_ERROR);
  });

  test('verify login fails with invalid username and valid password', async ({ page }) => {
    const invalidUsernameUser = users.find(user => user.scenario === 'invalid_username');
    const validUser = users.find(user => user.scenario === 'valid_credentials');

    if (!invalidUsernameUser) {
      throw new Error('Test data not found for invalid username scenario.');
    }
    if (!validUser) {
      throw new Error('Test data not found for valid credentials scenario (to get password).');
    }

    await loginPage.login(invalidUsernameUser.username, validUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
    const errorMessageText = await loginPage.getErrorMessageText();
    expect(errorMessageText).toContain(messages.INVALID_CREDENTIALS_ERROR);
  });

  test('verify login fails with locked out user', async ({ page }) => {
    const lockedOutUser = users.find(user => user.scenario === 'locked_out_user');

    if (!lockedOutUser) {
      throw new Error('Test data not found for locked out user scenario.');
    }

    await loginPage.login(lockedOutUser.username, lockedOutUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
    const errorMessageText = await loginPage.getErrorMessageText();
    expect(errorMessageText).toContain(lockedOutUser.errorMessage);
  });

  test('verify login fails with empty username', async ({ page }) => {
    const emptyUsernameUser = users.find(user => user.scenario === 'empty_username');

    if (!emptyUsernameUser) {
      throw new Error('Test data not found for empty username scenario.');
    }

    await loginPage.login(emptyUsernameUser.username, emptyUsernameUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
    const errorMessageText = await loginPage.getErrorMessageText();
    expect(errorMessageText).toContain(messages.USERNAME_REQUIRED_ERROR);
  });

  test('verify login fails with empty password', async ({ page }) => {
    const emptyPasswordUser = users.find(user => user.scenario === 'empty_password');

    if (!emptyPasswordUser) {
      throw new Error('Test data not found for empty password scenario.');
    }
    const validUser = users.find(user => user.scenario === 'valid_credentials');
    if (!validUser) {
      throw new Error('Test data not found for valid credentials scenario (to get username).');
    }

    await loginPage.login(validUser.username, emptyPasswordUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
    const errorMessageText = await loginPage.getErrorMessageText();
    expect(errorMessageText).toContain(messages.PASSWORD_REQUIRED_ERROR);
  });

  test('verify login fails with empty username and password', async ({ page }) => {
    const emptyCredentialsUser = users.find(user => user.scenario === 'empty_username_and_password');

    if (!emptyCredentialsUser) {
      throw new Error('Test data not found for empty username and password scenario.');
    }

    await loginPage.login(emptyCredentialsUser.username, emptyCredentialsUser.password);
    await expect(loginPage.errorMessage).toBeVisible();
    const errorMessageText = await loginPage.getErrorMessageText();
    expect(errorMessageText).toContain(messages.USERNAME_REQUIRED_ERROR);
  });
});