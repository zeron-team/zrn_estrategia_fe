import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper, Typography, Divider, Button, TextField } from '@mui/material';
import MessageNode from './nodes/MessageNode';

const nodeTypes = { messageNode: MessageNode };

const Sidebar = () => {
  const onDragStart = (event, nodeType, data) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, data }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeTypesForSidebar = [
    { name: 'Mensaje', type: 'messageNode', data: { label: '' } },
  ];

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6">Tipos de Nodo</Typography>
      <Divider sx={{ my: 1 }} />
      {nodeTypesForSidebar.map((node) => (
        <Box
          key={node.name}
          onDragStart={(event) => onDragStart(event, node.type, node.data)}
          draggable
          sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1, mb: 1, cursor: 'grab' }}
        >
          {node.name}
        </Box>
      ))}
    </Paper>
  );
};

const FlowEditor = ({ flow, onSave, onCancel }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (flow) {
      setName(flow.name || '');
      if (flow.nodes && flow.edges) {
        setNodes(flow.nodes);
        setEdges(flow.edges);
      } else if (flow.steps) {
        const newNodes = flow.steps.map((step, index) => ({
          id: `${step.step_id}`,
          data: { label: `${step.step_id}: ${step.message}` },
          position: { x: index * 250, y: 100 },
        }));

        const newEdges = [];
        flow.steps.forEach(step => {
          if (step.options) {
            step.options.forEach(option => {
              if (option.next_step_id) {
                newEdges.push({
                  id: `e${step.step_id}-${option.next_step_id}`,
                  source: `${step.step_id}`,
                  target: `${option.next_step_id}`,
                  labelText: option.label,
                  animated: true,
                });
              }
            });
          }
        });

        setNodes(newNodes);
        setEdges(newEdges);
      }
    }
  }, [flow, setNodes, setEdges]);

  const onNodeDataChange = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowInstance.project({ x: event.clientX, y: event.clientY });
      const { nodeType, data } = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      const newNode = {
        id: `msj-${+new Date()}`,
        type: nodeType,
        position: reactFlowBounds,
        data: { ...data, onChange: onNodeDataChange },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDataChange],
  );

  const nodesWithOnChange = useMemo(() => {
      return nodes.map(node => ({
          ...node,
          data: {
              ...node.data,
              onChange: onNodeDataChange
          }
      }));
  }, [nodes, onNodeDataChange]);

  const handleSave = () => {
    const flowData = {
      name,
      nodes: reactFlowInstance.getNodes(),
      edges: reactFlowInstance.getEdges(),
    };
    onSave(flowData);
  };

  return (
    <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      <TextField
        label="Nombre del Flujo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Box sx={{ width: '20%', p: 1 }}>
          <Sidebar />
        </Box>
        <Box sx={{ width: '80%', height: '100%' }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodesWithOnChange}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        </Box>
      </Box>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} sx={{ mr: 2 }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
      </Box>
    </Box>
  );
};

export default FlowEditor;
