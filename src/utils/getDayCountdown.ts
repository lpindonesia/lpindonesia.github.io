function getDayCountdown(ISODate: string): number {
  const targetDate = new Date(ISODate)
  const today = new Date()
  const timeDiff = targetDate.getTime() - today.getTime()
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

  return daysRemaining
}

export default getDayCountdown
