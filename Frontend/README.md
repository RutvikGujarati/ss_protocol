# SS Protocol Setup Plan

This document outlines the plan to set up the frontend and smart contracts for the SS Protocol project.

## Prerequisites

- Install Node.js and npm for frontend development.
- Install Git for cloning the repository.
- Install Foundry for smart contract development (ensure `forge` is available).
- Use a code editor (e.g., VS Code) to manage environment variables.
- Obtain API keys and configuration details for Auth, Reown, and Pinata.

## Frontend Setup Plan

### Clone the Repository

Clone the SS Protocol repository from GitHub:

```bash
git clone https://github.com/RutvikGujarati/ss_protocol.git
```

### Navigate to the Project Directory

Move into the cloned `ss_protocol\Frontend` directory:

```bash
cd ss_protocol\Frontend
```

### Install Dependencies

Install the required npm packages for the frontend:

```bash
npm i
```

### Configure Environment Variables

Create a `.env` file in the `Frontend` directory and add the following environment variables:

```env
VITE_AUTH_ADDRESS=""
VITE_REOWN_PROJECT_ID=""
VITE_PINATA_API_KEY=""
VITE_PINATA_SECRET_API_KEY=""
VITE_PINATA_GATEWAY="https://gold-favourable-bonobo-219.mypinata.cloud/ipfs/"
```

Fill in the empty strings with the appropriate API keys and configuration values.

### Run the Development Server

Start the frontend development server:

```bash
npm run dev
```

Access the application at the provided local URL (typically `http://localhost:5173`).

## Smart Contracts Setup Plan

### Navigate to the Contracts Directory

Move to the `state-contracts` directory from the project root:

```bash
cd ..
cd state-contracts
```

### Install Foundry Dependencies

Install the necessary dependencies for smart contracts using Foundry:

```bash
forge install
```

## Notes

- Verify that all environment variables are correctly configured in the `.env` file before starting the frontend server.
- Ensure Foundry is properly installed and configured for smart contract development.
- Refer to the official documentation for Node.js, Foundry, or the SS Protocol repository for troubleshooting.
