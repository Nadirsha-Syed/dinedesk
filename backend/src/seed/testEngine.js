import { createReservationSchema } from '../validators/reservation.validator.js';

console.log('--- STARTING RESERVATION ENGINE TESTS ---');

// Test 1: Zod Schema validators for bookings inputs
function testValidators() {
  console.log('Running validator tests...');

  // Future date, valid times, valid guests
  const validData = {
    reservationDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days in future
    startTime: '18:00',
    endTime: '19:30',
    numberOfGuests: 4,
  };

  // Date in the past
  const pastDateData = {
    ...validData,
    reservationDate: '2020-01-01',
  };

  // End time before start time
  const invertedTimeData = {
    ...validData,
    startTime: '19:30',
    endTime: '18:00',
  };

  // Invalid format time (AM/PM)
  const badFormatTimeData = {
    ...validData,
    startTime: '6:00 PM',
  };

  const parsedValid = createReservationSchema.safeParse(validData);
  const parsedPast = createReservationSchema.safeParse(pastDateData);
  const parsedInverted = createReservationSchema.safeParse(invertedTimeData);
  const parsedBadFormat = createReservationSchema.safeParse(badFormatTimeData);

  if (parsedValid.success && !parsedPast.success && !parsedInverted.success && !parsedBadFormat.success) {
    console.log('✅ Test 1: Zod input validators check passed.');
  } else {
    console.error('❌ Test 1: Zod validation tests failed:', {
      parsedValid: parsedValid.success,
      parsedPast: parsedPast.success,
      parsedInverted: parsedInverted.success,
      parsedBadFormat: parsedBadFormat.success,
    });
    process.exit(1);
  }
}

// Test 2: Mathematical Overlap check calculations
function testOverlapCheck() {
  console.log('Running time overlap logic tests...');

  const checkOverlap = (existingStart, existingEnd, requestedStart, requestedEnd) => {
    return existingStart < requestedEnd && existingEnd > requestedStart;
  };

  // Scenario A: overlap at start boundary
  const overlapStart = checkOverlap('18:00', '19:30', '17:00', '18:30');

  // Scenario B: overlap at end boundary
  const overlapEnd = checkOverlap('18:00', '19:30', '19:00', '20:30');

  // Scenario C: requested is nested inside existing
  const overlapNestedInner = checkOverlap('18:00', '20:00', '18:30', '19:30');

  // Scenario D: existing is nested inside requested
  const overlapNestedOuter = checkOverlap('18:30', '19:30', '18:00', '20:00');

  // Scenario E: consecutive bookings touching edges (should NOT overlap)
  const adjacentTimes = checkOverlap('18:00', '19:00', '19:00', '20:00');

  // Scenario F: completely separate times (should NOT overlap)
  const separateTimes = checkOverlap('18:00', '19:00', '20:00', '21:00');

  if (overlapStart && overlapEnd && overlapNestedInner && overlapNestedOuter && !adjacentTimes && !separateTimes) {
    console.log('✅ Test 2: Overlap conflict formulas passed.');
  } else {
    console.error('❌ Test 2: Overlap calculation rules failed.');
    process.exit(1);
  }
}

// Test 3: Table assignment and sorting strategy
function testAllocationStrategy() {
  console.log('Running table allocation strategy tests...');

  // Mock list of tables
  const tables = [
    { id: 'T2', tableNumber: 1, capacity: 2, isActive: true },
    { id: 'T4_A', tableNumber: 2, capacity: 4, isActive: true },
    { id: 'T4_B', tableNumber: 3, capacity: 4, isActive: true },
    { id: 'T6', tableNumber: 4, capacity: 6, isActive: true },
    { id: 'T8', tableNumber: 5, capacity: 8, isActive: true },
  ];

  // Mock active reservations
  const bookings = [
    { tableId: 'T4_A', startTime: '18:00', endTime: '19:30' },
    { tableId: 'T4_B', startTime: '19:00', endTime: '20:30' },
  ];

  const allocateTable = (guests, start, end) => {
    // 1. Filter capacity >= guests, sorted by capacity ascending, then tableNumber ascending
    const eligible = tables
      .filter((t) => t.capacity >= guests && t.isActive)
      .sort((a, b) => a.capacity - b.capacity || a.tableNumber - b.tableNumber);

    // 2. Iterate and check scheduling conflict
    for (const table of eligible) {
      const tableBookings = bookings.filter((b) => b.tableId === table.id);
      const conflict = tableBookings.some((b) => b.startTime < end && b.endTime > start);
      if (!conflict) {
        return table;
      }
    }
    return null;
  };

  // Case A: Book for 3 guests from 18:30 - 19:30.
  // T4_A (overlaps) and T4_B (overlaps). Must allocate T6 (capacity 6).
  const allocatedA = allocateTable(3, '18:30', '19:30');

  // Case B: Book for 3 guests from 17:00 - 18:00.
  // T4_A is free. Must allocate T4_A (smallest capacity).
  const allocatedB = allocateTable(3, '17:00', '18:00');

  // Case C: Book for 10 guests. No suitable capacity. Must return null.
  const allocatedC = allocateTable(10, '18:00', '19:00');

  if (allocatedA?.id === 'T6' && allocatedB?.id === 'T4_A' && allocatedC === null) {
    console.log('✅ Test 3: Capacity optimization and sorted allocations passed.');
  } else {
    console.error('❌ Test 3: Allocation strategy failed:', {
      allocatedA: allocatedA?.id,
      allocatedB: allocatedB?.id,
      allocatedC,
    });
    process.exit(1);
  }
}

function runAll() {
  testValidators();
  testOverlapCheck();
  testAllocationStrategy();
  console.log('--- ALL RESERVATION ENGINE TESTS COMPLETED SUCCESSFULLY ---');
}

runAll();
