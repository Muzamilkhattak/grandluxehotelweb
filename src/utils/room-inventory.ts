export function getRoomTotalCount(room: any): number {
  if (typeof room?.total_rooms === 'number' && room.total_rooms > 0) {
    return room.total_rooms;
  }
  if (typeof room?.quantity === 'number' && room.quantity > 0) {
    return room.quantity;
  }
  if (Array.isArray(room?.amenities)) {
    const tag = room.amenities.find((a: string) => typeof a === 'string' && a.startsWith('total_rooms:'));
    if (tag) {
      const count = parseInt(tag.split(':')[1], 10);
      if (!isNaN(count) && count > 0) return count;
    }
  }
  return 1;
}
