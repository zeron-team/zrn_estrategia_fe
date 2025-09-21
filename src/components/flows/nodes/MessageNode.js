import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Paper, TextField, Typography, Chip } from '@mui/material';

const MessageNode = ({ data, id, selected }) => {
  const variables = [
    '{student_name}',
    '{course_name}',
    '{student_id}',
    '{current_date}',
  ];

  const handleMessageChange = (event) => {
    console.log('handleMessageChange called', event.target.value);
    if (data.onChange) {
      data.onChange(id, { label: event.target.value });
    }
  };

  const insertVariable = (variable) => {
    const newLabel = (data.label || '') + variable;
    if (data.onChange) {
      data.onChange(id, { label: newLabel });
    }
  };

  return (
    <Paper sx={{ p: 2, border: selected ? '2px solid #1976d2' : '1px solid #ddd', borderRadius: 2, width: 300 }}>
      <Handle type="target" position={Position.Top} />
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Message</Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={data.label || ''}
          onChange={handleMessageChange}
          placeholder="Type your message here..."
        />
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Typography variant="caption" sx={{ width: '100%' }}>Variables:</Typography>
          {variables.map((variable) => (
            <Chip
              key={variable}
              label={variable}
              onClick={() => insertVariable(variable)}
              size="small"
            />
          ))}
        </Box>
      </Box>
      <Handle type="source" position={Position.Bottom} />
    </Paper>
  );
};

export default memo(MessageNode);
