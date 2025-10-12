# Pump Management System

A full-stack application for managing pump operations, built with Spring Boot backend and React + TypeScript frontend.

## Tech Stack

### Backend

- **Java 21** - Programming language
- **Spring Boot 3.5.6** - Application framework
- **Spring Data JPA** - Database access
- **Spring Security** - Authentication & authorization
- **MySQL** - Database
- **MapStruct** - Object mapping
- **Lombok** - Boilerplate code reduction
- **JWT (jjwt)** - Token-based authentication
- **Swagger/OpenAPI** - API documentation
- **Maven** - Build tool

### Frontend

- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Radix UI** - UI components
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - HTTP client
- **pnpm** - Package manager

## Prerequisites

Before running this project, make sure you have the following installed:

- **Java 21** or higher ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Maven 3.8+** (included via Maven wrapper `./mvnw`)
- **Node.js 18+** and **pnpm** ([Install pnpm](https://pnpm.io/installation))
- **MySQL 8.0+** database server

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pump-management
```

### 2. Database Setup

#### For Local Development

1. Start your local MySQL server
2. Create a database for development:

```sql
CREATE DATABASE pump_dev;
```

3. Create a local configuration file `backend/src/main/resources/application-dev.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pump_dev
spring.datasource.username=your_local_username
spring.datasource.password=your_local_password
```

4. Run the backend with the dev profile:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### For Production

The production database configuration is already set up in `application.properties`. Contact the team lead for production database credentials.

## Development Mode

In development mode, you run the backend and frontend separately. This allows hot-reloading for both parts of the application.

### Running Backend (Terminal 1)

Navigate to the backend directory and run:

```bash
cd backend
./mvnw spring-boot:run
```

**What this does:**

- Compiles the Java code
- Starts the Spring Boot application on port 9090
- Enables hot-reload with Spring DevTools (automatically restarts on code changes)
- Does NOT build the frontend (optimized for development)

**Backend will be available at:** `http://localhost:9090`

**API Documentation (Swagger UI):** `http://localhost:9090/swagger-ui.html`

#### Alternative: Using your system Maven

If you have Maven installed globally:

```bash
cd backend
mvn spring-boot:run
```

### Running Frontend (Terminal 2)

Navigate to the frontend directory and run:

```bash
cd frontend
pnpm install    # First time only, or after package.json changes
pnpm dev
```

**What this does:**

- `pnpm install` - Installs all Node.js dependencies from package.json
- `pnpm dev` - Starts Vite development server with hot module replacement (HMR)
- Opens at `http://localhost:5173` (default Vite port)
- Automatically reloads browser when you save changes to files

**Frontend will be available at:** `http://localhost:5173`

### Typical Development Workflow

1. Open 2 terminal windows
2. Terminal 1: Run backend (`cd backend && ./mvnw spring-boot:run`)
3. Terminal 2: Run frontend (`cd frontend && pnpm dev`)
4. Open browser to `http://localhost:5173` to see the application
5. Make changes to code - both backend and frontend will hot-reload automatically

## Production Build

For production deployment, you build everything into a single JAR file that includes the frontend.

### Build Production JAR

```bash
cd backend
./mvnw clean package -Pproduction
```

**What this does:**

1. **`clean`** - Removes the `target/` directory to ensure a fresh build
2. **`package`** - Compiles Java code and creates a JAR file
3. **`-Pproduction`** - Activates the production Maven profile which:
   - Runs `pnpm install` in the frontend directory
   - Runs `pnpm build` to create optimized production frontend build
   - Copies the built frontend files into `backend/target/classes/static/`
   - Packages everything into a single executable JAR file

**Output:** `backend/target/pump.jar` - A standalone executable JAR containing both backend and frontend

### Run Production JAR

```bash
cd backend
java -jar target/pump.jar
```

**What this does:**

- Starts the Spring Boot application
- Serves the backend API
- Serves the frontend static files from the JAR
- Everything runs on the same port (8080 by default)

**Application will be available at:** `http://localhost:9090/pump`

The `/pump` path serves the React frontend, and API endpoints are available at their configured paths.

## Useful Commands

### Backend Commands

```bash
# Clean build artifacts
./mvnw clean

# Compile without running
./mvnw compile

# Run tests
./mvnw test

# Package without running tests
./mvnw package -DskipTests

# Package with production frontend (full build)
./mvnw clean package -Pproduction

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Run linter
pnpm lint
```

## Project Structure

```
pump-management/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/          # Java source code
│   │   │   └── resources/     # Application properties, static files
│   │   └── test/              # Unit and integration tests
│   ├── pom.xml                # Maven configuration
│   └── mvnw                   # Maven wrapper script
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── store/            # Zustand state stores
│   │   ├── types/            # TypeScript type definitions
│   │   └── hooks/            # Custom React hooks
│   ├── package.json          # Node.js dependencies
│   └── vite.config.ts        # Vite configuration
└── README.md                  # This file
```

## Troubleshooting

### Backend won't start

- Check if MySQL is running (local for dev, or check network connectivity for production)
- Verify database credentials in `application.properties` or `application-dev.properties`
- Ensure port 9090 is not in use
- Check Java version: `java -version` (should be 21+)
- If using dev profile, make sure `application-dev.properties` exists

### Frontend won't start

- Delete `node_modules` and run `pnpm install` again
- Check if port 5173 is available
- Verify Node.js version: `node -v` (should be 18+)

### Build fails with frontend errors

- Ensure pnpm is installed: `pnpm -v`
- Try running frontend build separately: `cd frontend && pnpm build`
- Check for TypeScript errors: `cd frontend && pnpm build`

### Can't access API from frontend in development

- Ensure backend is running on port 9090
- Check CORS configuration in Spring Boot
- Verify API base URL in frontend service files

## Key Differences: Development vs Production

| Aspect         | Development Mode                      | Production Mode                       |
| -------------- | ------------------------------------- | ------------------------------------- |
| **Frontend**   | Separate dev server (Vite on 5173)    | Bundled in JAR, served by Spring Boot |
| **Backend**    | Spring Boot on 9090                   | Same, but serves frontend too         |
| **Hot Reload** | Yes (both frontend & backend)         | No                                    |
| **Build Time** | Fast (no frontend build)              | Slower (includes frontend build)      |
| **Command**    | `./mvnw spring-boot:run` + `pnpm dev` | `./mvnw package -Pproduction`         |
| **Use Case**   | Active development                    | Deployment/Distribution               |

## Environment Configuration

### Backend Configuration Files

- `application.properties` - Production configuration (DO NOT commit production credentials!)
- `application-dev.properties` - Development-specific settings (create this for local dev)
- Use Spring profiles to switch between environments: `-Dspring-boot.run.profiles=dev`

**Security Note:** Never commit production database credentials to version control. Consider using environment variables or a secrets manager for production deployments.

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:9090
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly (run backend and frontend in development mode)
4. Build production JAR to ensure everything works together
5. Submit a pull request

## License

[Your License Here]

## Support

For questions or issues, please contact [your contact information].
