// Never expose login credentials through the public staff listing.
export function serializeStaff(s) {
  const { password, ...safe } = s;
  return { ...safe, dutyLabel: s.onDuty ? 'На смене' : 'Не на смене' };
}
