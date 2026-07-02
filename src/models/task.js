export default [
  { id: 1, caseId: 1, title: 'Draft Complaint', assignedTo: 'Alice', dueDate: '2025-09-18', status: 'Open', priority: 'High', description: 'Draft initial complaint for Case A.' },
  { id: 2, caseId: 1, title: 'Prepare Evidence', assignedTo: 'Bob', dueDate: '2025-09-19', status: 'In Progress', priority: 'Medium', description: 'Collect and organize evidence.' },
  { id: 3, caseId: 2, title: 'Send Reminder', assignedTo: 'Charlie', dueDate: '2025-09-21', status: 'Completed', priority: 'Low', description: 'Send reminder to client.' }
];
