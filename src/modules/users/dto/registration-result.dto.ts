import { User } from '../../users/entities/user.entity';

export class RegistrationResult {
  user: User;
  isNew: boolean;

  constructor(user: User, isNew: boolean) {
    this.user = user;
    this.isNew = isNew;
  }
}
