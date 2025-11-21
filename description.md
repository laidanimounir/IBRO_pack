# Project Summary
The IBRO Kitchen project is an e-commerce application designed to improve the online shopping experience for kitchenware and cooking tools. It provides a seamless user interface for customers to browse products, manage orders, and interact with the platform. The project also features an admin dashboard for efficient product and order management, enhancing operational efficiency for business owners.

# Project Module Description
- **Customer Page**: The main interface for users to view and purchase products.
- **Admin Dashboard**: A secure area for administrators to manage products, orders, and customer interactions.
- **Order Management**: Tools for processing and tracking customer orders, now including options for deleting and printing invoices.
- **Product Management**: Features to add, edit, or remove products from the inventory.
- **UI Components**: A library of reusable user interface components for consistent design.

# Directory Tree
```
shadcn-ui/
├── README.md                   # Project overview and instructions
├── components.json             # Component metadata
├── eslint.config.js            # ESLint configuration
├── index.html                  # Main HTML file
├── package.json                # Project dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── public/                     # Public assets
│   ├── assets/                 # Image assets
│   ├── favicon.svg             # Favicon for the application
│   └── robots.txt              # Robots.txt for SEO
├── src/                        # Source code
│   ├── App.css                 # Main CSS file
│   ├── App.tsx                 # Main application component
│   ├── components/             # React components
│   ├── contexts/               # Context API for state management
│   ├── hooks/                  # Custom hooks
│   ├── pages/                  # Application pages
│   ├── types/                  # Type definitions
│   ├── vite-env.d.ts           # Vite environment types
│   └── vite.config.ts          # Vite configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── template_config.json        # Template configuration
├── todo.md                     # TODO list for future improvements
├── tsconfig.app.json           # TypeScript configuration for app
├── tsconfig.json               # Base TypeScript configuration
└── tsconfig.node.json          # TypeScript configuration for Node
```

# File Description Inventory
- **README.md**: Contains project details and setup instructions.
- **package.json**: Lists dependencies and scripts for building and running the application.
- **src/**: Contains all source code, including components, pages, and styles.
- **public/**: Houses static assets like images and favicon.
- **config files**: Configuration files for various tools (ESLint, PostCSS, Tailwind CSS).

# Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Context API
- **Styling**: CSS Modules and Tailwind CSS

# Usage
1. Install dependencies using the package manager.
2. Build the project using the build script.
3. Run the application locally for development.
