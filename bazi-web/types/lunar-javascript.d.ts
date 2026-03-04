declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    static fromLunar(lunar: Lunar): Solar;
    getLunar(): Lunar;
    getDate(): Date;
  }

  export class Lunar {
    static fromDate(date: Date): Lunar;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getEightChar(): EightChar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getJieQi(): string;
    getJieQiTable(): Record<string, any>;
  }

  export class EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYearShengXiao(): string;
  }
}
