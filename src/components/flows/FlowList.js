import React from 'react';
import { List, ListItem, ListItemText, IconButton, Chip } from '@mui/material';
import { Edit, Delete, AccountTree, CheckCircle } from '@mui/icons-material';

const FlowList = ({ flows, onEdit, onDelete, onViewDiagram, onSetActive }) => {
  return (
    <List>
      {flows.map((flow) => (
        <ListItem key={flow.id} secondaryAction={
          <>
            {flow.is_active && <Chip icon={<CheckCircle />} label="Activo" color="success" sx={{ mr: 2 }} />}
            <IconButton edge="end" aria-label="set-active" onClick={() => onSetActive(flow.id)}>
              <CheckCircle color={flow.is_active ? "success" : "disabled"} />
            </IconButton>
            <IconButton edge="end" aria-label="diagram" onClick={() => onViewDiagram(flow)}>
              <AccountTree />
            </IconButton>
            <IconButton edge="end" aria-label="edit" onClick={() => onEdit(flow)}>
              <Edit />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={() => onDelete(flow.id)}>
              <Delete />
            </IconButton>
          </>
        }>
          <ListItemText primary={flow.name} secondary={flow.description} />
        </ListItem>
      ))}
    </List>
  );
};

export default FlowList;