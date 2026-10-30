export type Title = 'Mr' | 'Mrs';

export type Country =
  'India' | 'United States' | 'Canada' | 'Australia' | 'Israel' | 'New Zealand' | 'Singapore';

export type Month =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

/** A complete customer account, shaped for both the signup UI and the createAccount API. */
export interface UserAccount {
  name: string;
  email: string;
  password: string;
  title: Title;
  birthDay: string;
  birthMonth: Month;
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: Country;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export interface Product {
  id: number;
  name: string;
  /** Display price exactly as rendered, e.g. "Rs. 500". */
  price: string;
  /** Category breadcrumb as rendered in the cart, e.g. "Women > Tops". */
  category: string;
  brand: string;
}

export type CategoryGroup = 'Women' | 'Men' | 'Kids';

export interface Category {
  group: CategoryGroup;
  name: string;
  id: number;
  /** Page heading shown on the category listing. */
  title: string;
}

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface PaymentCard {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface ContactMessage {
  subject: string;
  message: string;
}
