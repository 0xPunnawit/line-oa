import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    lineUserId: 'U123',
    point: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    const mockRepo: Partial<jest.Mocked<Repository<User>>> = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      increment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('findByLineUserId', () => {
    it('should return user when found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByLineUserId('U123');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { lineUserId: 'U123' },
      });
    });

    it('should return null when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByLineUserId('U999');

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should return isNew=false when user already exists', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.register('U123');

      expect(result.isNew).toBe(false);
      expect(result.user).toEqual(mockUser);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should create and return new user when not exists', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const result = await service.register('U123');

      expect(result.isNew).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith({
        lineUserId: 'U123',
        point: 0,
      });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updatePoint', () => {
    it('should add points and save user', async () => {
      const updatedUser = { ...mockUser, point: 10 };
      repository.increment.mockResolvedValue({ affected: 1 } as never);
      repository.findOne.mockResolvedValue(updatedUser);

      const result = await service.updatePoint('U123', 10);

      expect(result.point).toBe(10);
      expect(repository.increment).toHaveBeenCalledWith(
        { lineUserId: 'U123' },
        'point',
        10,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.increment.mockResolvedValue({ affected: 0 } as never);

      await expect(service.updatePoint('U999', 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
