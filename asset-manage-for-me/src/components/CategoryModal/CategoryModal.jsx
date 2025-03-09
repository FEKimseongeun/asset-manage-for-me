import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function CategoryModal({
  open,
  handleClose,
  categoryName,
  items,
  handleDelete,
}) {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>{categoryName} - 항목 관리</DialogTitle>
      <DialogContent>
        <List>
          {items.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={
                <IconButton
                  edge='end'
                  onClick={() => handleDelete(item.id, item.source)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={item.title}
                secondary={`${item.amount.toLocaleString()} 원`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryModal;
