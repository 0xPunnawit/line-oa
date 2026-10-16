export class CreateDonationDto {
  userId: number;
  lineUserId: string;
  points: number;

  constructor(userId: number, lineUserId: string, points: number) {
    this.userId = userId;
    this.lineUserId = lineUserId;
    this.points = points;
  }
}
