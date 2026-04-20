# Chatbot Flow Builder - User Guide

A step-by-step guide on how to build, test, and deploy interactive chatbot flows for WhatsApp.

## 1. Creating Your First Flow

### Step 1: Initialize the Flow
1. Navigate to the **Chatbot** section in your dashboard.
2. Click on **Create New Flow**.
3. Give your flow a **Name** (e.g., "Welcome Message") and a **Description**.
4. Set the **Trigger**. This is the keyword or event that will start the chatbot. (e.g., "Hi" or "Start").

### Step 2: Designing the Workflow
The builder uses a drag-and-drop interface. To add elements:
1. Click any of the **Add Node** buttons in the right sidebar (Flow, Message, Input, etc.).
2. A new node will appear on the canvas.
3. Use the plus icons on the edges of the nodes to connect them to other nodes. This defines the conversation path.

### Step 3: Configuring Nodes
Click on any node to edit its properties in the right sidebar:
- **Message Node**: Define what the bot says. You can choose:
  - **Text Message**: Standard text reply.
  - **WhatsApp Template**: A pre-approved Meta template.
  - **CTA URL Button**: A message with a button that links to a URL.
- **Input Node**: Ask the user for specific information (e.g., Name, Email, Phone).
- **Condition Node**: Branch the conversation based on user input.
- **Function Node**: Attach a script (like `save_name`) to automate actions.

## 2. Connecting the Dots
Connect the **Source** (dots on the right/bottom) of one node to the **Target** (dots on the left/top) of another to create a sequence.
- **Button Connections**: If a message has buttons, each button will have its own connection point. Connect these to different paths to handle user choices.

## 3. Saving & Testing
1. Click **Save Flow** to synchronize your design with the backend.
2. The flow is immediately active if the trigger is matched in an incoming WhatsApp message.
3. Test your flow by sending the trigger keyword to your connected WhatsApp business number.

## 4. Best Practices
- **Start Small**: Build a simple welcome flow before adding complex logic.
- **User Validation**: Use **Input Nodes** with validation to ensure you're collecting correct data.
- **Clear CTA**: Always give users clear options (Buttons/Quick Replies) to navigate the flow easily.
- **Fallback**: Always have a way for users to reach a human agent if the bot cannot help.

## 5. Troubleshooting
- If your flow isn't triggering, check if the **WhatsApp Integration** is active in the Integrations settings.
- Ensure the **Trigger** matches exactly what the user is sending (unless using "Regex" or "AI Intent" triggers).
- Check the **Error Logs** in the admin dashboard for any backend execution failures.
