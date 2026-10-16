import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Receipt } from './entities/receipt.entity';
import { DuplicateReceiptError } from './errors/receipt.error';
import { User } from '../users/entities/user.entity';

export interface CreateReceiptDto {
  userId: number;
  seller: string | null;
  receiptDate: string;
  receiptNo: string;
  amount: number;
}

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateReceiptDto): Promise<Receipt> {
    await this.checkDuplicate(dto);

    const receipt = this.receiptRepository.create({
      userId: dto.userId,
      seller: dto.seller,
      receiptDate: dto.receiptDate,
      receiptNo: dto.receiptNo,
      amount: dto.amount,
    });
    return this.receiptRepository.save(receipt);
  }

  async createWithPoints(
    dto: CreateReceiptDto,
    points: number,
  ): Promise<Receipt> {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Receipt, {
        where: this.buildWhereClause(dto),
      });

      if (existing) {
        throw new DuplicateReceiptError();
      }

      const receipt = manager.create(Receipt, {
        userId: dto.userId,
        seller: dto.seller,
        receiptDate: dto.receiptDate,
        receiptNo: dto.receiptNo,
        amount: dto.amount,
      });
      const savedReceipt = await manager.save(receipt);

      const result = await manager.increment(
        User,
        { userId: dto.userId },
        'point',
        points,
      );

      if (result.affected === 0) {
        this.logger.error(`Failed to update points for user ${dto.userId}`);
        throw new Error('Failed to update user points');
      }

      return savedReceipt;
    });
  }

  async findByUserId(userId: number): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  private async checkDuplicate(dto: CreateReceiptDto): Promise<void> {
    const existing = await this.receiptRepository.findOne({
      where: this.buildWhereClause(dto),
    });

    if (existing) {
      throw new DuplicateReceiptError();
    }
  }

  private buildWhereClause(dto: CreateReceiptDto): Record<string, unknown> {
    const where: Record<string, unknown> = {
      receiptDate: dto.receiptDate,
      receiptNo: dto.receiptNo,
    };

    if (dto.seller) {
      where.seller = dto.seller;
    }

    return where;
  }
}
