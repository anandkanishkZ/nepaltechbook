# FileMarket - Digital File Marketplace

A modern digital file marketplace built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 User authentication and authorization
- 📁 File browsing and categorization
- 💳 Payment processing (eSewa, Khalti, IME Pay)
- 👨‍💼 Admin dashboard for file and user management
- 📊 Analytics and reporting
- 🧾 Invoice generation
- 📧 Email notifications
- 🔒 Row-level security with Supabase

## Quick Start

### 1. Clone and Install

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migrations

The project includes pre-built migrations in the `supabase/migrations/` folder:

- `20250607153256_yellow_credit.sql` - Initial schema setup
- `20250609034331_azure_palace.sql` - Enhanced admin features

Apply these migrations in your Supabase dashboard under SQL Editor.

### 4. Start Development Server

```bash
npm run dev
```

## Database Schema

The application uses the following main tables:

- **profiles** - User profiles and admin status
- **categories** - File categories
- **files** - Digital files for sale
- **purchases** - Purchase transactions
- **invoices** - Generated invoices
- **activity_logs** - Audit trail
- **system_settings** - Configuration
- **email_templates** - Email automation

## Admin Access

To create an admin user:

1. Register a new account with email: `admin@filemarket.com`
2. The system will automatically grant admin privileges
3. Access the admin panel at `/admin`

## Demo Accounts

For testing purposes:

- **Admin**: admin@filemarket.com / password
- **User**: user@filemarket.com / password

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── cart/           # Shopping cart components
│   ├── files/          # File-related components
│   ├── layout/         # Layout components
│   └── ui/             # Basic UI components
├── context/            # React context providers
├── data/               # Data services and mock data
├── lib/                # Utility libraries
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.