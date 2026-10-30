import type { UserAccount } from '@test-data/types';

/** Address block lines exactly as the checkout page renders them for a registered user. */
export function expectedAddressLines(user: UserAccount): string[] {
  return [
    `${user.title}. ${user.firstName} ${user.lastName}`,
    user.company,
    user.address1,
    user.address2,
    `${user.city} ${user.state} ${user.zipcode}`,
    user.country,
    user.mobileNumber,
  ];
}
