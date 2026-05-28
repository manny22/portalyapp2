export class DateRange {
  readonly startDate: Date
  readonly endDate: Date

  private constructor(startDate: Date, endDate: Date) {
    this.startDate = startDate
    this.endDate = endDate
  }

  static validateRange(startDate: Date | null | undefined, endDate: Date | null | undefined): string | null {
    if (!startDate) return 'La fecha de inicio es requerida'
    if (!endDate) return 'La fecha de fin es requerida'
    if (endDate <= startDate) return 'La fecha de fin debe ser posterior a la fecha de inicio'
    return null
  }

  static create(startDate: Date, endDate: Date): DateRange {
    if (endDate <= startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
    }
    return new DateRange(startDate, endDate)
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate
  }

  isExpired(): boolean {
    return new Date() > this.endDate
  }

  isActive(): boolean {
    const now = new Date()
    return now >= this.startDate && now <= this.endDate
  }

  equals(other: DateRange): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    )
  }
}
