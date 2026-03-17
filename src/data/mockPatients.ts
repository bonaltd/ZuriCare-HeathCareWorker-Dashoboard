export const mockPatients = [
  { id: 'ZC-20240315-ABC123', name: 'John Mwangi', phone: '+254 712 345 678', lastAccess: '2024-03-14', registered: '2024-03-10' },
  { id: 'ZC-20240314-XYZ789', name: 'Sarah Kamau', phone: '+254 723 456 789', lastAccess: '2024-03-13', registered: '2024-03-08' },
  { id: 'ZC-20240313-DEF456', name: 'David Ochieng', phone: '+254 734 567 890', lastAccess: '2024-03-12', registered: '2024-03-05' },
  { id: 'ZC-20240312-GHI321', name: 'Mary Wanjiku', phone: '+254 745 678 901', lastAccess: '—', registered: '2024-03-01' },
  { id: 'ZC-20240311-JKL654', name: 'James Otieno', phone: '+254 756 789 012', lastAccess: '2024-03-10', registered: '2024-02-28' },
  { id: 'ZC-DEMO-NKOSBONA', name: 'Demo Patient', phone: '+254 700 000 000', lastAccess: '—', registered: '2024-03-01' },
];

export function findPatientById(id: string) {
  const normalized = id.trim().toUpperCase();
  return mockPatients.find((p) => p.id.toUpperCase() === normalized);
}
