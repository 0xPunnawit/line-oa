import { AppConfig } from '../constants/app-config.constant';

export class PointsCalculatorUtil {
  static calculateFromAmount(amount: number): number {
    const roundedAmount = Math.round(amount * 100) / 100;
    return Math.floor(roundedAmount / AppConfig.POINTS_PER_BAHT);
  }
}
