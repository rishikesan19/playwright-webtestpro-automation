import type { Locator, Page } from '@playwright/test';
import type { UserAccount } from '@test-data/types';
import { BasePage } from './BasePage';

export interface SignupPreferences {
  newsletter?: boolean;
  specialOffers?: boolean;
}

/**
 * "Enter Account Information" form reached after LoginPage.startSignup().
 * Labelled fields use getByLabel; date selects, address lines, city and zipcode have no usable
 * accessible name (the City label wraps the Zipcode input too), so the site's data-qa hooks are used.
 */
export class SignupPage extends BasePage {
  protected readonly path = '/signup';

  readonly accountInfoHeading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly daySelect: Locator;
  readonly monthSelect: Locator;
  readonly yearSelect: Locator;
  readonly newsletterCheckbox: Locator;
  readonly specialOffersCheckbox: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly createAccountButton: Locator;

  // Outcome page shown after a successful submission (/account_created).
  readonly accountCreatedHeading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accountInfoHeading = page.getByRole('heading', { name: 'Enter Account Information' });
    this.nameInput = page.getByTestId('name');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByLabel('Password');
    this.daySelect = page.getByTestId('days');
    this.monthSelect = page.getByTestId('months');
    this.yearSelect = page.getByTestId('years');
    this.newsletterCheckbox = page.getByRole('checkbox', { name: 'Sign up for our newsletter!' });
    this.specialOffersCheckbox = page.getByRole('checkbox', {
      name: 'Receive special offers from our partners!',
    });
    this.firstNameInput = page.getByLabel('First name');
    this.lastNameInput = page.getByLabel('Last name');
    // exact: the Address label's hint text ("... Company name, etc.") also contains "Company".
    this.companyInput = page.getByLabel('Company', { exact: true });
    this.address1Input = page.getByTestId('address');
    this.address2Input = page.getByTestId('address2');
    this.countrySelect = page.getByLabel('Country');
    this.stateInput = page.getByLabel('State');
    this.cityInput = page.getByTestId('city');
    this.zipcodeInput = page.getByTestId('zipcode');
    this.mobileNumberInput = page.getByLabel('Mobile Number');
    this.createAccountButton = page.getByRole('button', { name: 'Create Account' });

    this.accountCreatedHeading = page.getByRole('heading', { name: 'Account Created!' });
    this.continueButton = page.getByTestId('continue-button');
  }

  titleRadio(title: UserAccount['title']): Locator {
    return this.page.getByRole('radio', { name: `${title}.`, exact: true });
  }

  /** Fills every account and address field. Name and email are pre-filled from the signup step. */
  async fillAccountDetails(user: UserAccount, preferences: SignupPreferences = {}): Promise<void> {
    await this.titleRadio(user.title).check();
    await this.passwordInput.fill(user.password);
    await this.daySelect.selectOption(user.birthDay);
    await this.monthSelect.selectOption({ label: user.birthMonth });
    await this.yearSelect.selectOption(user.birthYear);
    await this.newsletterCheckbox.setChecked(preferences.newsletter ?? false);
    await this.specialOffersCheckbox.setChecked(preferences.specialOffers ?? false);
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.companyInput.fill(user.company);
    await this.address1Input.fill(user.address1);
    await this.address2Input.fill(user.address2);
    await this.countrySelect.selectOption(user.country);
    await this.stateInput.fill(user.state);
    await this.cityInput.fill(user.city);
    await this.zipcodeInput.fill(user.zipcode);
    await this.mobileNumberInput.fill(user.mobileNumber);
  }

  async createAccount(user: UserAccount, preferences?: SignupPreferences): Promise<void> {
    await this.fillAccountDetails(user, preferences);
    await this.createAccountButton.click();
  }

  async continueAfterAccountCreated(): Promise<void> {
    await this.continueButton.click();
  }
}
