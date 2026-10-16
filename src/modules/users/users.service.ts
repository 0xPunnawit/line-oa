import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegistrationResult } from './dto/registration-result.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /** Finds a user by their LINE user ID, returns null if not found */
  async findByLineUserId(lineUserId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { lineUserId } });
  }

  /**
   * Registers a new user by LINE user ID.
   * Returns RegistrationResult with isNew=false if already exists.
   */
  async register(lineUserId: string): Promise<RegistrationResult> {
    const existing = await this.findByLineUserId(lineUserId);
    if (existing) {
      return new RegistrationResult(existing, false);
    }

    const user = this.userRepository.create({ lineUserId, point: 0 });
    const savedUser = await this.userRepository.save(user);
    return new RegistrationResult(savedUser, true);
  }

  /**
   * Increments user's point by the given amount.
   * Throws NotFoundException if user doesn't exist.
   */
  async updatePoint(lineUserId: string, points: number): Promise<User> {
    const result = await this.userRepository.increment(
      { lineUserId },
      'point',
      points,
    );

    if (result.affected === 0) {
      throw new NotFoundException(`User not found: ${lineUserId}`);
    }

    const user = await this.findByLineUserId(lineUserId);
    if (!user) {
      throw new NotFoundException(`User not found: ${lineUserId}`);
    }

    return user;
  }

  /**
   * Deducts points from user's balance.
   * Throws BadRequestException if insufficient points.
   */
  async deductPoints(userId: number, points: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    if (user.point < points) {
      throw new BadRequestException(
        `Insufficient points. Current: ${user.point}, Required: ${points}`,
      );
    }

    const result = await this.userRepository.decrement(
      { userId },
      'point',
      points,
    );

    if (result.affected === 0) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    const updatedUser = await this.userRepository.findOne({
      where: { userId },
    });
    if (!updatedUser) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    return updatedUser;
  }
}
