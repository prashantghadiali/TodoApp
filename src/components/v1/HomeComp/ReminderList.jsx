import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { deleteReminder, updateReminder } from './actions/reminders';
import UpdateReminder from './UpdateReminder';
import AddReminder from './AddReminder';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
} from '@mui/material';
import ConfirmationDialog from './ConfirmationDialog';
import { toast } from 'react-toastify';

const ReminderList = ({ reminders, deleteReminder, updateReminder }) => {
  const [selectedReminderIds, setSelectedReminderIds] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [confirmationId, setConfirmationId] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false); // New state for delete confirmation dialog

  const handleDeleteConfirmation = (id) => {
    setConfirmationId(id);
  };

  const handleDelete = () => {
    if (confirmationId !== null) {
      toast.success('Reminder deleted successfully!');
      deleteReminder(confirmationId);
      setConfirmationId(null);
    }
  };

  const handleSelectReminder = (id) => {
    if (selectedReminderIds.includes(id)) {
      setSelectedReminderIds(selectedReminderIds.filter((item) => item !== id));
    } else {
      setSelectedReminderIds([...selectedReminderIds, id]);
    }
  };

  const handleSelectAll = () => {
    const allIds = reminders.map((reminder) => reminder.id);
    setSelectedReminderIds(allIds);
  };

  const handleDeleteSelected = () => {
    setDeleteConfirmationOpen(true); // Open delete confirmation dialog
  };

  const handleDeleteConfirmed = () => {
    toast.success('Selected reminders deleted successfully!');
    selectedReminderIds.forEach((id) => deleteReminder(id));
    setSelectedReminderIds([]);
    setDeleteConfirmationOpen(false); // Close delete confirmation dialog
  };

  const handleDeleteCancelled = () => {
    setDeleteConfirmationOpen(false); // Close delete confirmation dialog
  };

  useEffect(() => {
    // Check for reminders at regular intervals and show notifications
    const intervalId = setInterval(() => {
      checkReminders();
    }, 60000); // Check every minute

    // Cleanup the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  const checkReminders = () => {
    const currentTime = new Date();

    reminders.forEach((reminder) => {
      const reminderTime = new Date(reminder.time);

      if (currentTime >= reminderTime) {
        // Trigger notification for overdue reminders
        toast.info(`Reminder: ${reminder.text} start!`);
      }
    });
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedReminders = reminders.slice().sort((a, b) => {
    const compareValueA = a[sortBy];
    const compareValueB = b[sortBy];
    if (compareValueA < compareValueB) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (compareValueA > compareValueB) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <>
      <div style={{ margin: 10, float: 'right' }}>
        <AddReminder />
      </div>
      <div style={{ margin: 10 }}>
        <Button
          onClick={handleDeleteSelected}
          disabled={selectedReminderIds.length === 0}
          variant="contained"
          color="error" // Set button color to red for danger
        >
          Delete Selected
        </Button>
        <Button onClick={handleSelectAll} variant="contained" color="primary">Select All</Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('text')}>
                Activity {sortBy === 'text' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell onClick={() => handleSort('time')}>
                Time {sortBy === 'time' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedReminders.map((reminder) => (
              <TableRow key={reminder.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedReminderIds.includes(reminder.id)}
                    onChange={() => handleSelectReminder(reminder.id)}
                  />
                  {reminder.text}
                </TableCell>
                <TableCell>{reminder.time}</TableCell>
                <TableCell>
                  <Button onClick={() => handleDeleteConfirmation(reminder.id)}>Delete</Button>
                  <Button onClick={() => setSelectedReminder(reminder)}>Update</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedReminder && (
          <UpdateReminder reminder={selectedReminder} onClose={() => setSelectedReminder(null)} />
        )}

        <ConfirmationDialog
          open={confirmationId !== null}
          onClose={() => setConfirmationId(null)}
          onConfirm={() => handleDelete(confirmationId)}
        />

        <ConfirmationDialog // Confirmation dialog for deleting selected reminders
          open={deleteConfirmationOpen}
          onClose={handleDeleteCancelled}
          onConfirm={handleDeleteConfirmed}
          title="Delete Reminders"
          message="Are you sure you want to delete all selected reminders?"
        />
      </TableContainer>
    </>
  );
};

const mapStateToProps = (state) => ({
  reminders: state.reminders.reminders,
});

export default connect(mapStateToProps, { deleteReminder, updateReminder })(ReminderList);
