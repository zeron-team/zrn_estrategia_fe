import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [];
const initialEdges = [];

const FlowDiagram = ({ flow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    if (flow) {
      if (flow.nodes && flow.edges) {
        const newNodes = flow.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            label: `${node.id}: ${node.data.label}`
          }
        }));
        setNodes(newNodes);
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

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ height: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default FlowDiagram;