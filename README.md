# Sunday - Work OS

A modern, feature-rich project management application inspired by Monday.com, built with NestJS and React.

## 🚀 Features

- **📋 Board Management**: Create and manage multiple boards
- **📊 Customizable Columns**: Status, Date, Priority, Timeline, and more
- **🎯 Drag & Drop**: Reorder items and groups seamlessly
- **⚡ Automations**: Auto-move items based on status changes
- **🎨 Modern UI**: Beautiful, responsive interface
- **🔄 Real-time Updates**: Instant synchronization

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript
- **PostgreSQL** - Robust relational database
- **Docker** - Containerization

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching
- **DnD Kit** - Drag and drop
- **Axios** - HTTP client

## 📦 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Run with Docker

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sunday.git
cd sunday

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend: http://localhost:3000
```

### Local Development

```bash
# Backend
cd sunday
npm install
npm run start:dev

# Frontend (in another terminal)
cd client
npm install
npm run dev
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- --testPathPattern=automations
```

**Test Coverage**: 26/31 tests passing (84%)
- AutomationsService: 100%
- CellsService: 100%
- BoardsService: 100%

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Test Coverage](./TEST_COVERAGE.md)
- [Build Summary](./BUILD_AND_TEST_SUMMARY.md)

## 🔧 Environment Variables

### Backend
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=sunday
DB_PASSWORD=sunday123
DB_DATABASE=sunday_db
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Frontend
```env
VITE_API_URL=/api
```

## 🏗️ Project Structure

```
sunday/
├── src/                    # Backend source
│   ├── automations/       # Automation system
│   ├── boards/            # Board management
│   ├── cells/             # Cell values
│   ├── groups/            # Group management
│   ├── items/             # Item management
│   └── entities/          # Database entities
├── client/                # Frontend source
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── api/          # API client
│   │   └── types/        # TypeScript types
│   └── nginx.conf        # Nginx configuration
├── test/                  # E2E tests
└── docker-compose.yml    # Docker configuration
```

## 🎯 Key Features

### Automations
Create rules like "When Status changes to Done, move to Completed group"

```typescript
// Example automation
{
  triggerType: 'status_change',
  triggerConfig: { columnId: 'status-col', value: 'Done' },
  actionType: 'move_to_group',
  actionConfig: { groupId: 'completed-group' }
}
```

### Drag & Drop
Powered by @dnd-kit for smooth, accessible drag and drop:
- Reorder items within groups
- Move items between groups
- Reorder groups

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Inspired by Monday.com
- Built with amazing open-source tools
- Special thanks to the NestJS and React communities

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review test coverage for examples

---

**Made with ❤️ using NestJS and React**
