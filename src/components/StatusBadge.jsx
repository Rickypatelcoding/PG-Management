const statuses = { paid: ['bg-[#dcfce7] text-[#15803d]', 'Paid'], pending: ['bg-[#fff4c5] text-[#7c360b]', 'Pending'], overdue: ['bg-[#fee2e2] text-[#b91c1c]', 'Overdue'], active: ['bg-[#f5f5f5] text-[#434343]', 'Active'], vacated: ['bg-[#e6e6e6] text-[#575757]', 'Vacated'], vacant: ['bg-[#dcfce7] text-[#15803d]', 'Vacant'], occupied: ['bg-[#fee2e2] text-[#b91c1c]', 'Occupied'], maintenance: ['bg-[#fef3c7] text-[#b45309]', 'Maintenance'], verified: ['bg-[#dcfce7] text-[#15803d]', 'Verified'], pendingDoc: ['bg-[#dbeafe] text-[#1d4ed8]', 'Pending review'] }

export default function StatusBadge({ status }) {
  const [style, label] = statuses[status] || statuses.active
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>
}
