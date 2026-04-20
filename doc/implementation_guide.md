# Chatbot Flow Builder - Frontend Implementation Guide

This document describes the implementation details of the Chatbot Flow Builder in the LeadBajaar frontend application.

## Overview

The Chatbot Flow Builder is a visual interface for creating interactive WhatsApp chatbot flows. It is built using [React Flow](https://reactflow.dev/) (`@xyflow/react`) to provide a drag-and-drop experience.

## Architecture

### 1. Component Structure
- **`src/components/chatbot/flow-builder.tsx`**: The main container component. It manages the React Flow instance, node/edge state, and the property sidebar.
- **`src/components/reactflow/`**: Custom node components (MessageNode, InputNode, etc.) that define how each node type is rendered on the canvas.
- **`src/services/chatbot.ts`**: The API service layer using the Fetch API to communicate with the backend.

### 2. State Management
The builder uses `useNodesState` and `useEdgesState` hooks from React Flow for real-time updates:
- **`nodes`**: An array of `ChatbotNode` objects containing position, type, and data.
- **`edges`**: An array of `ChatbotEdge` objects representing the connections between nodes.
- **`selectedNode`**: Tracked via `selectedNodeId` and derived using `useMemo` for performance.

### 3. Node Types
The builder supports several specialized node types defined in `nodeTypes`:
- `flow`: The starting point of a conversation.
- `message`: Standard text or WhatsApp template messages.
- `input`: Captures data from the user.
- `condition`: Logical branching based on user response.
- `api`: Triggers an external API call.
- `function`: Executes custom code (predefined or custom).

### 4. Data Persistence
Flows are saved as JSON objects. The `chatbotService.saveFlow` payload includes:
- `name`, `description`, `trigger`
- `nodes`: Serialized array of React Flow nodes.
- `edges`: Serialized array of React Flow edges.

## Key Implementation Patterns

### Adding Nodes
Nodes are added via the `addNode()` function which calculates the center of the current viewport to place the new node.
```typescript
const addNode = useCallback((type: string) => {
  const { x, y, zoom } = reactFlowInstance.getViewport();
  // ... calculation ...
  const newNode = { id: `${type}-${Date.now()}`, type, position, data };
  setNodes((nds) => [...nds, newNode]);
}, [reactFlowInstance]);
```

### Property Management
The right sidebar (`PropertyPanel`) dynamically updates based on the selected node's `type` and `data`. Changes are synchronized back to the main `nodes` state using `updateNodeData()`.

## Integration with Backend Flow Engine

The flows created in the builder are consumed by the **`WhatsAppWebhookController.php`** on the backend. This controller serves as the engine that executes the graph's logic in real-time.

For additional backend technical details, see the backend's:
- [Backend Implementation Guide](file:///f:/LeadBajar/leadbajar-backend/doc/implementation_guide.md)
- [WhatsAppWebhookController.md](file:///f:/LeadBajar/leadbajar-backend/docs/WhatsAppWebhookController.md)

## WhatsApp Template Integration
The builder fetches available templates from the backend via `integrationApi.getWhatsAppAccounts()`. When a user selects a template, the node's data is updated with the template's components and buttons automatically.
