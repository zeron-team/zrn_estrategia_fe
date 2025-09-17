import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Grid,
  Divider,
} from '@mui/material';
import { AddCircle, Delete } from '@mui/icons-material';

const FlowForm = ({ flow, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', description: '', steps: [] });

  useEffect(() => {
    if (flow) {
      setFormData(flow);
    } else {
      setFormData({ name: '', description: '', steps: [] });
    }
  }, [flow]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepChange = (stepIndex, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleOptionChange = (stepIndex, optionIndex, field, value) => {
    const newSteps = [...formData.steps];
    const newOptions = [...newSteps[stepIndex].options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
    newSteps[stepIndex] = { ...newSteps[stepIndex], options: newOptions };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    const newStep = {
      step_id: formData.steps.length > 0 ? Math.max(...formData.steps.map(s => s.step_id)) + 1 : 1,
      message: '',
      options: [],
    };
    setFormData((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const deleteStep = (stepIndex) => {
    const newSteps = formData.steps.filter((_, index) => index !== stepIndex);
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const addOption = (stepIndex) => {
    const newOptions = [...formData.steps[stepIndex].options, { option: '', label: '', next_step_id: '' }];
    const newSteps = [...formData.steps];
    newSteps[stepIndex] = { ...newSteps[stepIndex], options: newOptions };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const deleteOption = (stepIndex, optionIndex) => {
    const newOptions = formData.steps[stepIndex].options.filter((_, index) => index !== optionIndex);
    const newSteps = [...formData.steps];
    newSteps[stepIndex] = { ...newSteps[stepIndex], options: newOptions };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Box component="form" sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Flow Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        margin="normal"
      />

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Steps</Typography>
      <Button startIcon={<AddCircle />} onClick={addStep} sx={{ mb: 2 }}>
        Add Step
      </Button>

      {formData.steps.map((step, stepIndex) => (
        <Card key={step.step_id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">Step {step.step_id}</Typography>
              <IconButton onClick={() => deleteStep(stepIndex)}><Delete /></IconButton>
            </Box>
            <TextField
              fullWidth
              label="Message"
              value={step.message}
              onChange={(e) => handleStepChange(stepIndex, 'message', e.target.value)}
              margin="normal"
              multiline
            />

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Options</Typography>
            <Button startIcon={<AddCircle />} onClick={() => addOption(stepIndex)} size="small">
              Add Option
            </Button>
            {step.options.map((option, optionIndex) => (
              <Grid container spacing={2} key={optionIndex} sx={{ mt: 1, alignItems: 'center' }}>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Option"
                    value={option.option}
                    onChange={(e) => handleOptionChange(stepIndex, optionIndex, 'option', e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Label"
                    value={option.label}
                    onChange={(e) => handleOptionChange(stepIndex, optionIndex, 'label', e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Next Step ID"
                    value={option.next_step_id}
                    onChange={(e) => handleOptionChange(stepIndex, optionIndex, 'next_step_id', e.target.value)}
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton onClick={() => deleteOption(stepIndex, optionIndex)}><Delete /></IconButton>
                </Grid>
              </Grid>
            ))}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave}>Save Flow</Button>
        <Button onClick={onCancel} sx={{ ml: 1 }}>Cancel</Button>
      </Box>
    </Box>
  );
};

export default FlowForm;