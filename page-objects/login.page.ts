  import { Locator, Page } from '@playwright/test';

  export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    
    constructor(page: Page) {
      this.page = page;
      this.usernameInput = this.page.locator('[data-test="username"]');
      this.passwordInput = this.page.locator('[data-test="password"]');
      this.loginButton = this.page.locator('[data-test="login-button"]');
      this.errorMessage = this.page.locator('[data-test="error"]');
    }

    async goto() {
      await this.page.goto('/');
    }

    async login(username: string, password: string) {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    }

    async getErrorMessageText(): Promise<string | null> {
      return await this.errorMessage.textContent();
    }
  }