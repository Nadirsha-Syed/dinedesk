console.log('--- STARTING ADMIN DASHBOARD & OVERRIDES TESTS ---');

// Test 1: Occupancy Percentage calculations
function testOccupancyCalculation() {
  console.log('Running occupancy percentage logic tests...');

  const totalTablesCount = 15;
  const uniqueBookedTablesToday = ['T1', 'T2', 'T3'];

  const calculateOccupancy = (bookedList, totalCount) => {
    return totalCount > 0 ? (bookedList.length / totalCount) * 100 : 0;
  };

  const rate = calculateOccupancy(uniqueBookedTablesToday, totalTablesCount);

  if (rate === 20) {
    console.log('✅ Test 1: Occupancy percentage logic passed.');
  } else {
    console.error('❌ Test 1: Occupancy percentage logic failed:', rate);
    process.exit(1);
  }
}

// Test 2: Search keywords mapping across customers
function testSearchCrossReference() {
  console.log('Running customer search mapping tests...');

  const usersList = [
    { id: 'u1', name: 'John Doe', email: 'john@dinedesk.com' },
    { id: 'u2', name: 'Jane Smith', email: 'jane@dinedesk.com' },
    { id: 'u3', name: 'Robert Johnson', email: 'robert@gmail.com' },
  ];

  const searchUsers = (keyword) => {
    const matched = usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(keyword.toLowerCase()) ||
        u.email.toLowerCase().includes(keyword.toLowerCase())
    );
    return matched.map((m) => m.id);
  };

  const johnResult = searchUsers('john'); // matches John Doe (u1) and Robert Johnson (u3)
  const janeResult = searchUsers('jane@dinedesk.com'); // matches u2

  if (johnResult.includes('u1') && johnResult.includes('u3') && johnResult.length === 2 && janeResult[0] === 'u2') {
    console.log('✅ Test 2: Cross-collection user ID query mapping passed.');
  } else {
    console.error('❌ Test 2: Search mapping failed:', { johnResult, janeResult });
    process.exit(1);
  }
}

// Test 3: Admin override scheduling overlap checks
function testAdminOverrideConflictCheck() {
  console.log('Running admin override overlap collision tests...');

  const reservationsList = [
    { id: 'R1', table: 'T2', startTime: '18:00', endTime: '19:30', status: 'CONFIRMED' },
    { id: 'R2', table: 'T2', startTime: '19:00', endTime: '20:30', status: 'CONFIRMED' },
  ];

  const verifyOverride = (id, targetTable, targetStart, targetEnd) => {
    const otherBookings = reservationsList.filter(
      (r) => r.id !== id && r.table === targetTable && r.status === 'CONFIRMED'
    );
    const conflict = otherBookings.some((b) => b.startTime < targetEnd && b.endTime > targetStart);
    return !conflict; // return true if safe (no conflict)
  };

  const checkOverlapConflict = verifyOverride('R2', 'T2', '17:30', '18:30'); // overlaps with R1 (should return false)
  const checkSafeUpdate = verifyOverride('R2', 'T2', '19:30', '20:30'); // consecutive with R1 (should return true)

  if (!checkOverlapConflict && checkSafeUpdate) {
    console.log('✅ Test 3: Admin override conflict validation passed.');
  } else {
    console.error('❌ Test 3: Override conflict check failed:', { checkOverlapConflict, checkSafeUpdate });
    process.exit(1);
  }
}

function runAll() {
  testOccupancyCalculation();
  testSearchCrossReference();
  testAdminOverrideConflictCheck();
  console.log('--- ALL ADMIN DASHBOARD & OVERRIDES TESTS COMPLETED SUCCESSFULLY ---');
}

runAll();
