import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage — https://automationexercise.com/login
 *
 * The page hosts both the login form and the signup initiator form.
 * We expose two intent-revealing methods: `login()` and `startSignup()`.
 */
export class LoginPage extends BasePage {
  protected readonly path = '/login';
  protected readonly pageReadyLocator: Locator;

  private readonly loginEmail: Locator;
  private readonly loginPassword: Locator;
  private readonly loginButton: Locator;
  private readonly loginError: Locator;

  private readonly signupName: Locator;
  private readonly signupEmail: Locator;
  private readonly signupButton: Locator;

  constructor(page: Page) {
    super(page);

    const loginForm = page.locator('form[action="/login"]');
    this.loginEmail = loginForm.getByPlaceholder('Email Address');
    this.loginPassword = loginForm.getByPlaceholder('Password');
    this.loginButton = loginForm.getByRole('button', { name: /login/i });
    this.loginError = page.getByText(/your email or password is incorrect/i);

    const signupForm = page.locator('form[action="/signup"]');
    this.signupName = signupForm.getByPlaceholder('Name');
    this.signupEmail = signupForm.getByPlaceholder('Email Address');
    this.signupButton = signupForm.getByRole('button', { name: /signup/i });

    this.pageReadyLocator = page.getByRole('heading', { name: /login to your account/i });
  }

  /** Fill the login form and submit. Does not assert success. */
  async login(email: string, password: string): Promise<void> {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  /** Start the signup flow. Site redirects to `/signup` on submit. */
  async startSignup(name: string, email: string): Promise<void> {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupButton.click();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.loginError).toBeVisible();
  }
}
