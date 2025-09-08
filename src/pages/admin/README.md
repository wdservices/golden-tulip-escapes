# Admin Dashboard

This is the admin dashboard for the Golden Tulip Escapes hotel management system. It provides a comprehensive interface for managing all aspects of the hotel's operations.

## Features

### Dashboard
- Overview of key metrics and statistics
- Quick access to recent activities and notifications

### Bookings Management
- View and manage all hotel bookings
- Check-in/check-out management
- Booking modifications and cancellations

### Rooms & Facilities
- Manage room inventory and availability
- Room type configurations
- Facility management

### Clients (Guests)
- Guest information management
- Guest history and preferences
- Loyalty program management

### Marketing
- Promotions and special offers
- Email campaigns
- Guest communications

### Payments
- Payment processing
- Invoicing
- Financial reporting

### Reports
- Occupancy reports
- Revenue analysis
- Performance metrics

### Branches
- Multi-location management
- Branch-specific settings
- Performance comparison

### Settings
- System configuration
- User management
- Role-based access control

## Getting Started

### Prerequisites
- Node.js 16.x or later
- npm or yarn package manager
- Access to the backend API

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```
VITE_API_BASE_URL=your_api_base_url
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASSWORD=your_secure_password
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Testing

To run tests:

```bash
npm test
```

## Deployment

For production deployment, build the application and serve the static files using a web server like Nginx or Apache.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
